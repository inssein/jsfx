namespace jsfx.filter {
  /**
   * @filter           Brightness / Contrast
   * @description      Provides additive brightness and multiplicative contrast control.
   * @param brightness -1 to 1 (-1 is solid black, 0 is no change, and 1 is solid white)
   * @param contrast   -1 to 1 (-1 is solid gray, 0 is no change, and 1 is maximum contrast)
   */
  export class BrightnessContrast extends jsfx.Filter {
    constructor(brightness? : number, contrast? : number) {
      super(null, `
            uniform sampler2D texture;
            uniform float brightness;
            uniform float contrast;
            varying vec2 texCoord;

            void main() {
                vec4 color = texture2D(texture, texCoord);
                color.rgb += brightness;

                if (contrast > 0.0) {
                    color.rgb = (color.rgb - 0.5) / (1.0 - contrast) + 0.5;
                } else {
                    color.rgb = (color.rgb - 0.5) * (1.0 + contrast) + 0.5;
                }

                gl_FragColor = color;
            }
        `);

      // set properties
      this.properties.brightness = jsfx.Filter.clamp(-1, brightness, 1) || 0;
      this.properties.contrast = jsfx.Filter.clamp(-1, contrast, 1) || 0;
    }

    public drawCanvas(imageData : ImageData) : ImageData {
      var pixels = imageData.data;
      var brightness = this.properties.brightness;
      var contrast = this.properties.contrast;
      var r, g, b;

      for (var i = 0; i < pixels.length; i += 4) {
        // get color values
        r = pixels[i] / 255;
        g = pixels[i + 1] / 255;
        b = pixels[i + 2] / 255;

        // apply brightness
        r += brightness;
        g += brightness;
        b += brightness;

        // apply contrast
        if (contrast > 0) {
          r = (r - 0.5) / (1 - contrast) + 0.5;
          g = (g - 0.5) / (1 - contrast) + 0.5;
          b = (b - 0.5) / (1 - contrast) + 0.5;
        } else {
          r = (r - 0.5) * (1 + contrast) + 0.5;
          g = (g - 0.5) * (1 + contrast) + 0.5;
          b = (b - 0.5) * (1 + contrast) + 0.5;
        }

        // set color values
        pixels[i] = r * 255;
        pixels[i + 1] = g * 255;
        pixels[i + 2] = b * 255;
      }

      return imageData;
    }
  }
}
