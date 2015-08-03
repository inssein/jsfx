namespace jsfx {
  export interface RendererInterface {
    setSource(source : jsfx.Source) : RendererInterface;
    getSource() : jsfx.Source;
    applyFilter(filter : jsfx.FilterInterface) : RendererInterface;
    applyFilters(filters : jsfx.FilterInterface[]) : RendererInterface;
    render() : void;
    getCanvas() : HTMLCanvasElement;
  }
}
