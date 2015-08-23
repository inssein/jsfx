namespace jsfx.filter {
  /**
   * @filter       Vibrance
   * @description  Modifies the saturation of desaturated colors, leaving saturated colors unmodified.
   * @param amount -1 to 1 (-1 is minimum vibrance, 0 is no change, and 1 is maximum vibrance)
   */
  export class Vibrance extends jsfx.IterableFilter {
    constructor(amount : number) {
      super(null, `
            uniform sampler2D texture;
            uniform float amount;
            varying vec2 texCoord;
            void main() {
                vec4 color = texture2D(texture, texCoord);
                float average = (color.r + color.g + color.b) / 3.0;
                float mx = max(color.r, max(color.g, color.b));
                float amt = (mx - average) * (-amount * 3.0);
                color.rgb = mix(color.rgb, vec3(mx), amt);
                gl_FragColor = color;
            }
        `);

      // set properties
      this.properties.amount = jsfx.Filter.clamp(-1, amount, 1);
    }

    public iterateCanvas(helper : jsfx.util.ImageDataHelper) : void {
      var amount = this.properties.amount;
      var average = (helper.r + helper.g + helper.b) / 3.0;
      var mx = Math.max(helper.r, Math.max(helper.g, helper.b));

      helper.mix(mx, mx, mx, (mx - average) * (-amount * 3.0));
    }
  }
}
