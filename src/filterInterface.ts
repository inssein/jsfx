namespace jsfx {
  export interface FilterInterface {
    getProperties() : Object;
    getVertexSource() : string;
    getFragmentSource() : string;
    drawCanvas(imageData : ImageData) : ImageData;
    drawWebGL(renderer : jsfx.webgl.Renderer) : void;
  }
}
