namespace jsfx.filter {
  /**
   * @filter           Brightness
   * @description      Provides additive brightness control.
   * @param brightness -1 to 1 (-1 is solid black, 0 is no change, and 1 is solid white)
   */
  export class Brightness extends IterableFilter {
    constructor(brightness? : number) {
      super(null, `
            uniform sampler2D texture;
            uniform float brightness;
            varying vec2 texCoord;

            void main() {
                vec4 color = texture2D(texture, texCoord);
                color.rgb += brightness;

                gl_FragColor = color;
            }
        `);

      // set properties
      this.properties.brightness = Filter.clamp(-1, brightness, 1) || 0;
    }

    public iterateCanvas(helper : jsfx.util.ImageDataHelper) : void {
      var brightness = this.properties.brightness;

      helper.r += brightness;
      helper.g += brightness;
      helper.b += brightness;
    }
  }
}
