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

    public getIndex() : number {
      return this.index;
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
      this.r = ImageDataHelper.mix(this.r, r, a);
      this.g = ImageDataHelper.mix(this.g, g, a);
      this.b = ImageDataHelper.mix(this.b, b, a);
    }

    public static mix(x : number, y : number, a : number) : number {
      return x * (1 - a) + y * a;
    }
  }
}
