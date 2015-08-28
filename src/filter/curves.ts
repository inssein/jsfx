namespace jsfx.filter {
  /**
   * @filter      Curves
   * @description A powerful mapping tool that transforms the colors in the image
   *              by an arbitrary function. The function is interpolated between
   *              a set of 2D points using splines. The curves filter can take
   *              either one or three arguments which will apply the mapping to
   *              either luminance or RGB values, respectively.
   * @param red   A list of points that define the function for the red channel.
   *              Each point is a list of two values: the value before the mapping
   *              and the value after the mapping, both in the range 0 to 1. For
   *              example, [[0,1], [1,0]] would invert the red channel while
   *              [[0,0], [1,1]] would leave the red channel unchanged. If green
   *              and blue are omitted then this argument also applies to the
   *              green and blue channels.
   * @param green (optional) A list of points that define the function for the green
   *              channel (just like for red).
   * @param blue  (optional) A list of points that define the function for the blue
   *              channel (just like for red).
   */
  export class Curves extends jsfx.IterableFilter {
    constructor(private red : number[], private green : number[], private blue : number[]) {
      super(null, `
            uniform sampler2D texture;
            uniform sampler2D map;
            varying vec2 texCoord;

            void main() {
                vec4 color = texture2D(texture, texCoord);
                color.r = texture2D(map, vec2(color.r)).r;
                color.g = texture2D(map, vec2(color.g)).g;
                color.b = texture2D(map, vec2(color.b)).b;
                gl_FragColor = color;
            }
        `);

      // interpolate
      red = Curves.splineInterpolate(red);

      if (arguments.length == 1) {
        green = blue = red;
      } else {
        green = Curves.splineInterpolate(green);
        blue = Curves.splineInterpolate(blue);
      }

      this.red = red;
      this.green = green;
      this.blue = blue;
    }

    drawWebGL(renderer : jsfx.webgl.Renderer) : void {
      // create texture data
      var array = [];
      for (var i = 0; i < 256; i++) {
          array.splice(array.length, 0, this.red[i], this.green[i], this.blue[i], 255);
      }

      // create a new texture
      var extraTexture = renderer.createTexture();

      // set ramp texture data
      extraTexture.initFromBytes(256, 1, array);

      // use the texture
      extraTexture.use(1);

      // get the shader
      var shader = renderer.getShader(this);

      // set shader textures
      shader.textures({
          map: 1
      });

      // render
      renderer.getTexture().use();
      renderer.getNextTexture().drawTo(function () {
          shader.uniforms({}).drawRect();
      });
    }

    public iterateCanvas(helper : jsfx.util.ImageDataHelper) : void {
      var i : number = helper.getIndex();

      helper.r = this.red[helper.r * 255] / 255;
      helper.g = this.green[helper.g * 255] / 255;
      helper.b = this.blue[helper.b * 255] / 255;
    }

    static splineInterpolate(points) {
      var interpolator = new jsfx.util.SplineInterpolator(points);
      var array = [];

      for (var i = 0; i < 256; i++) {
        array.push(Filter.clamp(0, Math.floor(interpolator.interpolate(i / 255) * 256), 255));
      }

      return array;
    }
  }
}
