namespace jsfx.filter {
  declare var Uint8ClampedArray : any;

  /**
   * @todo While this filter is fast in WebGL, it is terribly slow in Canvas due to the complexity of the 9x9 box filter.
   *
   * @filter         Denoise
   * @description    Smooths over grainy noise in dark images using an 9x9 box filter
   *                 weighted by color intensity, similar to a bilateral filter.
   * @param exponent The exponent of the color intensity difference, should be greater
   *                 than zero. A value of zero just gives an 9x9 box blur and high values
   *                 give the original image, but ideal values are usually around 10-20.
   */
  export class Denoise extends Filter {
    constructor(exponent : number) {
      super(null, `
            uniform sampler2D texture;
            uniform float exponent;
            uniform float strength;
            uniform vec2 texSize;
            varying vec2 texCoord;

            void main() {
                vec4 center = texture2D(texture, texCoord);
                vec4 color = vec4(0.0);
                float total = 0.0;

                for (float x = -4.0; x <= 4.0; x += 1.0) {
                    for (float y = -4.0; y <= 4.0; y += 1.0) {
                        vec4 sample = texture2D(texture, texCoord + vec2(x, y) / texSize);
                        float weight = 1.0 - abs(dot(sample.rgb - center.rgb, vec3(0.25)));
                        weight = pow(weight, exponent);
                        color += sample * weight;
                        total += weight;
                    }
                }

                gl_FragColor = color / total;
            }
        `);

      // set properties
      this.properties.exponent = exponent;
    }

    public drawWebGL(renderer : jsfx.webgl.Renderer) : void {
      var shader = renderer.getShader(this);
      var properties = this.getProperties();

      // add texture size
      properties.texSize = [renderer.getSource().width, renderer.getSource().width];

      renderer.getTexture().use();
      renderer.getNextTexture().drawTo(function () {
        shader.uniforms(properties).drawRect();
      });
    }

    public drawCanvas(renderer : jsfx.canvas.Renderer) : void {
      var exponent = this.properties.exponent;
      var imageData : ImageData = renderer.getImageData();
      var pixels = imageData.data;
      var original : number[] = new Uint8ClampedArray(imageData.data);

      // variables
      var x:number, y: number, dstOff : number, color : number[], total : number, cx : number, cy : number, scx : number, scy : number, srcOff : number, weight : number;

      for (x = 0; x < imageData.width; x++) {
        for (y = 0; y < imageData.height; y++) {

          dstOff = (y * imageData.width + x) * 4;
          color = [0, 0, 0, 0];
          total = 0;

          for (cx = -4; cx <= 4; cx += 1) {
            for (cy = -4; cy <= 4; cy += 1) {

              scx = Math.min(imageData.width - 1, Math.max(0, x + cx));
              scy = Math.min(imageData.height - 1, Math.max(0, y + cy));
              srcOff = (scx + scy * imageData.width) * 4;

              // calculate the weight
              weight = Math.pow(
                1.0 - Math.abs(
                  (original[srcOff] / 255 - original[dstOff] / 255) * 0.25
                  + (original[srcOff + 1] / 255 - original[dstOff + 1] / 255) * 0.25
                  + (original[srcOff + 2] / 255 - original[dstOff + 2] / 255) * 0.25
                ),
                exponent
              );

              // color += sample * weight
              color[0] += original[srcOff] / 255 * weight;
              color[1] += original[srcOff + 1] / 255 * weight;
              color[2] += original[srcOff + 2] / 255 * weight;
              color[3] += original[srcOff + 3] / 255 * weight;

              total += weight;
            }
          }

          pixels[dstOff] = (color[0] / total) * 255;
          pixels[dstOff + 1] = (color[1] / total) * 255;
          pixels[dstOff + 2] = (color[2] / total) * 255;
          pixels[dstOff + 3] = (color[3] / total) * 255;
        }
      }
    }
  }
}
