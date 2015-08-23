declare var Buffer;
declare var require;

namespace jsfx.canvas {
  export class Renderer implements jsfx.RendererInterface {
    private canvas : HTMLCanvasElement;
    private ctx : CanvasRenderingContext2D;
    private source : jsfx.Source;
    private imageData : ImageData;

    constructor() {
      this.canvas = jsfx.canvas.Renderer.createCanvas();
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
      this.canvas.width = source.width;
      this.canvas.height = source.height;

      // draw the image on to a canvas we can manipulate
      this.ctx.drawImage(source.element, 0, 0, source.width, source.height);

      // store the pixels
      this.imageData = this.ctx.getImageData(0, 0, source.width, source.height);

      return this;
    }

    public getSource() : jsfx.Source {
      return this.source;
    }

    public applyFilter(filter : jsfx.FilterInterface) : jsfx.RendererInterface {
      filter.drawCanvas(this);

      return this;
    }

    public applyFilters(filters : jsfx.FilterInterface[]) : jsfx.RendererInterface {
      var stack : jsfx.IterableFilterInterface[] = [];
      var filter : jsfx.FilterInterface;

      for (var i : number = 0; i < filters.length; i++) {
        filter = filters[i];

        if (filter instanceof jsfx.IterableFilter) {
          stack.push(<jsfx.IterableFilterInterface> filter);
        } else {
          // if there if something in the stack, apply that first
          if (stack.length > 0) {
            this.applyFilterStack(stack);
            stack = [];
          }

          // apply current filter
          this.applyFilter(filter);
        }
      }

      // if there is still a stack left, apply it
      if (stack.length > 0) {
        this.applyFilterStack(stack);
      }

      return this;
    }

    public render() : void {
      this.ctx.putImageData(this.imageData, 0, 0);
    }

    public getCanvas() : HTMLCanvasElement {
      return this.canvas;
    }

    public getContext() : CanvasRenderingContext2D {
      return this.ctx;
    }

    public getImageData() : ImageData {
      return this.imageData;
    }

    public setImageData(v : ImageData) : void {
      this.imageData = v;
    }

    private applyFilterStack(stack : jsfx.IterableFilterInterface[]) {
      jsfx.IterableFilter.drawCanvas(stack, this);

      return this;
    }

    private cleanUp() : void {
      this.imageData = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    static createCanvas() : HTMLCanvasElement {
      return typeof Buffer !== "undefined" && typeof window === "undefined" ?
        new (require("canvas"))(100, 100) :
        document.createElement("canvas");
    }
  }
}
