namespace jsfx.util {
  export class ImageDataHelper {
    public r : number;
    public g : number;
    public b : number;
    public a : number;

    constructor(private imageData : ImageData, private index : number) {
      this.r = this.imageData.data[index] / 255;
      this.g = this.imageData.data[index + 1] / 255;
      this.b = this.imageData.data[index + 2] / 255;
      this.a = this.imageData.data[index + 3] / 255;
    }

    public getImageData() : ImageData {
      return this.imageData;
    }

    public save() : void {
      this.imageData.data[this.index] = this.r * 255;
      this.imageData.data[this.index + 1] = this.g * 255;
      this.imageData.data[this.index + 2] = this.b * 255;
      this.imageData.data[this.index + 3] = this.a * 255;
    }

    public toVector3() : jsfx.util.Vector3 {
      return new jsfx.util.Vector3(this.r, this.g, this.b);
    }

    public fromVector3(v : jsfx.util.Vector3) : void {
      this.r = v.x;
      this.g = v.y;
      this.b = v.z;
    }

    /**
     * mix(x, y, a) = x * (1 - a) + y * a
     *
     * @param r
     * @param g
     * @param b
     * @param a
     */
    public mix(r : number, g : number, b : number, a : number) : void {
      this.r = this.r * (1 - a) + r * a;
      this.g = this.g * (1 - a) + g * a;
      this.b = this.b * (1 - a) + b * a;
    }
  }
}
