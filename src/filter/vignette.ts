namespace jsfx.filter {
  /**
   * @filter         Vignette
   * @description    Adds a simulated lens edge darkening effect.
   * @param size     0 to 1 (0 for center of frame, 1 for edge of frame)
   * @param amount   0 to 1 (0 for no effect, 1 for maximum lens darkening)
   */
  export class Vignette extends IterableFilter {
    constructor(size : number, amount : number) {
      super(null, `
            uniform sampler2D texture;
            uniform float size;
            uniform float amount;
            varying vec2 texCoord;

            void main() {
                vec4 color = texture2D(texture, texCoord);

                float dist = distance(texCoord, vec2(0.5, 0.5));
                color.rgb *= smoothstep(0.8, size * 0.799, dist * (amount + size));

                gl_FragColor = color;
            }
        `);

      // set properties
      this.properties.size = Filter.clamp(0, size, 1);
      this.properties.amount = Filter.clamp(0, amount, 1);
    }

    public iterateCanvas(helper : jsfx.util.ImageDataHelper) : void {
      var size : number = this.properties.size;
      var amount : number = this.properties.amount;

      var imageData : ImageData = helper.getImageData();
      var x = (helper.getIndex() / 4) % imageData.width;
      var y = Math.floor((helper.getIndex() / 4) / imageData.width);

      var distance = Vignette.distance(x / imageData.width, y / imageData.height, 0.5, 0.5);
      var amount : number = Vignette.smoothstep(0.8, size * 0.799, distance * (amount + size));

      helper.r *= amount;
      helper.g *= amount;
      helper.b *= amount;
    }

    protected static distance(x1 : number, y1 : number, x2 : number, y2 : number) : number {
      return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
    }

    protected static smoothstep(min : number, max : number, value : number) {
      var x = Math.max(0, Math.min(1, (value - min) / (max - min)));
      return x * x * (3 - 2 * x);
    }
  }
}
