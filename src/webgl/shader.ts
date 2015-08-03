namespace jsfx.webgl {
  export class Shader {
    private static defaultVertexSource : string = `
attribute vec2 vertex;
attribute vec2 _texCoord;
varying vec2 texCoord;

void main() {
    texCoord = _texCoord;
    gl_Position = vec4(vertex * 2.0 - 1.0, 0.0, 1.0);
}`;

    private static defaultFragmentSource : string = `
uniform sampler2D texture;
varying vec2 texCoord;

void main() {
    gl_FragColor = texture2D(texture, texCoord);
}`;

    private vertexSource : string;
    private fragmentSource : string;
    private vertexAttribute : any;
    private texCoordAttribute : any;
    private program : WebGLProgram;

    constructor(private gl : WebGLRenderingContext, vertexSource? : string, fragmentSource? : string) {
      // get the shader source
      this.vertexSource = vertexSource || Shader.defaultVertexSource;
      this.fragmentSource = fragmentSource || Shader.defaultFragmentSource;

      // set precision
      this.fragmentSource = "precision highp float;" + this.fragmentSource;

      // init vars
      this.vertexAttribute = null;
      this.texCoordAttribute = null;

      // create the program
      this.program = gl.createProgram();

      // attach the shaders
      gl.attachShader(this.program, compileSource(gl, gl.VERTEX_SHADER, this.vertexSource));
      gl.attachShader(this.program, compileSource(gl, gl.FRAGMENT_SHADER, this.fragmentSource));

      // link the program and ensure it worked
      gl.linkProgram(this.program);

      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
        throw "link error: " + gl.getProgramInfoLog(this.program);
      }
    }

    /**
     * textures are uniforms too but for some reason can't be specified by this.gl.uniform1f,
     * even though floating point numbers represent the integers 0 through 7 exactly
     *
     * @param textures
     * @returns {Shader}
     */
    public textures(textures) {
      this.gl.useProgram(this.program);

      for (var name in textures) {
        if (!textures.hasOwnProperty(name)) {
          continue;
        }

        this.gl.uniform1i(this.gl.getUniformLocation(this.program, name), textures[name]);
      }

      return this;
    }

    public uniforms(uniforms) {
      this.gl.useProgram(this.program);

      for (var name in uniforms) {
        if (!uniforms.hasOwnProperty(name)) {
          continue;
        }

        var location = this.gl.getUniformLocation(this.program, name);
        if (location === null) {
          // will be null if the uniform isn't used in the shader
          continue;
        }

        var value = uniforms[name];

        if (isArray(value)) {
          switch (value.length) {
            case 1:
              this.gl.uniform1fv(location, new Float32Array(value));
              break;
            case 2:
              this.gl.uniform2fv(location, new Float32Array(value));
              break;
            case 3:
              this.gl.uniform3fv(location, new Float32Array(value));
              break;
            case 4:
              this.gl.uniform4fv(location, new Float32Array(value));
              break;
            case 9:
              this.gl.uniformMatrix3fv(location, false, new Float32Array(value));
              break;
            case 16:
              this.gl.uniformMatrix4fv(location, false, new Float32Array(value));
              break;
            default:
              throw "dont't know how to load uniform \"" + name + "\" of length " + value.length;
          }
        } else if (isNumber(value)) {
          this.gl.uniform1f(location, value);
        } else {
          throw "attempted to set uniform \"" + name + "\" to invalid value " + (value || "undefined").toString();
        }
      }

      return this;
    }

    public drawRect(left? : number, top? : number, right? : number, bottom? : number) {
      var undefined;
      var viewport = this.gl.getParameter(this.gl.VIEWPORT);

      top = top !== undefined ? (top - viewport[1]) / viewport[3] : 0;
      left = left !== undefined ? (left - viewport[0]) / viewport[2] : 0;
      right = right !== undefined ? (right - viewport[0]) / viewport[2] : 1;
      bottom = bottom !== undefined ? (bottom - viewport[1]) / viewport[3] : 1;

      if (!(<any>this.gl).vertexBuffer) {
        (<any>this.gl).vertexBuffer = this.gl.createBuffer();
      }

      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, (<any>this.gl).vertexBuffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([left, top, left, bottom, right, top, right, bottom]), this.gl.STATIC_DRAW);

      if (!(<any>this.gl).texCoordBuffer) {
        (<any>this.gl).texCoordBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, (<any>this.gl).texCoordBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]), this.gl.STATIC_DRAW);
      }

      if (this.vertexAttribute == null) {
        this.vertexAttribute = this.gl.getAttribLocation(this.program, "vertex");
        this.gl.enableVertexAttribArray(this.vertexAttribute);
      }

      if (this.texCoordAttribute == null) {
        this.texCoordAttribute = this.gl.getAttribLocation(this.program, "_texCoord");
        this.gl.enableVertexAttribArray(this.texCoordAttribute);
      }

      this.gl.useProgram(this.program);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, (<any>this.gl).vertexBuffer);
      this.gl.vertexAttribPointer(this.vertexAttribute, 2, this.gl.FLOAT, false, 0, 0);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, (<any>this.gl).texCoordBuffer);
      this.gl.vertexAttribPointer(this.texCoordAttribute, 2, this.gl.FLOAT, false, 0, 0);
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    }

    destroy() {
      this.gl.deleteProgram(this.program);
      this.program = null;
    }
  }

  function compileSource(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw "compile error: " + gl.getShaderInfoLog(shader);
    }

    return shader;
  }

  function isArray(obj) {
    return Object.prototype.toString.call(obj) === "[object Array]";
  }

  function isNumber(obj) {
    return Object.prototype.toString.call(obj) === "[object Number]";
  }
}
