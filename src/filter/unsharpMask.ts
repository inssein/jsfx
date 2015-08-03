namespace jsfx.filter {
  declare var Uint8ClampedArray : any;

  /**
   * @filter         Unsharp Mask
   * @description    A form of image sharpening that amplifies high-frequencies in the image. It
   *                 is implemented by scaling pixels away from the average of their neighbors.
   * @param radius   0 to 180 - The blur radius that calculates the average of the neighboring pixels.
   * @param strength A scale factor where 0 is no effect and higher values cause a stronger effect.
   */
  export class UnsharpMask extends jsfx.Filter {
    constructor(radius? : number, strength ? : number) {
      super(null, `
            uniform sampler2D blurredTexture;
            uniform sampler2D originalTexture;
            uniform float strength;
            uniform float threshold;
            varying vec2 texCoord;

            void main() {
                vec4 blurred = texture2D(blurredTexture, texCoord);
                vec4 original = texture2D(originalTexture, texCoord);
                gl_FragColor = mix(blurred, original, 1.0 + strength);
            }
        `);

      // set properties
      this.properties.radius = radius;
      this.properties.strength = strength;
    }

    drawWebGL(renderer : jsfx.webgl.Renderer) {
      var shader = renderer.getShader(this);
      var radius = this.properties.radius;
      var strength = this.properties.strength;

      // create a new texture
      var extraTexture = renderer.createTexture();

      // use a texture and draw to it
      renderer.getTexture().use();
      extraTexture.drawTo(renderer.getDefaultShader().drawRect.bind(renderer.getDefaultShader()));

      // blur current texture
      extraTexture.use(1);

      // draw the blur
      var blur = new Blur(radius);
      blur.drawWebGL(renderer);

      // use the stored texture to detect edges
      shader.textures({
        originalTexture: 1
      });

      renderer.getTexture().use();
      renderer.getNextTexture().drawTo(function () {
        shader.uniforms({strength: strength}).drawRect();
      });

      extraTexture.unuse(1);
    }

    public drawCanvas(imageData : ImageData) : ImageData {
      var pixels = imageData.data;

      // props
      var radius = this.properties.radius;
      var strength = this.properties.strength + 1;

      // clone of data
      // @todo: declared my own Uint8ClampedArray above since I am having issues with TypeScript.
      // additionally, my previous called imageData.data.set(original) (which I also can't here because of TS mapping)
      var original = new Uint8ClampedArray(imageData.data);
      imageData.data = original;

      // blur image
      var blur = new Blur(radius);
      blur.drawCanvas(imageData);

      // trying to replicate mix() from webgl, which is basically x * (1 -a)
      for (var i = 0; i < pixels.length; i += 4) {
        pixels[i] = pixels[i] * (1 - strength) + original[i] * strength;
        pixels[i + 1] = pixels[i + 1] * (1 - strength) + original[i + 1] * strength;
        pixels[i + 2] = pixels[i + 2] * (1 - strength) + original[i + 2] * strength;
      }

      return imageData;
    }
  }
}
