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

  ////////////////////
  // Define Filters //
  ////////////////////
  var filters = [
    new Filter(
      'Brightness / Contrast',
      function() {
        this.addSlider('brightness', 'Brightness', -1, 1, 0, 0.01);
        this.addSlider('contrast', 'Contrast', -1, 1, 0, 0.01);
      },
      function(renderer) {
        renderer.applyFilter(new jsfx.filter.BrightnessContrast(this.brightness, this.contrast));
      })
  ];

  //////////////////////////
  // Initialize Renderers //
  //////////////////////////
  var renderers = {
    webgl:  new jsfx.Renderer('webgl'),
    canvas: new jsfx.Renderer('canvas')
  };

  ////////////////////////
  // Initialize Texture //
  ////////////////////////
  var texture = new Image();
  var source = null;
  texture.onload = function() {
    source = new jsfx.Source(this);

    // draw the filter once
    redraw(currentFilter);
  };
  texture.src = 'img/sample_thumb.jpg';

  /////////////////////
  // Redraw Function //
  /////////////////////
  function redraw(filter) {
    Object.keys(renderers).forEach(function(type) {
      var renderer = renderers[type];

      // ensure source
      renderer.setSource(source);

      // set the filter properties
      for(var i = 0; i < filter.sliders.length; i++) {
        var slider = filter.sliders[i];
        filter[slider.name] = parseFloat($("#" + slider.name).val());
      }

      // draw filter
      filter.draw(renderer);

      // render the canvas
      renderer.render();

      // show results
      var canvas = document.getElementById(type);
      var $container = $(canvas).parent();
      var context = canvas.getContext('2d');
      var scale = zoomToFit(source.width, source.height, $container.width(), 416);

      // set the canvas size
      canvas.width = source.width * scale;
      canvas.height = source.height * scale;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(renderer.getCanvas(), 0, 0, source.width, source.height, 0, 0, canvas.width, canvas.height);
    });
  }

  ///////////////
  // Setup DOM //
  ///////////////
  var currentFilter = filters[0];
  var $filter = $('#filter');
  var $properties = $("#properties");

  // add bind to change
  $filter.change(onFilterChange);
  $properties.on('input change', onFilterPropertyChange);

  // add values
  filters.forEach(function(filter, i) {
    $filter.append('<option value="' + i + '">' + filter.name + '</option>');
  });

  // setup function that fires when filter changes
  function onFilterChange() {
    currentFilter = filters[parseInt($filter.val(), 10)];
    setupFilter(currentFilter);
  }

  function onFilterPropertyChange() {
    redraw(currentFilter);
  }

  function setupFilter(filter) {
    // clear out properties
    $properties.empty();

    // add sliders
    for(var i = 0; i < filter.sliders.length; i++) {
      $properties.append(generateRow(filter.sliders[i]));
    }
  }

  function generateRow(slider) {
    return '<div class="form-group"><label for="' + slider.name + '" class="col-sm-1 control-label">' + slider.label + '</label><div class="col-sm-3"><input type="range" id="' + slider.name + '" value="' + slider.value + '" min="' + slider.min + '" max="' + slider.max + '" step="' + slider.step + '" /></div></div>';
  }

  // setup current filter
  setupFilter(currentFilter);

  ///////////////////////
  // Utility Functions //
  ///////////////////////
  function zoomToFit(innerWidth, innerHeight, outerWidth, outerHeight) {
    return innerWidth / innerHeight > outerWidth / outerHeight ? outerWidth / innerWidth : outerHeight / innerHeight;
  }
})();
