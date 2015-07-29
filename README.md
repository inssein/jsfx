# jsfx

A real time WebGL image effects library, heavily inspired by https://github.com/evanw/glfx.js. I needed something that could fallback to a canvas, and additionally, I needed the same effects to render server side.

# todo

* Need to move jsfx.Filter and jsfx.FilterInterface into the jsfx.filter namespace, but the compilation doesn't work as the single file is not ordered (BrightnessContrast gets defined before the interface or base class)
* Get feedback on usage of Typescript (the way files are separated, etc).
* Add the rest of the filters
* Add tests


# credits
* https://github.com/evanw/glfx.js

# license

MIT
