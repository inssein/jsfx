namespace jsfx {
  export class Source {
    constructor(public element : HTMLImageElement) {
    }

    public get width() : number {
      return this.element.width;
    }

    public get height() : number {
      return this.element.height;
    }
  }
}
