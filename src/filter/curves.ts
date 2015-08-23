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
  export class Curves extends jsfx.Filter {
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

    public drawCanvas(renderer : jsfx.canvas.Renderer) : void {
      var imageData : ImageData = renderer.getImageData();
      var pixels : number[] = imageData.data;
      var amount : number = this.properties.amount;
      var r : number, g : number, b : number;

      for (var i = 0; i < pixels.length; i += 4) {
        // get color values
        r = pixels[i] / 255;
        g = pixels[i + 1] / 255;
        b = pixels[i + 2] / 255;

        r = Math.min(1.0, (r * (1 - (0.607 * amount))) + (g * (0.769 * amount)) + (b * (0.189 * amount)));
        g = Math.min(1.0, (r * 0.349 * amount) + (g * (1 - (0.314 * amount))) + (b * 0.168 * amount));
        b = Math.min(1.0, (r * 0.272 * amount) + (g * 0.534 * amount) + (b * (1 - (0.869 * amount))));

        // set values
        pixels[i] = r * 255;
        pixels[i + 1] = g * 255;
        pixels[i + 2] = b * 255;
      }
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
