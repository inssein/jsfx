namespace jsfx.webgl {
  export class Texture {
    private id : WebGLTexture;
    private element : HTMLImageElement;

    constructor(private gl : WebGLRenderingContext, private width : number, private height : number, private format : number = gl.RGBA, private type : number = gl.UNSIGNED_BYTE) {
      this.id = gl.createTexture();
      this.element = null;

      gl.bindTexture(gl.TEXTURE_2D, this.id);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      if (width && height) {
        gl.texImage2D(gl.TEXTURE_2D, 0, this.format, width, height, 0, this.format, this.type, null);
      }
    }

    public loadContentsOf(element : HTMLImageElement) : void {
      this.element = element;
      this.width = element.width;
      this.height = element.height;

      this.gl.bindTexture(this.gl.TEXTURE_2D, this.id);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.format, this.format, this.type, element);
    }

    public initFromBytes(width : number, height : number, data) : void {
      this.width = width;
      this.height = height;
      this.format = this.gl.RGBA;
      this.type = this.gl.UNSIGNED_BYTE;

      this.gl.bindTexture(this.gl.TEXTURE_2D, this.id);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.type, new Uint8Array(data));
    }

    public use(unit? : number) {
      this.gl.activeTexture(this.gl.TEXTURE0 + (unit || 0));
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.id);
    }

    public unuse(unit? : number) : void {
      this.gl.activeTexture(this.gl.TEXTURE0 + (unit || 0));
      this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }

    public drawTo(callback : Function) : void {
      // create and bind frame buffer
      (<any>this.gl).frameBuffer = (<any>this.gl).frameBuffer || this.gl.createFramebuffer();
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, (<any>this.gl).frameBuffer);
      this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.id, 0);

      // ensure there was no error
      if (this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) !== this.gl.FRAMEBUFFER_COMPLETE) {
        throw new Error("incomplete framebuffer");
      }

      // set the viewport
      this.gl.viewport(0, 0, this.width, this.height);

      // do the drawing
      callback();

      // stop rendering to this texture
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }

    public destroy() : void {
      this.gl.deleteTexture(this.id);
      this.id = null;
    }

    static fromElement(gl : WebGLRenderingContext, element : HTMLImageElement) : jsfx.webgl.Texture {
      var texture = new Texture(gl, 0, 0);
      texture.loadContentsOf(element);

      return texture;
    }
  }
}
