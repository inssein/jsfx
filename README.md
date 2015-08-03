# jsfx

An image effects library, heavily inspired by https://github.com/evanw/glfx.js. I needed something that could fallback to a canvas, and additionally, I needed the same effects to render server side.

Demo: https://jsfx.inssein.com

# todo

* Need to move jsfx.Filter and jsfx.FilterInterface into the jsfx.filter namespace, but the compilation doesn't work as the single output file is not ordered (BrightnessContrast gets defined before the interface or base class)
* Get feedback on usage of Typescript (the way files are separated, lack of Uint8TypedArray in UnsharpMask, etc).
* Figure out how to have certain static variables per WebGL Rendering context. I am currently casting to any, and assigning a variable. (vertexBuffer and texCoordBuffer in Shader, frameBuffer in Texture, and shaderCache in Renderer)
* Add more filters
* Think of a way to apply all the canvas filters in one loop of ImageData, instead of looping n times (n = number of filters). If this works, we should break up the BrightnessContrast and HueSaturation filters into separate filters.
* A lot of the filter files have the comments and the webgl shaders copied from glfx.js. I should probably attribute the single files as well as mentioning it in the credits.
* Add tests
* Test server side rendering with node-canvas, and add documentation
* Add minified build


# credits
* https://github.com/evanw/glfx.js

# license

MIT
