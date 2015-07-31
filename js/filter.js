(function() {
  "use strict";

  ///////////////////////////////////////////////////////////////////////
  // Define Filter Object                                              //
  //  -> Idea stolen from http://evanw.github.io/glfx.js/media/demo.js //
  ///////////////////////////////////////////////////////////////////////
  function Filter(name, init, fun) {
    this.name = name;
    this.sliders = [];
    this.fun = fun;

    init.call(this);
  }

  Filter.prototype.addSlider = function(name, label, min, max, value, step) {
    this.sliders.push({ name: name, label: label, min: min, max: max, value: value, step: step });
  };

  Filter.prototype.draw = function(renderer) {
    this.fun.call(this, renderer);
  };

  // expose
  var demo = window.demo || (window.demo = {});
  demo.Filter = Filter;
})();