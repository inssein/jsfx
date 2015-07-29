declare var Buffer;
declare var require;

namespace jsfx.canvas {
  export class Renderer implements jsfx.RendererInterface {
    private canvas : HTMLCanvasElement;
    private ctx : CanvasRenderingContext2D;
    private source : jsfx.Source;
    private imageData : ImageData;

    constructor() {
      this.canvas = this.createCanvas();
      this.ctx = this.canvas.getContext("2d");
      this.source = null;
      this.imageData = null;
    }

    setSource(source : jsfx.Source) : jsfx.RendererInterface {
      // first, clean up
      if (this.source) {
        this.cleanUp();
      }

      // re-set data and start rendering
      this.source = source;
      this.canvas.width = source.getWidth();
      this.canvas.height = source.getHeight();

      // draw the image on to a canvas we can manipulate
      this.ctx.drawImage(source.getElement(), 0, 0, source.getWidth(), source.getHeight());

      // store the pixels
      this.imageData = this.ctx.getImageData(0, 0, source.getWidth(), source.getHeight());

      return this;
    }

    public applyFilter(filter : jsfx.FilterInterface) : jsfx.RendererInterface {
      this.imageData = filter.drawCanvas(this.imageData);

      return this;
    }

    public render() : void {
      this.ctx.putImageData(this.imageData, 0, 0);
    }

    public getCanvas() : HTMLCanvasElement {
      return this.canvas;
    }

    private cleanUp() : void {
      this.imageData = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    private createCanvas() : HTMLCanvasElement {
      return typeof Buffer !== "undefined" && typeof window === "undefined" ?
        new (require("canvas"))(100, 100) :
        document.createElement("canvas");
    }
  }
}
