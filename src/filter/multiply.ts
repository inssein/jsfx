namespace jsfx.filter {
  /**
   * @filter           Multiply
   */
  export class Multiply extends jsfx.IterableFilter {
    constructor(protected r : number, protected g : number, protected b : number) {
      super(null, `
            uniform sampler2D texture;
            uniform float r;
            uniform float g;
            uniform float b;
            varying vec2 texCoord;

            void main() {
                vec4 color = texture2D(texture, texCoord);
                color.r *= r;
                color.g *= g;
                color.b *= b;

                gl_FragColor = color;
            }
        `);

      // set properties
      this.properties.r = jsfx.Filter.clamp(0, r, 1);
      this.properties.g = jsfx.Filter.clamp(0, g, 1);
      this.properties.b = jsfx.Filter.clamp(0, b, 1);
    }

    public iterateCanvas(helper : jsfx.util.ImageDataHelper) : void {
      helper.r *= this.properties.r;
      helper.g *= this.properties.g;
      helper.b *= this.properties.b;
    }
  }
}
