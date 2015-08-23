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
         * @param renderer
         */
        Filter.prototype.drawCanvas = function (renderer) {
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
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var jsfx;
(function (jsfx) {
    var IterableFilter = (function (_super) {
        __extends(IterableFilter, _super);
        function IterableFilter() {
            _super.apply(this, arguments);
        }
        IterableFilter.prototype.drawCanvas = function (renderer) {
            return IterableFilter.drawCanvas([this], renderer);
        };
        IterableFilter.prototype.iterateCanvas = function (imageData) {
            throw new Error("Must be implemented");
        };
        IterableFilter.drawCanvas = function (filters, renderer) {
            var helper;
            var imageData = renderer.getImageData();
            for (var i = 0; i < imageData.data.length; i += 4) {
                helper = new jsfx.util.ImageDataHelper(imageData, i);
                filters.forEach(function (filter) {
                    filter.iterateCanvas(helper);
                });
                helper.save();
            }
        };
        return IterableFilter;
    })(jsfx.Filter);
    jsfx.IterableFilter = IterableFilter;
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
                this.canvas = jsfx.canvas.Renderer.createCanvas();
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
            Renderer.prototype.getSource = function () {
                return this.source;
            };
            Renderer.prototype.applyFilter = function (filter) {
                filter.drawCanvas(this);
                return this;
            };
            Renderer.prototype.applyFilters = function (filters) {
                var stack = [];
                var filter;
                for (var i = 0; i < filters.length; i++) {
                    filter = filters[i];
                    if (filter instanceof jsfx.IterableFilter) {
                        stack.push(filter);
                    }
                    else {
                        // if there if something in the stack, apply that first
                        if (stack.length > 0) {
                            this.applyFilterStack(stack);
                            stack = [];
                        }
                        // apply current filter
                        this.applyFilter(filter);
                    }
                }
                // if there is still a stack left, apply it
                if (stack.length > 0) {
                    this.applyFilterStack(stack);
                }
                return this;
            };
            Renderer.prototype.render = function () {
                this.ctx.putImageData(this.imageData, 0, 0);
            };
            Renderer.prototype.getCanvas = function () {
                return this.canvas;
            };
            Renderer.prototype.getContext = function () {
                return this.ctx;
            };
            Renderer.prototype.getImageData = function () {
                return this.imageData;
            };
            Renderer.prototype.setImageData = function (v) {
                this.imageData = v;
            };
            Renderer.prototype.applyFilterStack = function (stack) {
                jsfx.IterableFilter.drawCanvas(stack, this);
                return this;
            };
            Renderer.prototype.cleanUp = function () {
                this.imageData = null;
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            };
            Renderer.createCanvas = function () {
                return typeof Buffer !== "undefined" && typeof window === "undefined" ?
                    new (require("canvas"))(100, 100) :
                    document.createElement("canvas");
            };
            return Renderer;
        })();
        canvas.Renderer = Renderer;
    })(canvas = jsfx.canvas || (jsfx.canvas = {}));
})(jsfx || (jsfx = {}));
var jsfx;
(function (jsfx) {
    var filter;
    (function (filter) {
        /**
         * @filter         Blur
         * @description    This is the TriangleBlur from glfx, but for the canvas implementation, we are cheating by
         *                 using StackBlur. The implementations are obviously very different, but the results are very close.
         * @param radius   The radius of the pyramid convolved with the image.
         */
        var Blur = (function (_super) {
            __extends(Blur, _super);
            function Blur(radius) {
                _super.call(this, null, "\n            uniform sampler2D texture;\n            uniform vec2 delta;\n            varying vec2 texCoord;\n\n            void main() {\n                vec4 color = vec4(0.0);\n                float total = 0.0;\n\n                /* randomize the lookup values to hide the fixed number of samples */\n                //float offset = random(vec3(12.9898, 78.233, 151.7182), 0.0);\n\n                vec3 scale = vec3(12.9898, 78.233, 151.7182);\n                float offset = fract(sin(dot(gl_FragCoord.xyz + 0.0, scale)) * 43758.5453 + 0.0);\n\n                for (float t = -30.0; t <= 30.0; t++) {\n                    float percent = (t + offset - 0.5) / 30.0;\n                    float weight = 1.0 - abs(percent);\n                    vec4 sample = texture2D(texture, texCoord + delta * percent);\n\n                    /* switch to pre-multiplied alpha to correctly blur transparent images */\n                    sample.rgb *= sample.a;\n\n                    color += sample * weight;\n                    total += weight;\n                }\n\n                gl_FragColor = color / total;\n\n                /* switch back from pre-multiplied alpha */\n                gl_FragColor.rgb /= gl_FragColor.a + 0.00001;\n            }\n        ");
                // set properties
                this.properties.radius = radius;
            }
            Blur.prototype.drawWebGL = function (renderer) {
                var shader = renderer.getShader(this);
                var firstPass = { delta: [this.properties.radius / renderer.getSource().width, 0] };
                var secondPass = { delta: [0, this.properties.radius / renderer.getSource().height] };
                renderer.getTexture().use();
                renderer.getNextTexture().drawTo(function () {
                    shader.uniforms(firstPass).drawRect();
                });
                renderer.getTexture().use();
                renderer.getNextTexture().drawTo(function () {
                    shader.uniforms(secondPass).drawRect();
                });
            };
            Blur.prototype.drawCanvas = function (renderer) {
                var imageData = renderer.getImageData();
                var pixels = imageData.data;
                var radius = this.properties.radius;
                var width = imageData.width;
                var height = imageData.height;
                var x, y, i, p, yp, yi, yw, r_sum, g_sum, b_sum, a_sum, r_out_sum, g_out_sum, b_out_sum, a_out_sum, r_in_sum, g_in_sum, b_in_sum, a_in_sum, pr, pg, pb, pa, rbs;
                var div = radius + radius + 1;
                var widthMinus1 = width - 1;
                var heightMinus1 = height - 1;
                var radiusPlus1 = radius + 1;
                var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;
                var stackStart = new BlurStack();
                var stack = stackStart;
                for (i = 1; i < div; i++) {
                    stack = stack.next = new BlurStack();
                    if (i == radiusPlus1)
                        var stackEnd = stack;
                }
                stack.next = stackStart;
                var stackIn = null;
                var stackOut = null;
                yw = yi = 0;
                var mul_sum = mul_table[radius];
                var shg_sum = shg_table[radius];
                for (y = 0; y < height; y++) {
                    r_in_sum = g_in_sum = b_in_sum = a_in_sum = r_sum = g_sum = b_sum = a_sum = 0;
                    r_out_sum = radiusPlus1 * (pr = pixels[yi]);
                    g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
                    b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
                    a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);
                    r_sum += sumFactor * pr;
                    g_sum += sumFactor * pg;
                    b_sum += sumFactor * pb;
                    a_sum += sumFactor * pa;
                    stack = stackStart;
                    for (i = 0; i < radiusPlus1; i++) {
                        stack.r = pr;
                        stack.g = pg;
                        stack.b = pb;
                        stack.a = pa;
                        stack = stack.next;
                    }
                    for (i = 1; i < radiusPlus1; i++) {
                        p = yi + ((widthMinus1 < i ? widthMinus1 : i) << 2);
                        r_sum += (stack.r = (pr = pixels[p])) * (rbs = radiusPlus1 - i);
                        g_sum += (stack.g = (pg = pixels[p + 1])) * rbs;
                        b_sum += (stack.b = (pb = pixels[p + 2])) * rbs;
                        a_sum += (stack.a = (pa = pixels[p + 3])) * rbs;
                        r_in_sum += pr;
                        g_in_sum += pg;
                        b_in_sum += pb;
                        a_in_sum += pa;
                        stack = stack.next;
                    }
                    stackIn = stackStart;
                    stackOut = stackEnd;
                    for (x = 0; x < width; x++) {
                        pixels[yi + 3] = pa = (a_sum * mul_sum) >> shg_sum;
                        if (pa != 0) {
                            pa = 255 / pa;
                            pixels[yi] = ((r_sum * mul_sum) >> shg_sum) * pa;
                            pixels[yi + 1] = ((g_sum * mul_sum) >> shg_sum) * pa;
                            pixels[yi + 2] = ((b_sum * mul_sum) >> shg_sum) * pa;
                        }
                        else {
                            pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
                        }
                        r_sum -= r_out_sum;
                        g_sum -= g_out_sum;
                        b_sum -= b_out_sum;
                        a_sum -= a_out_sum;
                        r_out_sum -= stackIn.r;
                        g_out_sum -= stackIn.g;
                        b_out_sum -= stackIn.b;
                        a_out_sum -= stackIn.a;
                        p = (yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1)) << 2;
                        r_in_sum += (stackIn.r = pixels[p]);
                        g_in_sum += (stackIn.g = pixels[p + 1]);
                        b_in_sum += (stackIn.b = pixels[p + 2]);
                        a_in_sum += (stackIn.a = pixels[p + 3]);
                        r_sum += r_in_sum;
                        g_sum += g_in_sum;
                        b_sum += b_in_sum;
                        a_sum += a_in_sum;
                        stackIn = stackIn.next;
                        r_out_sum += (pr = stackOut.r);
                        g_out_sum += (pg = stackOut.g);
                        b_out_sum += (pb = stackOut.b);
                        a_out_sum += (pa = stackOut.a);
                        r_in_sum -= pr;
                        g_in_sum -= pg;
                        b_in_sum -= pb;
                        a_in_sum -= pa;
                        stackOut = stackOut.next;
                        yi += 4;
                    }
                    yw += width;
                }
                for (x = 0; x < width; x++) {
                    g_in_sum = b_in_sum = a_in_sum = r_in_sum = g_sum = b_sum = a_sum = r_sum = 0;
                    yi = x << 2;
                    r_out_sum = radiusPlus1 * (pr = pixels[yi]);
                    g_out_sum = radiusPlus1 * (pg = pixels[yi + 1]);
                    b_out_sum = radiusPlus1 * (pb = pixels[yi + 2]);
                    a_out_sum = radiusPlus1 * (pa = pixels[yi + 3]);
                    r_sum += sumFactor * pr;
                    g_sum += sumFactor * pg;
                    b_sum += sumFactor * pb;
                    a_sum += sumFactor * pa;
                    stack = stackStart;
                    for (i = 0; i < radiusPlus1; i++) {
                        stack.r = pr;
                        stack.g = pg;
                        stack.b = pb;
                        stack.a = pa;
                        stack = stack.next;
                    }
                    yp = width;
                    for (i = 1; i <= radius; i++) {
                        yi = (yp + x) << 2;
                        r_sum += (stack.r = (pr = pixels[yi])) * (rbs = radiusPlus1 - i);
                        g_sum += (stack.g = (pg = pixels[yi + 1])) * rbs;
                        b_sum += (stack.b = (pb = pixels[yi + 2])) * rbs;
                        a_sum += (stack.a = (pa = pixels[yi + 3])) * rbs;
                        r_in_sum += pr;
                        g_in_sum += pg;
                        b_in_sum += pb;
                        a_in_sum += pa;
                        stack = stack.next;
                        if (i < heightMinus1) {
                            yp += width;
                        }
                    }
                    yi = x;
                    stackIn = stackStart;
                    stackOut = stackEnd;
                    for (y = 0; y < height; y++) {
                        p = yi << 2;
                        pixels[p + 3] = pa = (a_sum * mul_sum) >> shg_sum;
                        if (pa > 0) {
                            pa = 255 / pa;
                            pixels[p] = ((r_sum * mul_sum) >> shg_sum) * pa;
                            pixels[p + 1] = ((g_sum * mul_sum) >> shg_sum) * pa;
                            pixels[p + 2] = ((b_sum * mul_sum) >> shg_sum) * pa;
                        }
                        else {
                            pixels[p] = pixels[p + 1] = pixels[p + 2] = 0;
                        }
                        r_sum -= r_out_sum;
                        g_sum -= g_out_sum;
                        b_sum -= b_out_sum;
                        a_sum -= a_out_sum;
                        r_out_sum -= stackIn.r;
                        g_out_sum -= stackIn.g;
                        b_out_sum -= stackIn.b;
                        a_out_sum -= stackIn.a;
                        p = (x + (((p = y + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width)) << 2;
                        r_sum += (r_in_sum += (stackIn.r = pixels[p]));
                        g_sum += (g_in_sum += (stackIn.g = pixels[p + 1]));
                        b_sum += (b_in_sum += (stackIn.b = pixels[p + 2]));
                        a_sum += (a_in_sum += (stackIn.a = pixels[p + 3]));
                        stackIn = stackIn.next;
                        r_out_sum += (pr = stackOut.r);
                        g_out_sum += (pg = stackOut.g);
                        b_out_sum += (pb = stackOut.b);
                        a_out_sum += (pa = stackOut.a);
                        r_in_sum -= pr;
                        g_in_sum -= pg;
                        b_in_sum -= pb;
                        a_in_sum -= pa;
                        stackOut = stackOut.next;
                        yi += width;
                    }
                }
            };
            return Blur;
        })(jsfx.Filter);
        filter.Blur = Blur;
        var mul_table = [
            512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512,
            454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512,
            482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456,
            437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512,
            497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328,
            320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456,
            446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335,
            329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512,
            505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405,
            399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328,
            324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271,
            268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456,
            451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388,
            385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335,
            332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292,
            289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259];
        var shg_table = [
            9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17,
            17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19,
            19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20,
            20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21,
            21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21,
            21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22,
            22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22,
            22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23,
            23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
            23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
            23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23,
            23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
            24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
            24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
            24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24,
            24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24];
        var BlurStack = (function () {
            function BlurStack() {
                this.r = 0;
                this.g = 0;
                this.b = 0;
                this.a = 0;
                this.next = null;
            }
            return BlurStack;
        })();
    })(filter = jsfx.filter || (jsfx.filter = {}));
})(jsfx || (jsfx = {}));
var jsfx;
(function (jsfx) {
    var filter;
    (function (filter) {
        /**
         * @filter           Brightness
         * @description      Provides additive brightness control.
         * @param brightness -1 to 1 (-1 is solid black, 0 is no change, and 1 is solid white)
         */
        var Brightness = (function (_super) {
            __extends(Brightness, _super);
            function Brightness(brightness) {
                _super.call(this, null, "\n            uniform sampler2D texture;\n            uniform float brightness;\n            varying vec2 texCoord;\n\n            void main() {\n                vec4 color = texture2D(texture, texCoord);\n                color.rgb += brightness;\n\n                gl_FragColor = color;\n            }\n        ");
                // set properties
                this.properties.brightness = jsfx.Filter.clamp(-1, brightness, 1) || 0;
            }
            Brightness.prototype.iterateCanvas = function (helper) {
                var brightness = this.properties.brightness;
                helper.r += brightness;
                helper.g += brightness;
                helper.b += brightness;
            };
            return Brightness;
        })(jsfx.IterableFilter);
        filter.Brightness = Brightness;
    })(filter = jsfx.filter || (jsfx.filter = {}));
})(jsfx || (jsfx = {}));
var jsfx;
(function (jsfx) {
    var filter;
    (function (filter) {
        /**
         * @filter           Contrast
         * @description      Provides multiplicative contrast control.
         * @param contrast   -1 to 1 (-1 is solid gray, 0 is no change, and 1 is maximum contrast)
         */
        var Contrast = (function (_super) {
            __extends(Contrast, _super);
            function Contrast(contrast) {
                _super.call(this, null, "\n            uniform sampler2D texture;\n            uniform float contrast;\n            varying vec2 texCoord;\n\n            void main() {\n                vec4 color = texture2D(texture, texCoord);\n\n                if (contrast > 0.0) {\n                    color.rgb = (color.rgb - 0.5) / (1.0 - contrast) + 0.5;\n                } else {\n                    color.rgb = (color.rgb - 0.5) * (1.0 + contrast) + 0.5;\n                }\n\n                gl_FragColor = color;\n            }\n        ");
                // set properties
                this.properties.contrast = jsfx.Filter.clamp(-1, contrast, 1) || 0;
            }
            Contrast.prototype.iterateCanvas = function (helper) {
                var contrast = this.properties.contrast;
                if (contrast > 0) {
                    helper.r = (helper.r - 0.5) / (1 - contrast) + 0.5;
                    helper.g = (helper.g - 0.5) / (1 - contrast) + 0.5;
                    helper.b = (helper.b - 0.5) / (1 - contrast) + 0.5;
                }
                else {
                    helper.r = (helper.r - 0.5) * (1 + contrast) + 0.5;
                    helper.g = (helper.g - 0.5) * (1 + contrast) + 0.5;
                    helper.b = (helper.b - 0.5) * (1 + contrast) + 0.5;
                }
            };
            return Contrast;
        })(jsfx.IterableFilter);
        filter.Contrast = Contrast;
    })(filter = jsfx.filter || (jsfx.filter = {}));
})(jsfx || (jsfx = {}));
var jsfx;
(function (jsfx) {
    var filter;
    (function (filter) {
        /**
         * @filter      Curves
         * @description A powerful mapping tool that transforms the colors in the image
         *              by an arbitrary function. The function is interpolated between
         *              a set of 2D points using splines. The curves filter can take
         *              either one or three arguments which will apply the mapping to
         *              either luminance or RGB values, respectively.
         * @param red   A list of points that define the function for the red channel.
         *              Each point is a list of two values: the value before the mapping
         *              and the value after the mapping, both in the range 0 to 1. For
         *              example, [[0,1], [1,0]] would invert the red channel while
         *              [[0,0], [1,1]] would leave the red channel unchanged. If green
         *              and blue are omitted then this argument also applies to the
         *              green and blue channels.
         * @param green (optional) A list of points that define the function for the green
         *              channel (just like for red).
         * @param blue  (optional) A list of points that define the function for the blue
         *              channel (just like for red).
         */
        var Curves = (function (_super) {
            __extends(Curves, _super);
            function Curves(red, green, blue) {
                _super.call(this, null, "\n            uniform sampler2D texture;\n            uniform sampler2D map;\n            varying vec2 texCoord;\n\n            void main() {\n                vec4 color = texture2D(texture, texCoord);\n                color.r = texture2D(map, vec2(color.r)).r;\n                color.g = texture2D(map, vec2(color.g)).g;\n                color.b = texture2D(map, vec2(color.b)).b;\n                gl_FragColor = color;\n            }\n        ");
                this.red = red;
                this.green = green;
                this.blue = blue;
                // interpolate
                red = Curves.splineInterpolate(red);
                if (arguments.length == 1) {
                    green = blue = red;
                }
                else {
                    green = Curves.splineInterpolate(green);
                    blue = Curves.splineInterpolate(blue);
                }
                this.red = red;
                this.green = green;
                this.blue = blue;
            }
            Curves.prototype.drawCanvas = function (renderer) {
                var imageData = renderer.getImageData();
                var pixels = imageData.data;
                var amount = this.properties.amount;
                var r, g, b;
                for (var i = 0; i < pixels.length; i += 4) {
                    // get color values
                    r = pixels[i] / 255;
                    g = pixels[i + 1] / 255;
                    b = pixels[i + 2] / 255;
                    r = Math.min(1.0, (r * (1 - (0.607 * amount))) + (g * (0.769 * amount)) + (b * (0.189 * amount)));
                    g = Math.min(1.0, (r * 0.349 * amount) + (g * (1 - (0.314 * amount))) + (b * 0.168 * amount));
                    b = Math.min(1.0, (r * 0.272 * amount) + (g * 0.534 * amount) + (b * (1 - (0.869 * amount))));
                    // set values
                    pixels[i] = r * 255;
                    pixels[i + 1] = g * 255;
                    pixels[i + 2] = b * 255;
                }
            };
            Curves.splineInterpolate = function (points) {
                var interpolator = new jsfx.util.SplineInterpolator(points);
                var array = [];
                for (var i = 0; i < 256; i++) {
                    array.push(jsfx.Filter.clamp(0, Math.floor(interpolator.interpolate(i / 255) * 256), 255));
                }
                return array;
            };
            return Curves;
        })(jsfx.Filter);
        filter.Curves = Curves;
    })(filter = jsfx.filter || (jsfx.filter = {}));
})(jsfx || (jsfx = {}));
var jsfx;
(function (jsfx) {
    var filter;
    (function (filter) {
        /**
         * @filter           Hue / Saturation
         * @description      Provides rotational hue control. RGB color space
         *                   can be imagined as a cube where the axes are the red, green, and blue color
         *                   values. Hue changing works by rotating the color vector around the grayscale
         *                   line, which is the straight line from black (0, 0, 0) to white (1, 1, 1).
         * @param hue        -1 to 1 (-1 is 180 degree rotation in the negative direction, 0 is no change,
         *                   and 1 is 180 degree rotation in the positive direction)
         */
        var Hue = (function (_super) {
            __extends(Hue, _super);
            function Hue(hue) {
                _super.call(this, null, "\n            uniform sampler2D texture;\n            uniform float hue;\n            varying vec2 texCoord;\n\n            void main() {\n                vec4 color = texture2D(texture, texCoord);\n\n                /* hue adjustment, wolfram alpha: RotationTransform[angle, {1, 1, 1}][{x, y, z}] */\n                float angle = hue * 3.14159265;\n                float s = sin(angle), c = cos(angle);\n                vec3 weights = (vec3(2.0 * c, -sqrt(3.0) * s - c, sqrt(3.0) * s - c) + 1.0) / 3.0;\n                color.rgb = vec3(\n                    dot(color.rgb, weights.xyz),\n                    dot(color.rgb, weights.zxy),\n                    dot(color.rgb, weights.yzx)\n                );\n\n                gl_FragColor = color;\n            }\n        ");
                // set properties
                this.properties.hue = jsfx.Filter.clamp(-1, hue, 1) || 0;
                // pre-calculate data for canvas iteration
                var angle = hue * 3.14159265;
                var sin = Math.sin(angle);
                var cos = Math.cos(angle);
                this.weights = new jsfx.util.Vector3(2 * cos, -Math.sqrt(3.0) * sin - cos, Math.sqrt(3.0) * sin - cos)
                    .addScalar(1.0)
                    .divideScalar(3.0);
            }
            Hue.prototype.iterateCanvas = function (helper) {
                var rgb = helper.toVector3();
                helper.r = rgb.dot(this.weights);
                helper.g = rgb.dotScalars(this.weights.z, this.weights.x, this.weights.y);
                helper.b = rgb.dotScalars(this.weights.y, this.weights.z, this.weights.x);
            };
            return Hue;
        })(jsfx.IterableFilter);
        filter.Hue = Hue;
    })(filter = jsfx.filter || (jsfx.filter = {}));
})(jsfx || (jsfx = {}));
var jsfx;
(function (jsfx) {
    var filter;
    (function (filter) {
        /**
         * @filter           Hue / Saturation
         * @description      Provides multiplicative saturation control. RGB color space
         *                   can be imagined as a cube where the axes are the red, green, and blue color
         *                   values.
         *                   Saturation is implemented by scaling all color channel values either toward
         *                   or away from the average color channel value.
         * @param saturation -1 to 1 (-1 is solid gray, 0 is no change, and 1 is maximum contrast)
         */
        var Saturation = (function (_super) {
            __extends(Saturation, _super);
            function Saturation(saturation) {
                _super.call(this, null, "\n            uniform sampler2D texture;\n            uniform float saturation;\n            varying vec2 texCoord;\n\n            void main() {\n                vec4 color = texture2D(texture, texCoord);\n\n                float average = (color.r + color.g + color.b) / 3.0;\n                if (saturation > 0.0) {\n                    color.rgb += (average - color.rgb) * (1.0 - 1.0 / (1.001 - saturation));\n                } else {\n                    color.rgb += (average - color.rgb) * (-saturation);\n                }\n\n                gl_FragColor = color;\n            }\n        ");
                // set properties
                this.properties.saturation = jsfx.Filter.clamp(-1, saturation, 1) || 0;
            }
            Saturation.prototype.iterateCanvas = function (helper) {
                var saturation = this.properties.saturation;
                var average = (helper.r + helper.g + helper.b) / 3;
                if (saturation > 0) {
                    helper.r += (average - helper.r) * (1 - 1 / (1.001 - saturation));
                    helper.g += (average - helper.g) * (1 - 1 / (1.001 - saturation));
                    helper.b += (average - helper.b) * (1 - 1 / (1.001 - saturation));
                }
                else {
                    helper.r += (average - helper.r) * (-saturation);
                    helper.g += (average - helper.g) * (-saturation);
                    helper.b += (average - helper.b) * (-saturation);
                }
            };
            return Saturation;
        })(jsfx.IterableFilter);
        filter.Saturation = Saturation;
    })(filter = jsfx.filter || (jsfx.filter = {}));
})(jsfx || (jsfx = {}));
var jsfx;
(function (jsfx) {
    var filter;
    (function (filter) {
        /**
         * @filter         Sepia
         * @description    Gives the image a reddish-brown monochrome tint that imitates an old photograph.
         * @param amount   0 to 1 (0 for no effect, 1 for full sepia coloring)
         */
        var Sepia = (function (_super) {
            __extends(Sepia, _super);
            function Sepia(amount) {
                _super.call(this, null, "\n            uniform sampler2D texture;\n            uniform float amount;\n            varying vec2 texCoord;\n\n            void main() {\n                vec4 color = texture2D(texture, texCoord);\n                float r = color.r;\n                float g = color.g;\n                float b = color.b;\n\n                color.r = min(1.0, (r * (1.0 - (0.607 * amount))) + (g * (0.769 * amount)) + (b * (0.189 * amount)));\n                color.g = min(1.0, (r * 0.349 * amount) + (g * (1.0 - (0.314 * amount))) + (b * 0.168 * amount));\n                color.b = min(1.0, (r * 0.272 * amount) + (g * 0.534 * amount) + (b * (1.0 - (0.869 * amount))));\n\n                gl_FragColor = color;\n            }\n        ");
                // set properties
                this.properties.amount = jsfx.Filter.clamp(-1, amount, 1) || 0;
            }
            Sepia.prototype.iterateCanvas = function (helper) {
                var r = helper.r;
                var g = helper.g;
                var b = helper.b;
                var amount = this.properties.amount;
                helper.r = Math.min(1.0, (r * (1.0 - (0.607 * amount))) + (g * (0.769 * amount)) + (b * (0.189 * amount)));
                helper.g = Math.min(1.0, (r * 0.349 * amount) + (g * (1.0 - (0.314 * amount))) + (b * 0.168 * amount));
                helper.b = Math.min(1.0, (r * 0.272 * amount) + (g * 0.534 * amount) + (b * (1.0 - (0.869 * amount))));
            };
            return Sepia;
        })(jsfx.IterableFilter);
        filter.Sepia = Sepia;
    })(filter = jsfx.filter || (jsfx.filter = {}));
})(jsfx || (jsfx = {}));
var jsfx;
(function (jsfx) {
    var filter;
    (function (filter) {
        /**
         * @filter         Unsharp Mask
         * @description    A form of image sharpening that amplifies high-frequencies in the image. It
         *                 is implemented by scaling pixels away from the average of their neighbors.
         * @param radius   0 to 180 - The blur radius that calculates the average of the neighboring pixels.
         * @param strength A scale factor where 0 is no effect and higher values cause a stronger effect.
         * @note           Could potentially be converted to an IterableFilter, but we somehow need the original ImageData
         */
        var UnsharpMask = (function (_super) {
            __extends(UnsharpMask, _super);
            function UnsharpMask(radius, strength) {
                _super.call(this, null, "\n            uniform sampler2D blurredTexture;\n            uniform sampler2D originalTexture;\n            uniform float strength;\n            uniform float threshold;\n            varying vec2 texCoord;\n\n            void main() {\n                vec4 blurred = texture2D(blurredTexture, texCoord);\n                vec4 original = texture2D(originalTexture, texCoord);\n                gl_FragColor = mix(blurred, original, 1.0 + strength);\n            }\n        ");
                // set properties
                this.properties.radius = radius;
                this.properties.strength = strength;
            }
            UnsharpMask.prototype.drawWebGL = function (renderer) {
                var shader = renderer.getShader(this);
                var radius = this.properties.radius;
                var strength = this.properties.strength;
                // create a new texture
                var extraTexture = renderer.createTexture();
                // use a texture and draw to it
                renderer.getTexture().use();
                extraTexture.drawTo(renderer.getDefaultShader().drawRect.bind(renderer.getDefaultShader()));
                // blur current texture
                extraTexture.use(1);
                // draw the blur
                var blur = new filter.Blur(radius);
                blur.drawWebGL(renderer);
                // use the stored texture to detect edges
                shader.textures({
                    originalTexture: 1
                });
                renderer.getTexture().use();
                renderer.getNextTexture().drawTo(function () {
                    shader.uniforms({ strength: strength }).drawRect();
                });
                extraTexture.unuse(1);
            };
            UnsharpMask.prototype.drawCanvas = function (renderer) {
                var original = new Uint8ClampedArray(renderer.getImageData().data);
                // props
                var radius = this.properties.radius;
                var strength = this.properties.strength + 1;
                // blur image
                var blur = new filter.Blur(radius);
                blur.drawCanvas(renderer);
                // get processed image data
                var imageData = renderer.getImageData();
                var pixels = imageData.data;
                // trying to replicate mix() from webgl, which is basically x * (1 -a)
                for (var i = 0; i < pixels.length; i += 4) {
                    pixels[i] = pixels[i] * (1 - strength) + original[i] * strength;
                    pixels[i + 1] = pixels[i + 1] * (1 - strength) + original[i + 1] * strength;
                    pixels[i + 2] = pixels[i + 2] * (1 - strength) + original[i + 2] * strength;
                }
                renderer.setImageData(imageData);
            };
            return UnsharpMask;
        })(jsfx.Filter);
        filter.UnsharpMask = UnsharpMask;
    })(filter = jsfx.filter || (jsfx.filter = {}));
})(jsfx || (jsfx = {}));
var jsfx;
(function (jsfx) {
    var util;
    (function (util) {
        var ImageDataHelper = (function () {
            function ImageDataHelper(imageData, index) {
                this.imageData = imageData;
                this.index = index;
                this.r = this.imageData.data[index] / 255;
                this.g = this.imageData.data[index + 1] / 255;
                this.b = this.imageData.data[index + 2] / 255;
                this.a = this.imageData.data[index + 3] / 255;
            }
            ImageDataHelper.prototype.getImageData = function () {
                return this.imageData;
            };
            ImageDataHelper.prototype.save = function () {
                this.imageData.data[this.index] = this.r * 255;
                this.imageData.data[this.index + 1] = this.g * 255;
                this.imageData.data[this.index + 2] = this.b * 255;
                this.imageData.data[this.index + 3] = this.a * 255;
            };
            ImageDataHelper.prototype.toVector3 = function () {
                return new jsfx.util.Vector3(this.r, this.g, this.b);
            };
            ImageDataHelper.prototype.fromVector3 = function (v) {
                this.r = v.x;
                this.g = v.y;
                this.b = v.z;
            };
            return ImageDataHelper;
        })();
        util.ImageDataHelper = ImageDataHelper;
    })(util = jsfx.util || (jsfx.util = {}));
})(jsfx || (jsfx = {}));
var jsfx;
(function (jsfx) {
    var util;
    (function (util) {
        /**
         * From SplineInterpolator.cs in the Paint.NET source code
         */
        var SplineInterpolator = (function () {
            function SplineInterpolator(points) {
                this.points = points;
                var n = points.length;
                var i;
                this.xa = [];
                this.ya = [];
                this.u = [];
                this.y2 = [];
                points.sort(function (a, b) {
                    return a[0] - b[0];
                });
                for (i = 0; i < n; i++) {
                    this.xa.push(points[i][0]);
                    this.ya.push(points[i][1]);
                }
                this.u[0] = 0;
                this.y2[0] = 0;
                for (i = 1; i < n - 1; ++i) {
                    // This is the decomposition loop of the tri-diagonal algorithm.
                    // y2 and u are used for temporary storage of the decomposed factors.
                    var wx = this.xa[i + 1] - this.xa[i - 1];
                    var sig = (this.xa[i] - this.xa[i - 1]) / wx;
                    var p = sig * this.y2[i - 1] + 2.0;
                    this.y2[i] = (sig - 1.0) / p;
                    var ddydx = (this.ya[i + 1] - this.ya[i]) / (this.xa[i + 1] - this.xa[i]) -
                        (this.ya[i] - this.ya[i - 1]) / (this.xa[i] - this.xa[i - 1]);
                    this.u[i] = (6.0 * ddydx / wx - sig * this.u[i - 1]) / p;
                }
                this.y2[n - 1] = 0;
                // This is the back-substitution loop of the tri-diagonal algorithm
                for (i = n - 2; i >= 0; --i) {
                    this.y2[i] = this.y2[i] * this.y2[i + 1] + this.u[i];
                }
            }
            SplineInterpolator.prototype.interpolate = function (x) {
                var n = this.ya.length;
                var klo = 0;
                var khi = n - 1;
                // We will find the right place in the table by means of
                // bisection. This is optimal if sequential calls to this
                // routine are at random values of x. If sequential calls
                // are in order, and closely spaced, one would do better
                // to store previous values of klo and khi.
                while (khi - klo > 1) {
                    var k = (khi + klo) >> 1;
                    if (this.xa[k] > x) {
                        khi = k;
                    }
                    else {
                        klo = k;
                    }
                }
                var h = this.xa[khi] - this.xa[klo];
                var a = (this.xa[khi] - x) / h;
                var b = (x - this.xa[klo]) / h;
                // Cubic spline polynomial is now evaluated.
                return a * this.ya[klo] + b * this.ya[khi] +
                    ((a * a * a - a) * this.y2[klo] + (b * b * b - b) * this.y2[khi]) * (h * h) / 6.0;
            };
            return SplineInterpolator;
        })();
        util.SplineInterpolator = SplineInterpolator;
    })(util = jsfx.util || (jsfx.util = {}));
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
                // initialize a shader cache
                this.gl.shaderCache = {};
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
            Renderer.prototype.getSource = function () {
                return this.source;
            };
            Renderer.prototype.applyFilter = function (filter) {
                filter.drawWebGL(this);
                return this;
            };
            Renderer.prototype.applyFilters = function (filters) {
                var _this = this;
                filters.forEach(function (filter) {
                    filter.drawWebGL(_this);
                });
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
                return this.gl.shaderCache.hasOwnProperty(cacheKey) ?
                    this.gl.shaderCache[cacheKey] :
                    new jsfx.webgl.Shader(this.gl, filter.getVertexSource(), filter.getFragmentSource());
            };
            Renderer.prototype.getDefaultShader = function () {
                if (!this.gl.shaderCache.def) {
                    this.gl.shaderCache.def = new jsfx.webgl.Shader(this.gl);
                }
                return this.gl.shaderCache.def;
            };
            Renderer.prototype.getFlippedShader = function () {
                if (!this.gl.shaderCache.flipped) {
                    this.gl.shaderCache.flipped = new jsfx.webgl.Shader(this.gl, null, "\n                uniform sampler2D texture;\n                varying vec2 texCoord;\n\n                void main() {\n                    gl_FragColor = texture2D(texture, vec2(texCoord.x, 1.0 - texCoord.y));\n                }\n            ");
                }
                return this.gl.shaderCache.flipped;
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
                if (!this.gl.vertexBuffer) {
                    this.gl.vertexBuffer = this.gl.createBuffer();
                }
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.vertexBuffer);
                this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([left, top, left, bottom, right, top, right, bottom]), this.gl.STATIC_DRAW);
                if (!this.gl.texCoordBuffer) {
                    this.gl.texCoordBuffer = this.gl.createBuffer();
                    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.texCoordBuffer);
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
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.vertexBuffer);
                this.gl.vertexAttribPointer(this.vertexAttribute, 2, this.gl.FLOAT, false, 0, 0);
                this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.gl.texCoordBuffer);
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
                this.gl.frameBuffer = this.gl.frameBuffer || this.gl.createFramebuffer();
                this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.gl.frameBuffer);
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
var module = module;
if (typeof module !== 'undefined') {
    module.exports = jsfx;
}
