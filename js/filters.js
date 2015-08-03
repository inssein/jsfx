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
    ),
    new demo.Filter('Sepia', function() {
      this.addSlider('amount', 'Amount', 0, 1, 1, 0.01);
    }, function(renderer) {
      renderer.applyFilter(new jsfx.filter.Sepia(this.amount));
    }),
    new demo.Filter('Blur', function() {
      this.addSlider('radius', 'Radius', 0, 180, 20, 1);
    }, function(renderer) {
      renderer.applyFilter(new jsfx.filter.Blur(this.radius));
    }),
    new demo.Filter('Unsharp Mask', function() {
      this.addSlider('radius', 'Radius', 0, 180, 20, 1);
      this.addSlider('strength', 'Strength', 0, 5, 2, 0.01);
    }, function(renderer) {
      renderer.applyFilter(new jsfx.filter.UnsharpMask(this.radius, this.strength));
    })
  ];
})();