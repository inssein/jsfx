namespace jsfx.filter {
  /**
   * @filter           Hue / Saturation
   * @description      Provides multiplicative saturation control. RGB color space
   *                   can be imagined as a cube where the axes are the red, green, and blue color
   *                   values.
   *                   Saturation is implemented by scaling all color channel values either toward
   *                   or away from the average color channel value.
   * @param saturation -1 to 1 (-1 is solid gray, 0 is no change, and 1 is maximum contrast)
   */
  export class Saturation extends IterableFilter {
    constructor(saturation? : number) {
      super(null, `
            uniform sampler2D texture;
            uniform float saturation;
            varying vec2 texCoord;

            void main() {
                vec4 color = texture2D(texture, texCoord);

                float average = (color.r + color.g + color.b) / 3.0;
                if (saturation > 0.0) {
                    color.rgb += (average - color.rgb) * (1.0 - 1.0 / (1.001 - saturation));
                } else {
                    color.rgb += (average - color.rgb) * (-saturation);
                }

                gl_FragColor = color;
            }
        `);

      // set properties
      this.properties.saturation = Filter.clamp(-1, saturation, 1) || 0;
    }

    public iterateCanvas(helper : jsfx.util.ImageDataHelper) : void {
      var saturation : number = this.properties.saturation;
      var average : number = (helper.r + helper.g + helper.b) / 3;

      if (saturation > 0) {
        helper.r += (average - helper.r) * (1 - 1 / (1.001 - saturation));
        helper.g += (average - helper.g) * (1 - 1 / (1.001 - saturation));
        helper.b += (average - helper.b) * (1 - 1 / (1.001 - saturation));
      } else {
        helper.r += (average - helper.r) * (-saturation);
        helper.g += (average - helper.g) * (-saturation);
        helper.b += (average - helper.b) * (-saturation);
      }
    }
  }
}
