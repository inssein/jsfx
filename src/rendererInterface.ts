module jsfx {
  export interface RendererInterface {
    setSource(source : jsfx.Source) : RendererInterface;
    applyFilter(filter : jsfx.FilterInterface) : RendererInterface;
    render() : void;
    getCanvas() : HTMLCanvasElement;
  }
}
