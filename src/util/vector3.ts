/**
 * Vector3 Utility Class
 *  -> Taken from https://github.com/mrdoob/three.js/blob/master/src/math/Vector3.js with only the functions we need.
 */
namespace jsfx.util {
  export class Vector3 {
    constructor(public x : number, public y : number, public z : number) {

    }

    public addScalar(s : number) : Vector3 {
      this.x += s;
      this.y += s;
      this.z += s;

      return this;
    }

    multiplyScalar(s : number) : Vector3 {
      this.x *= s;
      this.y *= s;
      this.z *= s;

      return this;
    }

    divideScalar(s : number) : Vector3 {
      if (s !== 0) {
        var invScalar = 1 / s;

        this.x *= invScalar;
        this.y *= invScalar;
        this.z *= invScalar;
      } else {
        this.x = 0;
        this.y = 0;
        this.z = 0;
      }

      return this;
    }

    length() : number {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    dot(v : Vector3) : number {
      return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    dotScalars(x : number, y : number, z : number) : number {
      return this.x * x + this.y * y + this.z * z;
    }
  }
}
