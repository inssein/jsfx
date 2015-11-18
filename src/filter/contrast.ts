namespace jsfx.filter {
  /**
   * @filter           Contrast
   * @description      Provides multiplicative contrast control.
   * @param contrast   -1 to 1 (-1 is solid gray, 0 is no change, and 1 is maximum contrast)
   */
  export class Contrast extends IterableFilter {
    constructor(contrast? : number) {
      super(null, `
            uniform sampler2D texture;
            uniform float contrast;
            varying vec2 texCoord;

            void main() {
                vec4 color = texture2D(texture, texCoord);

                if (contrast > 0.0) {
                    color.rgb = (color.rgb - 0.5) / (1.0 - contrast) + 0.5;
                } else {
                    color.rgb = (color.rgb - 0.5) * (1.0 + contrast) + 0.5;
                }

                gl_FragColor = color;
            }
        `);

      // set properties
      this.properties.contrast = Filter.clamp(-1, contrast, 1) || 0;
    }

    public iterateCanvas(helper : jsfx.util.ImageDataHelper) : void {
      var contrast = this.properties.contrast;

      if (contrast > 0) {
        helper.r = (helper.r - 0.5) / (1 - contrast) + 0.5;
        helper.g = (helper.g - 0.5) / (1 - contrast) + 0.5;
        helper.b = (helper.b - 0.5) / (1 - contrast) + 0.5;
      } else {
        helper.r = (helper.r - 0.5) * (1 + contrast) + 0.5;
        helper.g = (helper.g - 0.5) * (1 + contrast) + 0.5;
        helper.b = (helper.b - 0.5) * (1 + contrast) + 0.5;
      }
    }
  }
}
