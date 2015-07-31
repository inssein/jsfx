(function() {
  "use strict";

  var demo = window.demo || (window.demo = {});

  demo.filters = [
    new demo.Filter(
      'Brightness / Contrast',
      function() {
        this.addSlider('brightness', 'Brightness', -1, 1, 0, 0.01);
        this.addSlider('contrast', 'Contrast', -1, 1, 0, 0.01);
      },
      function(renderer) {
        renderer.applyFilter(new jsfx.filter.BrightnessContrast(this.brightness, this.contrast));
      }
    ),
    new demo.Filter(
      'Hue / Saturation',
      function() {
        this.addSlider('hue', 'Hue', -1, 1, 0, 0.01);
        this.addSlider('saturation', 'Saturation', -1, 1, 0, 0.01);
      },
      function(renderer) {
        renderer.applyFilter(new jsfx.filter.HueSaturation(this.hue, this.saturation));
      }
    )
  ];
})();