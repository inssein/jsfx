namespace jsfx.filter {
  /**
   * @filter           Hue / Saturation
   * @description      Provides rotational hue and multiplicative saturation control. RGB color space
   *                   can be imagined as a cube where the axes are the red, green, and blue color
   *                   values. Hue changing works by rotating the color vector around the grayscale
   *                   line, which is the straight line from black (0, 0, 0) to white (1, 1, 1).
   *                   Saturation is implemented by scaling all color channel values either toward
   *                   or away from the average color channel value.
   * @param hue        -1 to 1 (-1 is 180 degree rotation in the negative direction, 0 is no change,
   *                   and 1 is 180 degree rotation in the positive direction)
   * @param saturation -1 to 1 (-1 is solid gray, 0 is no change, and 1 is maximum contrast)
   */
  export class HueSaturation extends jsfx.Filter {
    constructor(hue? : number, saturation? : number) {
      super(null, `
            uniform sampler2D texture;
            uniform float hue;
            uniform float saturation;
            varying vec2 texCoord;

            void main() {
                vec4 color = texture2D(texture, texCoord);

                /* hue adjustment, wolfram alpha: RotationTransform[angle, {1, 1, 1}][{x, y, z}] */
                float angle = hue * 3.14159265;
                float s = sin(angle), c = cos(angle);
                vec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c) + 1.0) / 3.0;
                color.rgb = vec3(
                    dot(color.rgb, weights.xyz),
                    dot(color.rgb, weights.zxy),
                    dot(color.rgb, weights.yzx)
                );

                /* saturation adjustment */
                float average = (color.r + color.g + color.b) / 3.0;
                if (saturation > 0.0) {
                    color.rgb += (average - color.rgb) * (1.0 - 1.0 / (1.001 - saturation));
                } else {
                    color.rgb += (average - color.rgb) * (-saturation);
                }

                gl_FragColor = color;
            }
        `);

      // set properties
      this.properties.hue = jsfx.Filter.clamp(-1, hue, 1) || 0;
      this.properties.saturation = jsfx.Filter.clamp(-1, saturation, 1) || 0;
    }

    public drawCanvas(imageData : ImageData) : ImageData {
      var pixels = imageData.data;
      var hue = this.properties.hue;
      var saturation = this.properties.saturation;

      var angle = hue * 3.14159265;
      var sin = Math.sin(angle);
      var cos = Math.cos(angle);

      var average, r, g, b, rgb, weights;

      for (var i = 0; i < pixels.length; i += 4) {
        if (hue) {
          rgb = new jsfx.util.Vector3(pixels[i] / 255, pixels[i + 1] / 255, pixels[i + 2] / 255);

          // apply hue
          weights = new jsfx.util.Vector3(2 * cos, -Math.sqrt(3.0) * sin - cos, Math.sqrt(3.0) * sin - cos);

          // add 1 and average the vector
          weights
            .addScalar(1.0)
            .divideScalar(3.0);

          // set rgb
          r = rgb.dot(weights);
          g = rgb.dotScalars(weights.z, weights.x, weights.y);
          b = rgb.dotScalars(weights.y, weights.z, weights.x);
        } else {
          r = pixels[i] / 255;
          g = pixels[i + 1] / 255;
          b = pixels[i + 2] / 255;
        }

        // apply saturation
        average = (r + g + b) / 3;

        if (saturation > 0) {
          r += (average - r) * (1 - 1 / (1.001 - saturation));
          g += (average - g) * (1 - 1 / (1.001 - saturation));
          b += (average - b) * (1 - 1 / (1.001 - saturation));
        } else {
          r += (average - r) * (-saturation);
          g += (average - g) * (-saturation);
          b += (average - b) * (-saturation);
        }

        // set values
        pixels[i] = r * 255;
        pixels[i + 1] = g * 255;
        pixels[i + 2] = b * 255;
      }

      return imageData;
    }
  }
}
