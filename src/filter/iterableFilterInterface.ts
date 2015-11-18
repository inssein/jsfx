namespace jsfx.filter {
  export interface IterableFilterInterface extends FilterInterface {
    iterateCanvas(helper : jsfx.util.ImageDataHelper) : void;
  }
}
