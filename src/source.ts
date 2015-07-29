namespace jsfx {
  export class Source {
    private _element : HTMLImageElement;

    constructor(element : HTMLImageElement) {
      this._element = element;
    }

    public get element() : HTMLImageElement {
      return this._element;
    }

    public get width() : number {
      return this._element.width;
    }

    public get height() : number {
      return this._element.height;
    }
  }
}
