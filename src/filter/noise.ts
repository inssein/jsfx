namespace jsfx.filter {
  /**
   * @filter         Noise
   * @description    Adds black and white noise to the image.
   * @param amount   0 to 1 (0 for no effect, 1 for maximum noise)
   */
  export class Noise extends jsfx.IterableFilter {
    protected width : number;

    constructor(amount : number) {
      super(null, `
            uniform sampler2D texture;
            uniform float amount;
            varying vec2 texCoord;

            float rand(vec2 co) {
                return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
            }

            void main() {
                vec4 color = texture2D(texture, texCoord);

                float diff = (rand(texCoord) - 0.5) * amount;
                color.r += diff;
                color.g += diff;
                color.b += diff;

                gl_FragColor = color;
            }
        `);

      // set properties
      this.properties.amount = jsfx.Filter.clamp(-1, amount, 1) || 0;
    }

    public drawCanvas(renderer : jsfx.canvas.Renderer) : void {
      this.width = renderer.getSource().width;

      super.drawCanvas(renderer);
    }

    public iterateCanvas(helper : jsfx.util.ImageDataHelper) : void {
      var amount = this.properties.amount;
      var x = (helper.getIndex() / 4) % this.width;
      var y = Math.floor((helper.getIndex() / 4) / this.width);
      var v : jsfx.util.Vector2 = new jsfx.util.Vector2(x, y);
      var diff = (Noise.rand(v) - 0.5) * amount;

      helper.r += diff;
      helper.g += diff;
      helper.b += diff;
    }

    private static rand(v : jsfx.util.Vector2) : number {
      return Noise.fract(Math.sin(v.dotScalars(12.9898, 78.233)) * 43758.5453);
    }

    private static fract(x : number) : number {
      return x - Math.floor(x);
    }
  }
}
