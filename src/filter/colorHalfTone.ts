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
  export class ColorHalfTone extends jsfx.IterableFilter {
    constructor(protected centerX : number, protected centerY : number, angle : number, size : number) {
      super(null, `
            uniform sampler2D texture;
            uniform vec2 center;
            uniform float angle;
            uniform float scale;
            uniform vec2 texSize;
            varying vec2 texCoord;

            float pattern(float angle) {
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
                vec3 cmy = 1.0 - color.rgb;
                float k = min(cmy.x, min(cmy.y, cmy.z));
                cmy = (cmy - k) / (1.0 - k);
                cmy = clamp(cmy * 10.0 - 3.0 + vec3(pattern(angle + 0.26179), pattern(angle + 1.30899), pattern(angle)), 0.0, 1.0);
                k = clamp(k * 10.0 - 5.0 + pattern(angle + 0.78539), 0.0, 1.0);
                gl_FragColor = vec4(1.0 - cmy - k, color.a);
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

    public static pattern(angle : number, x : number, y : number, centerX : number, centerY : number, scale : number) {
      // float s = sin(angle), c = cos(angle);
      var s : number = Math.sin(angle);
      var c : number = Math.cos(angle);

      // vec2 tex = texCoord * texSize - center;
      // texCoord in webgl is between 0 and 1
      var tX : number = x - centerX;
      var tY : number = y - centerY;

      //vec2 point = vec2(
      //    c * tex.x - s * tex.y,
      //    s * tex.x + c * tex.y
      //  ) * scale;
      //return (sin(point.x) * sin(point.y)) * 4.0;
      return (Math.sin((c * tX - s * tY) * scale) * Math.sin((s * tX + c * tY) * scale)) * 4;
    }

    public iterateCanvas(helper : jsfx.util.ImageDataHelper) : void {
      var angle = this.properties.angle;
      var imageData = helper.getImageData();
      var x = (helper.getIndex() / 4) % imageData.width;
      var y = Math.floor((helper.getIndex() / 4) / imageData.width);
      var pattern = (angle : number) : number => {
        return ColorHalfTone.pattern(angle, x, y, this.centerX, this.centerY, this.properties.scale);
      };

      // vec3 cmy = 1.0 - color.rgb;
      var r = 1 - helper.r;
      var g = 1 - helper.g;
      var b = 1 - helper.b;

      // float k = min(cmy.x, min(cmy.y, cmy.z));
      var k = Math.min(r, Math.min(g, b));

      // cmy = (cmy - k) / (1.0 - k);
      r = (r - k) / (1 - k);
      g = (g - k) / (1 - k);
      b = (b - k) / (1 - k);

      // cmy = clamp(cmy * 10.0 - 3.0 + vec3(pattern(angle + 0.26179), pattern(angle + 1.30899), pattern(angle)), 0.0, 1.0);
      r = Filter.clamp(0, r * 10 - 3 + pattern(angle + 0.26179), 1);
      g = Filter.clamp(0, g * 10 - 3 + pattern(angle + 1.30899), 1);
      b = Filter.clamp(0, b * 10 - 3 + pattern(angle), 1);

      // k = clamp(k * 10.0 - 5.0 + pattern(angle + 0.78539), 0.0, 1.0);
      k = Filter.clamp(0, k * 10 - 5 + pattern(angle + 0.78539), 1);

      // gl_FragColor = vec4(1.0 - cmy - k, color.a);
      helper.r = 1 - r - k;
      helper.g = 1 - g - k;
      helper.b = 1 - b - k;
    }
  }
}
