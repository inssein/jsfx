namespace jsfx {
  export interface RendererInterface {
    setSource(source : jsfx.Source) : RendererInterface;
    getSource() : jsfx.Source;
    applyFilter(filter : jsfx.filter.FilterInterface) : RendererInterface;
    applyFilters(filters : jsfx.filter.FilterInterface[]) : RendererInterface;
    render() : void;
    getCanvas() : HTMLCanvasElement;
  }
}
