namespace jsfx {
  export class IterableFilter extends jsfx.Filter implements jsfx.IterableFilterInterface {
    public drawCanvas(imageData : ImageData) : ImageData {
      return IterableFilter.drawCanvas([this], imageData);
    }

    public iterateCanvas(imageData : jsfx.util.ImageDataHelper) : void {
      throw new Error("Must be implemented");
    }

    static drawCanvas(filters : jsfx.IterableFilterInterface[], imageData : ImageData) {
      var helper : jsfx.util.ImageDataHelper;

      for (var i = 0; i < imageData.data.length; i+= 4) {
        helper = new jsfx.util.ImageDataHelper(imageData, i);

        for (var j = 0; j < filters.length; j++) {
          filters[j].iterateCanvas(helper);
        }

        helper.save();
      }

      return imageData;
    }
  }
}
