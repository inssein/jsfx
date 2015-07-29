namespace jsfx {
  export class Source {
    private element : HTMLImageElement;

    constructor(element : HTMLImageElement) {
      this.element = element;
    }

    public getElement() : HTMLImageElement {
      return this.element;
    }

    public getWidth() : number {
      return this.element.width;
    }

    public getHeight() : number {
      return this.element.height;
    }
  }
}
