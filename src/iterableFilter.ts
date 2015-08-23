namespace jsfx {
  export class IterableFilter extends jsfx.Filter implements jsfx.IterableFilterInterface {
    public drawCanvas(renderer : jsfx.canvas.Renderer) : void {
      return IterableFilter.drawCanvas([this], renderer);
    }

    public iterateCanvas(imageData : jsfx.util.ImageDataHelper) : void {
      throw new Error("Must be implemented");
    }

    static drawCanvas(filters : jsfx.IterableFilterInterface[], renderer : jsfx.canvas.Renderer) : void {
      var helper : jsfx.util.ImageDataHelper;
      var imageData : ImageData = renderer.getImageData();

      for (var i = 0; i < imageData.data.length; i += 4) {
        helper = new jsfx.util.ImageDataHelper(imageData, i);

        filters.forEach((filter : jsfx.IterableFilterInterface) => {
          filter.iterateCanvas(helper);
        });

        helper.save();
      }
    }
  }
}
