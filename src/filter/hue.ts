namespace jsfx.filter {
  /**
   * @filter           Hue / Saturation
   * @description      Provides rotational hue control. RGB color space
   *                   can be imagined as a cube where the axes are the red, green, and blue color
   *                   values. Hue changing works by rotating the color vector around the grayscale
   *                   line, which is the straight line from black (0, 0, 0) to white (1, 1, 1).
   * @param hue        -1 to 1 (-1 is 180 degree rotation in the negative direction, 0 is no change,
   *                   and 1 is 180 degree rotation in the positive direction)
   */
  export class Hue extends IterableFilter {
    private weights : jsfx.util.Vector3;

    constructor(hue? : number) {
      super(null, `
            uniform sampler2D texture;
            uniform float hue;
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

                gl_FragColor = color;
            }
        `);

      // set properties
      this.properties.hue = Filter.clamp(-1, hue, 1) || 0;

      // pre-calculate data for canvas iteration
      var angle = hue * 3.14159265;
      var sin = Math.sin(angle);
      var cos = Math.cos(angle);
      this.weights = new jsfx.util.Vector3(2 * cos, -Math.sqrt(3.0) * sin - cos, Math.sqrt(3.0) * sin - cos)
        .addScalar(1.0)
        .divideScalar(3.0);
    }

    public iterateCanvas(helper : jsfx.util.ImageDataHelper) : void {
      var rgb : jsfx.util.Vector3 = helper.toVector3();

      helper.r = rgb.dot(this.weights);
      helper.g = rgb.dotScalars(this.weights.z, this.weights.x, this.weights.y);
      helper.b = rgb.dotScalars(this.weights.y, this.weights.z, this.weights.x);
    }
  }
}
