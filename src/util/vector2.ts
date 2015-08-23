/**
 * Vector2 Utility Class
 *  -> Taken from https://github.com/mrdoob/three.js/blob/master/src/math/Vector2.js with only the functions we need.
 */
namespace jsfx.util {
  export class Vector2 {
    constructor(public x : number, public y : number) {

    }

    dotScalars(x : number, y : number) : number {
      return this.x * x + this.y * y;
    }
  }
}
