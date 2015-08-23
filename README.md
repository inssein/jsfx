[![NPM version][npm-badge]][npm-url]
[![Download Status][download-badge]][npm-url]
[![Dependency Status][dep-badge]][dep-url]

# jsfx

An image effects library, heavily inspired by https://github.com/evanw/glfx.js. I needed something that could fallback 
to a canvas, and additionally, I needed the same effects to render server side.

This library is currently in heavy development, and not tested. You should probably refrain from using it in production
until it becomes stable.

Demo: http://jsfx.inssein.com

# todo

* Get feedback on usage of Typescript (the way files are separated, lack of Uint8TypedArray in UnsharpMask, etc).
* Figure out how to have certain static variables per WebGL Rendering context. I am currently casting to any, and 
  assigning a variable. (vertexBuffer and texCoordBuffer in Shader, frameBuffer in Texture, and shaderCache in Renderer)
* Add more filters
* A lot of the filter files have the comments and the webgl shaders copied from glfx.js. I should probably attribute the 
  single files as well as mentioning it in the credits.
* Add tests
* Test server side rendering with node-canvas, and add documentation

# future
* Currently, only the Canvas filters take advantage of IterableFilter. Perhaps implement something similar for WebGL 
  whereby shaders for a combination of filters are generated, and applied once. This is not very important as these 
  filters are fairly light weight, and the WebGL implementation is already considered much faster (relative to Canvas).

# credits
* https://github.com/evanw/glfx.js

# license

MIT © [Hussein Jafferjee][author]

[author]: https://github.com/inssein
[npm-url]: https://npmjs.org/package/jsfx
[npm-badge]: https://img.shields.io/npm/v/jsfx.svg?style=flat-square
[dep-url]: https://david-dm.org/inssein/generator-rise
[dep-badge]: https://david-dm.org/inssein/jsfx.svg?style=flat-square
[download-badge]: http://img.shields.io/npm/dm/jsfx.svg?style=flat-square
