/**
 * @filter           Brightness / Contrast
 * @description      Provides additive brightness and multiplicative contrast control.
 * @param brightness -1 to 1 (-1 is solid black, 0 is no change, and 1 is solid white)
 * @param contrast   -1 to 1 (-1 is solid gray, 0 is no change, and 1 is maximum contrast)
 */
module jsfx.filter {
  export class BrightnessContrast extends jsfx.Filter {
    constructor(brightness : number, contrast : number) {
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

      var brightness = this.properties.brightness * 255;
      var contrast = this.properties.contrast * 255;

      // the contrast is applied slightly differently than the webgl variant, mostly because since webGL uses
      // 0's and 1's, the math becomes different when multiplying / dividing.
      var factor = (255 * (contrast + 255)) / (255 * (255 - contrast));

      for (var i = 0; i < pixels.length; i += 4) {
        // apply brightness
        pixels[i] += brightness;
        pixels[i + 1] += brightness;
        pixels[i + 2] += brightness;

        // apply contrast
        pixels[i] = factor * (pixels[i] - 128) + 128;
        pixels[i + 1] = factor * (pixels[i + 1] - 128) + 128;
        pixels[i + 2] = factor * (pixels[i + 2] - 128) + 128;
      }

      return imageData;
    }
  }
}
