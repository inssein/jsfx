namespace jsfx.filter {
  /**
   * @filter         Sepia
   * @description    Gives the image a reddish-brown monochrome tint that imitates an old photograph.
   * @param amount   0 to 1 (0 for no effect, 1 for full sepia coloring)
   */
  export class Sepia extends jsfx.Filter {
    constructor(amount? : number) {
      super(null, `
            uniform sampler2D texture;
            uniform float amount;
            varying vec2 texCoord;

            void main() {
                vec4 color = texture2D(texture, texCoord);
                float r = color.r;
                float g = color.g;
                float b = color.b;

                color.r = min(1.0, (r * (1.0 - (0.607 * amount))) + (g * (0.769 * amount)) + (b * (0.189 * amount)));
                color.g = min(1.0, (r * 0.349 * amount) + (g * (1.0 - (0.314 * amount))) + (b * 0.168 * amount));
                color.b = min(1.0, (r * 0.272 * amount) + (g * 0.534 * amount) + (b * (1.0 - (0.869 * amount))));

                gl_FragColor = color;
            }
        `);

      // set properties
      this.properties.amount = jsfx.Filter.clamp(-1, amount, 1) || 0;
    }

    public drawCanvas(imageData : ImageData) : ImageData {
      var pixels = imageData.data;
      var amount = this.properties.amount;
      var r, g, b;

      for (var i = 0; i < pixels.length; i += 4) {
        r = pixels[i] / 255;
        g = pixels[i + 1] / 255;
        b = pixels[i + 2] / 255;

        pixels[i] = Math.min(1.0, (r * (1.0 - (0.607 * amount))) + (g * (0.769 * amount)) + (b * (0.189 * amount))) * 255;
        pixels[i + 1] = Math.min(1.0, (r * 0.349 * amount) + (g * (1.0 - (0.314 * amount))) + (b * 0.168 * amount)) * 255;
        pixels[i + 2] = Math.min(1.0, (r * 0.272 * amount) + (g * 0.534 * amount) + (b * (1.0 - (0.869 * amount)))) * 255;
      }

      return imageData;
    }
  }
}
