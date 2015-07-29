namespace jsfx {
  var hasWebGL = (function () {
    try {
      var canvas = document.createElement("canvas");
      return !!( canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
    } catch (e) {
      return false;
    }
  })();

  export function Renderer(type ? : string) : jsfx.RendererInterface {
    if (!type) {
      type = hasWebGL ? "webgl" : "canvas";
    }

    if (type === "webgl") {
      return new jsfx.webgl.Renderer();
    }

    return new jsfx.canvas.Renderer();
  }
}
