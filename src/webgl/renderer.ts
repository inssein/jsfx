namespace jsfx.webgl {
  export class Renderer implements jsfx.RendererInterface {
    private canvas : HTMLCanvasElement;
    private gl : WebGLRenderingContext;
    private source : jsfx.Source;
    private sourceTexture : jsfx.webgl.Texture;
    private textures : Array<jsfx.webgl.Texture>;
    private currentTexture : number;

    constructor() {
      this.canvas = document.createElement("canvas");
      this.gl = <WebGLRenderingContext> this.canvas.getContext("experimental-webgl", {premultipliedAlpha: false});
      this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);

      // variables to store the source
      this.source = null;
      this.sourceTexture = null;

      // store the textures and buffers
      this.textures = null;
      this.currentTexture = 0;

      // initialize a shader cache
      (<any>this.gl).shaderCache = {};
    }

    public setSource(source : jsfx.Source) : jsfx.RendererInterface {
      // first, clean up
      if (this.source) {
        this.cleanUp();
      }

      // re-initialize renderer for rendering with new source
      this.source = source;
      this.sourceTexture = jsfx.webgl.Texture.fromElement(this.gl, source.element);

      // initialize the renderer textures
      this.initialize();

      // draw the source texture onto the first texture
      this.sourceTexture.use();
      this.getTexture().drawTo(this.getDefaultShader().drawRect.bind(this.getDefaultShader()));

      return this;
    }

    public getSource() : jsfx.Source {
      return this.source;
    }

    public applyFilter(filter : jsfx.FilterInterface) : jsfx.RendererInterface {
      filter.drawWebGL(this);

      return this;
    }

    public applyFilters(filters : jsfx.FilterInterface[]) : jsfx.RendererInterface {
      filters.forEach((filter : jsfx.FilterInterface) => {
        filter.drawWebGL(this);
      });

      return this;
    }

    public render() {
      this.getTexture().use();
      this.getFlippedShader().drawRect();
    }

    public getCanvas() : HTMLCanvasElement {
      return this.canvas;
    }

    public getTexture() : jsfx.webgl.Texture {
      return this.textures[this.currentTexture % 2];
    }

    public getNextTexture() : jsfx.webgl.Texture {
      return this.textures[++this.currentTexture % 2];
    }

    public createTexture() : jsfx.webgl.Texture {
      return new jsfx.webgl.Texture(this.gl, this.source.width, this.source.height, this.gl.RGBA, this.gl.UNSIGNED_BYTE);
    }

    public getShader(filter : jsfx.FilterInterface) : jsfx.webgl.Shader {
      var cacheKey = filter.getVertexSource() + filter.getFragmentSource();

      return (<any>this.gl).shaderCache.hasOwnProperty(cacheKey) ?
        (<any>this.gl).shaderCache[cacheKey] :
        new jsfx.webgl.Shader(this.gl, filter.getVertexSource(), filter.getFragmentSource());
    }

    public getDefaultShader() : jsfx.webgl.Shader {
      if (!(<any>this.gl).shaderCache.def) {
        (<any>this.gl).shaderCache.def = new jsfx.webgl.Shader(this.gl);
      }

      return (<any>this.gl).shaderCache.def;
    }

    public getFlippedShader() : jsfx.webgl.Shader {
      if (!(<any>this.gl).shaderCache.flipped) {
        (<any>this.gl).shaderCache.flipped = new jsfx.webgl.Shader(this.gl, null, `
                uniform sampler2D texture;
                varying vec2 texCoord;

                void main() {
                    gl_FragColor = texture2D(texture, vec2(texCoord.x, 1.0 - texCoord.y));
                }
            `);
      }

      return (<any>this.gl).shaderCache.flipped;
    }

    private initialize() : void {
      this.canvas.width = this.source.width;
      this.canvas.height = this.source.height;

      // initialize the textures
      var textures = [];

      for (var i = 0; i < 2; i++) {
        textures.push(this.createTexture());
      }

      this.textures = textures;
    }

    private cleanUp() : void {
      // destroy source texture
      this.sourceTexture.destroy();

      // destroy textures used for filters
      for (var i = 0; i < 2; i++) {
        this.textures[i].destroy();
      }

      // re-set textures
      this.textures = null;
    }
  }
}
