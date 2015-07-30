var jsfx;
(function (jsfx) {
    var Filter = (function () {
        function Filter(vertexSource, fragmentSource) {
            if (vertexSource === void 0) { vertexSource = null; }
            if (fragmentSource === void 0) { fragmentSource = null; }
            this.vertexSource = vertexSource;
            this.fragmentSource = fragmentSource;
            this.properties = {};
        }
        /**
         * Returns all the properties of the shader. Useful for drawWebGl when are are just passing along data
         * to the shader.
         *
         * @returns {{}|*}
         */
        Filter.prototype.getProperties = function () {
            return this.properties;
        };
        /**
         * The javascript implementation of the filter
         *
         * @param imageData
         */
        Filter.prototype.drawCanvas = function (imageData) {
            throw new Error("Must be implemented");
        };
        /**
         * The WebGL implementation of the filter
         *
         * @param renderer
         */
        Filter.prototype.drawWebGL = function (renderer) {
            var shader = renderer.getShader(this);
            var properties = this.getProperties();
            renderer.getTexture().use();
            renderer.getNextTexture().drawTo(function () {
                shader.uniforms(properties).drawRect();
            });
        };
        Filter.prototype.getVertexSource = function () {
            return this.vertexSource;
        };
        Filter.prototype.getFragmentSource = function () {
            return this.fragmentSource;
        };
        Filter.clamp = function (low, value, high) {
            return Math.max(low, Math.min(value, high));
        };
        return Filter;
    })();
    jsfx.Filter = Filter;
})(jsfx || (jsfx = {}));
var jsfx;
(function (jsfx) {
    var hasWebGL = (function () {
        try {
            var canvas = document.createElement("canvas");
            return !!(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"));
        }
        catch (e) {
            return false;
        }
    })();
    function Renderer(type) {
        if (!type) {
            type = hasWebGL ? "webgl" : "canvas";
        }
        if (type === "webgl") {
            return new jsfx.webgl.Renderer();
        }
        return new jsfx.canvas.Renderer();
    }
    jsfx.Renderer = Renderer;
})(jsfx || (jsfx = {}));
var jsfx;
(function (jsfx) {
    var Source = (function () {
        function Source(element) {
            this.element = element;
        }
        Object.defineProperty(Source.prototype, "width", {
            get: function () {
                return this.element.width;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Source.prototype, "height", {
            get: function () {
                return this.element.height;
            },
            enumerable: true,
            configurable: true
        });
        return Source;
    })();
    jsfx.Source = Source;
})(jsfx || (jsfx = {}));
var jsfx;
(function (jsfx) {
    var canvas;
    (function (canvas) {
        var Renderer = (function () {
            function Renderer() {
                this.canvas = this.createCanvas();
                this.ctx = this.canvas.getContext("2d");
                this.source = null;
                this.imageData = null;
            }
            Renderer.prototype.setSource = function (source) {
                // first, clean up
                if (this.source) {
                    this.cleanUp();
                }
                // re-set data and start rendering
                this.source = source;
                this.canvas.width = source.width;
                this.canvas.height = source.height;
                // draw the image on to a canvas we can manipulate
                this.ctx.drawImage(source.element, 0, 0, source.width, source.height);
                // store the pixels
                this.imageData = this.ctx.getImageData(0, 0, source.width, source.height);
                return this;
            };
            Renderer.prototype.applyFilter = function (filter) {
                this.imageData = filter.drawCanvas(this.imageData);
                return this;
            };
            Renderer.prototype.render = function () {
                this.ctx.putImageData(this.imageData, 0, 0);
            };
            Renderer.prototype.getCanvas = function () {
                return this.canvas;
            };
            Renderer.prototype.cleanUp = function () {
                this.imageData = null;
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            };
            Renderer.prototype.createCanvas = function () {
                return typeof Buffer !== "undefined" && typeof window === "undefined" ?
                    new (require("canvas"))(100, 100) :
                    document.createElement("canvas");
            };
            return Renderer;
        })();
        canvas.Renderer = Renderer;
    })(canvas = jsfx.canvas || (jsfx.canvas = {}));
})(jsfx || (jsfx = {}));
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var jsfx;
(function (jsfx) {
    var filter;
    (function (filter) {
        /**
         * @filter           Brightness / Contrast
         * @description      Provides additive brightness and multiplicative contrast control.
         * @param brightness -1 to 1 (-1 is solid black, 0 is no change, and 1 is solid white)
         * @param contrast   -1 to 1 (-1 is solid gray, 0 is no change, and 1 is maximum contrast)
         */
        var BrightnessContrast = (function (_super) {
            __extends(BrightnessContrast, _super);
            function BrightnessContrast(brightness, contrast) {
                _super.call(this, null, "\n            uniform sampler2D texture;\n            uniform float brightness;\n            uniform float contrast;\n            varying vec2 texCoord;\n\n            void main() {\n                vec4 color = texture2D(texture, texCoord);\n                color.rgb += brightness;\n\n                if (contrast > 0.0) {\n                    color.rgb = (color.rgb - 0.5) / (1.0 - contrast) + 0.5;\n                } else {\n                    color.rgb = (color.rgb - 0.5) * (1.0 + contrast) + 0.5;\n                }\n\n                gl_FragColor = color;\n            }\n        ");
                // set properties
                this.properties.brightness = jsfx.Filter.clamp(-1, brightness, 1) || 0;
                this.properties.contrast = jsfx.Filter.clamp(-1, contrast, 1) || 0;
            }
            BrightnessContrast.prototype.drawCanvas = function (imageData) {
                var pixels = imageData.data;
                var brightness = this.properties.brightness;
                var contrast = this.properties.contrast;
                var r, g, b;
                for (var i = 0; i < pixels.length; i += 4) {
                    // get color values
                    r = pixels[i] / 255;
                    g = pixels[i + 1] / 255;
                    b = pixels[i + 2] / 255;
                    // apply brightness
                    r += brightness;
                    g += brightness;
                    b += brightness;
                    // apply contrast
                    if (contrast > 0) {
                        r = (r - 0.5) / (1 - contrast) + 0.5;
                        g = (g - 0.5) / (1 - contrast) + 0.5;
                        b = (b - 0.5) / (1 - contrast) + 0.5;
                    }
                    else {
                        r = (r - 0.5) * (1 + contrast) + 0.5;
                        g = (g - 0.5) * (1 + contrast) + 0.5;
                        b = (b - 0.5) * (1 + contrast) + 0.5;
                    }
                    // set color values
                    pixels[i] = r * 255;
                    pixels[i + 1] = g * 255;
                    pixels[i + 2] = b * 255;
                }
                return imageData;
            };
            return BrightnessContrast;
        })(jsfx.Filter);
        filter.BrightnessContrast = BrightnessContrast;
    })(filter = jsfx.filter || (jsfx.filter = {}));
})(jsfx || (jsfx = {}));
var jsfx;
(function (jsfx) {
    var filter;
    (function (filter) {
        /**
         * @filter           Hue / Saturation
         * @description      Provides rotational hue and multiplicative saturation control. RGB color space
         *                   can be imagined as a cube where the axes are the red, green, and blue color
         *                   values. Hue changing works by rotating the color vector around the grayscale
         *                   line, which is the straight line from black (0, 0, 0) to white (1, 1, 1).
         *                   Saturation is implemented by scaling all color channel values either toward
         *                   or away from the average color channel value.
         * @param hue        -1 to 1 (-1 is 180 degree rotation in the negative direction, 0 is no change,
         *                   and 1 is 180 degree rotation in the positive direction)
         * @param saturation -1 to 1 (-1 is solid gray, 0 is no change, and 1 is maximum contrast)
         */
        var HueSaturation = (function (_super) {
            __extends(HueSaturation, _super);
            function HueSaturation(hue, saturation) {
                _super.call(this, null, "\n            uniform sampler2D texture;\n            uniform float hue;\n            uniform float saturation;\n            varying vec2 texCoord;\n\n            void main() {\n                vec4 color = texture2D(texture, texCoord);\n\n                /* hue adjustment, wolfram alpha: RotationTransform[angle, {1, 1, 1}][{x, y, z}] */\n                float angle = hue * 3.14159265;\n                float s = sin(angle), c = cos(angle);\n                vec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c) + 1.0) / 3.0;\n                color.rgb = vec3(\n                    dot(color.rgb, weights.xyz),\n                    dot(color.rgb, weights.zxy),\n                    dot(color.rgb, weights.yzx)\n                );\n\n                /* saturation adjustment */\n                float average = (color.r + color.g + color.b) / 3.0;\n                if (saturation > 0.0) {\n                    color.rgb += (average - color.rgb) * (1.0 - 1.0 / (1.001 - saturation));\n                } else {\n                    color.rgb += (average - color.rgb) * (-saturation);\n                }\n\n                gl_FragColor = color;\n            }\n        ");
                // set properties
                this.properties.hue = jsfx.Filter.clamp(-1, hue, 1) || 0;
                this.properties.saturation = jsfx.Filter.clamp(-1, saturation, 1) || 0;
            }
            HueSaturation.prototype.drawCanvas = function (imageData) {
                var pixels = imageData.data;
                var hue = this.properties.hue;
                var saturation = this.properties.saturation;
                var angle = hue * 3.14159265;
                var sin = Math.sin(angle);
                var cos = Math.cos(angle);
                var average, r, g, b, rgb, weights;
                for (var i = 0; i < pixels.length; i += 4) {
                    if (hue) {
                        rgb = new jsfx.util.Vector3(pixels[i] / 255, pixels[i + 1] / 255, pixels[i + 2] / 255);
                        // apply hue
                        weights = new jsfx.util.Vector3(2 * cos, -Math.sqrt(3.0) * sin - cos, Math.sqrt(3.0) * sin - cos);
                        // add 1 and average the vector
                        weights
                            .addScalar(1.0)
                            .divideScalar(3.0);
                        // set rgb
                        r = rgb.dot(weights);
                        g = rgb.dotScalars(weights.z, weights.x, weights.y);
                        b = rgb.dotScalars(weights.y, weights.z, weights.x);
                    }
                    else {
                        r = pixels[i] / 255;
                        g = pixels[i + 1] / 255;
                        b = pixels[i + 2] / 255;
                    }
                    // apply saturation
                    average = (r + g + b) / 3;
                    if (saturation > 0) {
                        r += (average - r) * (1 - 1 / (1.001 - saturation));
                        g += (average - g) * (1 - 1 / (1.001 - saturation));
                        b += (average - b) * (1 - 1 / (1.001 - saturation));
                    }
                    else {
                        r += (average - r) * (-saturation);
                        g += (average - g) * (-saturation);
                        b += (average - b) * (-saturation);
                    }
                    // set values
                    pixels[i] = r * 255;
                    pixels[i + 1] = g * 255;
                    pixels[i + 2] = b * 255;
                }
                return imageData;
            };
            return HueSaturation;
        })(jsfx.Filter);
        filter.HueSaturation = HueSaturation;
    })(filter = jsfx.filter || (jsfx.filter = {}));
})(jsfx || (jsfx = {}));
/**
 * Vector3 Utility Class
 *  -> Taken from https://github.com/mrdoob/three.js/blob/master/src/math/Vector3.js with only the functions we need.
 */
var jsfx;
(function (jsfx) {
    var util;
    (function (util) {
        var Vector3 = (function () {
            function Vector3(x, y, z) {
                this.x = x;
                this.y = y;
                this.z = z;
            }
            Vector3.prototype.addScalar = function (s) {
                this.x += s;
                this.y += s;
                this.z += s;
                return this;
            };
            Vector3.prototype.multiplyScalar = function (s) {
                this.x *= s;
                this.y *= s;
                this.z *= s;
                return this;
            };
            Vector3.prototype.divideScalar = function (s) {
                if (s !== 0) {
                    var invScalar = 1 / s;
                    this.x *= invScalar;
                    this.y *= invScalar;
                    this.z *= invScalar;
                }
                else {
                    this.x = 0;
                    this.y = 0;
                    this.z = 0;
                }
                return this;
            };
            Vector3.prototype.length = function () {
                return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
            };
            Vector3.prototype.dot = function (v) {
                return this.x * v.x + this.y * v.y + this.z * v.z;
            };
            Vector3.prototype.dotScalars = function (x, y, z) {
                return this.x * x + this.y * y + this.z * z;
            };
            return Vector3;
        })();
        util.Vector3 = Vector3;
    })(util = jsfx.util || (jsfx.util = {}));
})(jsfx || (jsfx = {}));
var jsfx;
(function (jsfx) {
    var webgl;
    (function (webgl) {
        var Renderer = (function () {
            function Renderer() {
                this.canvas = document.createElement("canvas");
                this.gl = this.canvas.getContext("experimental-webgl", { premultipliedAlpha: false });
                this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
                // variables to store the source
                this.source = null;
                this.sourceTexture = null;
                // store the textures and buffers
                this.textures = null;
                this.currentTexture = 0;
            }
            Renderer.prototype.setSource = function (source) {
                // first, clean up
                if (this.source) {
                    this.cleanUp();
                }
                // re-initialize renderer for rendering with new source
                this.source = source;
                this.sourceTexture = jsfx.webgl.Texture.fromElement(this.gl, source.element);
                // initialize the renderer textures
                this.initialize();
                // draw the source texture onto the first texture
                this.sourceTexture.use();
                this.getTexture().drawTo(this.getDefaultShader().drawRect.bind(this.getDefaultShader()));
                return this;
            };
            Renderer.prototype.applyFilter = function (filter) {
                filter.drawWebGL(this);
                return this;
            };
            Renderer.prototype.render = function () {
                this.getTexture().use();
                this.getFlippedShader().drawRect();
            };
            Renderer.prototype.getCanvas = function () {
                return this.canvas;
            };
            Renderer.prototype.getTexture = function () {
                return this.textures[this.currentTexture % 2];
            };
            Renderer.prototype.getNextTexture = function () {
                return this.textures[++this.currentTexture % 2];
            };
            Renderer.prototype.createTexture = function () {
                return new jsfx.webgl.Texture(this.gl, this.source.width, this.source.height, this.gl.RGBA, this.gl.UNSIGNED_BYTE);
            };
            Renderer.prototype.getShader = function (filter) {
                var cacheKey = filter.getVertexSource() + filter.getFragmentSource();
                return Renderer.shaderCache.hasOwnProperty(cacheKey) ?
                    Renderer.shaderCache[cacheKey] :
                    new jsfx.webgl.Shader(this.gl, filter.getVertexSource(), filter.getFragmentSource());
            };
            Renderer.prototype.getDefaultShader = function () {
                if (!Renderer.shaderCache.default) {
                    Renderer.shaderCache.default = new jsfx.webgl.Shader(this.gl);
                }
                return Renderer.shaderCache.default;
            };
            Renderer.prototype.getFlippedShader = function () {
                if (!Renderer.shaderCache.flipped) {
                    Renderer.shaderCache.flipped = new jsfx.webgl.Shader(this.gl, null, "\n                uniform sampler2D texture;\n                varying vec2 texCoord;\n\n                void main() {\n                    gl_FragColor = texture2D(texture, vec2(texCoord.x, 1.0 - texCoord.y));\n                }\n            ");
                }
                return Renderer.shaderCache.flipped;
            };
            Renderer.prototype.initialize = function () {
                this.canvas.width = this.source.width;
                this.canvas.height = this.source.height;
                // initialize the textures
                var textures = [];
                for (var i = 0; i < 2; i++) {
                    textures.push(this.createTexture());
                }
                this.textures = textures;
            };
            Renderer.prototype.cleanUp = function () {
                // destroy source texture
                this.sourceTexture.destroy();
                // destroy textures used for filters
                for (var i = 0; i < 2; i++) {
                    this.textures[i].destroy();
                }
                // re-set textures
                this.textures = null;
            };
            Renderer.shaderCache = {};
            return Renderer;
        })();
        webgl.Renderer = Renderer;
    })(webgl = jsfx.webgl || (jsfx.webgl = {}));
})(jsfx || (jsfx = {}));
var jsfx;
(function (jsfx) {
    var webgl;
    (function (webgl) {
        var Shader = (function () {
            function Shader(gl, vertexSource, fragmentSource) {
                this.gl = gl;
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
            Shader.prototype.textures = function (textures) {
                this.gl.useProgram(this.program);
                for (var name in textures) {
                    if (!textures.hasOwnProperty(name)) {
                        continue;
                    }
                    this.gl.uniform1i(this.gl.getUniformLocation(this.program, name), textures[name]);
                }
                return this;
            };
            Shader.prototype.uniforms = function (uniforms) {
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
                    }
                    else if (isNumber(value)) {
                        this.gl.uniform1f(location, value);
                    }
                    else {
                        throw "attempted to set uniform \"" + name + "\" to invalid value " + (value || "undefined").toString();
                    }
                }
                return this;
            };
            Shader.prototype.drawRect = function (left, top, right, bottom) {
                var undefined;
                var viewport = this.gl.getParameter(this.gl.VIEWPORT);
                top = top !== undefined ? (top - viewport[1]) / viewport[3] : 0;
                left = left !== undefined ? (left - viewport[0]) / viewport[2] : 0;
                right = right !== undefined ? (right - viewport[0]) / viewport[2] : 1;
                bottom = bottom !== undefined ? (bottom - viewport[1]) / viewport[3] : 1;
                if (Shader.vertexBuffer == null) {
                    Shader.vertexBuffer = this.gl.createBuffer();
                }
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, Shader.vertexBuffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([left, top, left, bottom, right, top, right, bottom]), this.gl.STATIC_DRAW);
                if (Shader.texCoordBuffer == null) {
                    Shader.texCoordBuffer = this.gl.createBuffer();
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, Shader.texCoordBuffer);
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
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, Shader.vertexBuffer);
                this.gl.vertexAttribPointer(this.vertexAttribute, 2, this.gl.FLOAT, false, 0, 0);
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, Shader.texCoordBuffer);
                this.gl.vertexAttribPointer(this.texCoordAttribute, 2, this.gl.FLOAT, false, 0, 0);
                this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
            };
            Shader.prototype.destroy = function () {
                this.gl.deleteProgram(this.program);
                this.program = null;
            };
            Shader.defaultVertexSource = "\nattribute vec2 vertex;\nattribute vec2 _texCoord;\nvarying vec2 texCoord;\n\nvoid main() {\n    texCoord = _texCoord;\n    gl_Position = vec4(vertex * 2.0 - 1.0, 0.0, 1.0);\n}";
            Shader.defaultFragmentSource = "\nuniform sampler2D texture;\nvarying vec2 texCoord;\n\nvoid main() {\n    gl_FragColor = texture2D(texture, texCoord);\n}";
            return Shader;
        })();
        webgl.Shader = Shader;
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
    })(webgl = jsfx.webgl || (jsfx.webgl = {}));
})(jsfx || (jsfx = {}));
var jsfx;
(function (jsfx) {
    var webgl;
    (function (webgl) {
        var Texture = (function () {
            function Texture(gl, width, height, format, type) {
                if (format === void 0) { format = gl.RGBA; }
                if (type === void 0) { type = gl.UNSIGNED_BYTE; }
                this.gl = gl;
                this.width = width;
                this.height = height;
                this.format = format;
                this.type = type;
                this.id = gl.createTexture();
                this.element = null;
                gl.bindTexture(gl.TEXTURE_2D, this.id);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                if (width && height) {
                    gl.texImage2D(gl.TEXTURE_2D, 0, this.format, width, height, 0, this.format, this.type, null);
                }
            }
            Texture.prototype.loadContentsOf = function (element) {
                this.element = element;
                this.width = element.width;
                this.height = element.height;
                this.gl.bindTexture(this.gl.TEXTURE_2D, this.id);
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.format, this.format, this.type, element);
            };
            Texture.prototype.initFromBytes = function (width, height, data) {
                this.width = width;
                this.height = height;
                this.format = this.gl.RGBA;
                this.type = this.gl.UNSIGNED_BYTE;
                this.gl.bindTexture(this.gl.TEXTURE_2D, this.id);
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, width, height, 0, this.gl.RGBA, this.type, new Uint8Array(data));
            };
            Texture.prototype.use = function (unit) {
                this.gl.activeTexture(this.gl.TEXTURE0 + (unit || 0));
                this.gl.bindTexture(this.gl.TEXTURE_2D, this.id);
            };
            Texture.prototype.unuse = function (unit) {
                this.gl.activeTexture(this.gl.TEXTURE0 + (unit || 0));
                this.gl.bindTexture(this.gl.TEXTURE_2D, null);
            };
            Texture.prototype.drawTo = function (callback) {
                // create and bind frame buffer
                Texture.frameBuffer = Texture.frameBuffer || this.gl.createFramebuffer();
                this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, Texture.frameBuffer);
                this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.id, 0);
                // ensure there was no error
                if (this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) !== this.gl.FRAMEBUFFER_COMPLETE) {
                    throw new Error("incomplete framebuffer");
                }
                // set the viewport
                this.gl.viewport(0, 0, this.width, this.height);
                // do the drawing
                callback();
                // stop rendering to this texture
                this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
            };
            Texture.prototype.destroy = function () {
                this.gl.deleteTexture(this.id);
                this.id = null;
            };
            Texture.fromElement = function (gl, element) {
                var texture = new Texture(gl, 0, 0);
                texture.loadContentsOf(element);
                return texture;
            };
            return Texture;
        })();
        webgl.Texture = Texture;
    })(webgl = jsfx.webgl || (jsfx.webgl = {}));
})(jsfx || (jsfx = {}));
