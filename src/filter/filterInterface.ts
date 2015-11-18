namespace jsfx.filter {
  export interface FilterInterface {
    getProperties() : Object;
    getVertexSource() : string;
    getFragmentSource() : string;
    drawCanvas(renderer : jsfx.canvas.Renderer) : void;
    drawWebGL(renderer : jsfx.webgl.Renderer) : void;
  }
}
