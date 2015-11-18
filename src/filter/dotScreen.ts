namespace jsfx.filter {
  /**
   * @filter        Color Halftone
   * @description   Simulates a CMYK halftone rendering of the image by multiplying pixel values
   *                with a four rotated 2D sine wave patterns, one each for cyan, magenta, yellow,
   *                and black.
   * @param centerX The x coordinate of the pattern origin.
   * @param centerY The y coordinate of the pattern origin.
   * @param angle   The rotation of the pattern in radians.
   * @param size    The diameter of a dot in pixels.
   */
  export class DotScreen extends IterableFilter {
    constructor(protected centerX : number, protected centerY : number, angle : number, size : number) {
      super(null, `
            uniform sampler2D texture;
            uniform vec2 center;
            uniform float angle;
            uniform float scale;
            uniform vec2 texSize;
            varying vec2 texCoord;

            float pattern() {\
                float s = sin(angle), c = cos(angle);
                vec2 tex = texCoord * texSize - center;
                vec2 point = vec2(
                    c * tex.x - s * tex.y,
                    s * tex.x + c * tex.y
                ) * scale;

                return (sin(point.x) * sin(point.y)) * 4.0;
            }

            void main() {
                vec4 color = texture2D(texture, texCoord);
                float average = (color.r + color.g + color.b) / 3.0;
                gl_FragColor = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);
            }
        `);

      // set properties
      this.properties.angle = Filter.clamp(0, angle, Math.PI / 2);
      this.properties.scale = Math.PI / size;
    }

    public drawWebGL(renderer : jsfx.webgl.Renderer) : void {
      var shader = renderer.getShader(this);
      var properties = this.getProperties();

      // add texture size
      properties.texSize = [renderer.getSource().width, renderer.getSource().width];
      properties.center = [this.centerX, this.centerY];

      renderer.getTexture().use();
      renderer.getNextTexture().drawTo(function () {
        shader.uniforms(properties).drawRect();
      });
    }

    public iterateCanvas(helper : jsfx.util.ImageDataHelper) : void {
      var imageData = helper.getImageData();
      var x = (helper.getIndex() / 4) % imageData.width;
      var y = Math.floor((helper.getIndex() / 4) / imageData.width);

      // float average = (color.r + color.g + color.b) / 3.0;
      var average : number = (helper.r + helper.g + helper.b) / 3;

      // gl_FragColor = vec4(vec3(average * 10.0 - 5.0 + pattern()), color.a);
      var pattern : number = ColorHalfTone.pattern(this.properties.angle, x, y, this.centerX, this.centerY, this.properties.scale);
      var value : number = average * 10 - 5 + pattern;

      helper.r = value;
      helper.g = value;
      helper.b = value;
    }
  }
}
