namespace jsfx {
  export class Filter implements jsfx.FilterInterface {
    protected properties : any = {};

    constructor(private vertexSource : string = null, private fragmentSource : string = null) {
    }

    /**
     * Returns all the properties of the shader. Useful for drawWebGl when are are just passing along data
     * to the shader.
     *
     * @returns {{}|*}
     */
    public getProperties() : any {
      return this.properties;
    }

    /**
     * The javascript implementation of the filter
     *
     * @param imageData
     */
    public drawCanvas(imageData : ImageData) : ImageData {
      throw new Error("Must be implemented");
    }

    /**
     * The WebGL implementation of the filter
     *
     * @param renderer
     */
    public drawWebGL(renderer) : void {
      var shader = renderer.getShader(this);
      var properties = this.getProperties();

      renderer.getTexture().use();
      renderer.getNextTexture().drawTo(function () {
        shader.uniforms(properties).drawRect();
      });
    }

    public getVertexSource() : string {
      return this.vertexSource;
    }

    public getFragmentSource() : string {
      return this.fragmentSource;
    }

    static clamp(low : number, value : number, high : number) : number {
      return Math.max(low, Math.min(value, high));
    }
  }
}
