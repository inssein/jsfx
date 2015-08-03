(function($) {
  "use strict";

  var demo = window.demo;

  // state variables
  var renderers = [];
  var currentFilter = demo.filters[0];
  var source = null;

  // dom elements
  var $renderers = $('#renderers').find('input');
  var $filter = $('#filter');
  var $canvases = $('#canvases');
  var $properties = $("#properties");

  // from three.js (check if we have webgl)
  var hasWebGL = (function() {
    try {
      var canvas = document.createElement('canvas');
      return !!( window.WebGLRenderingContext && ( canvas.getContext('webgl') || canvas.getContext('experimental-webgl') ) );
    } catch (e) {
      return false;
    }
  })();

  // if webgl is not available, disable it as an option
  if (!hasWebGL) {
    $renderers.filter('#webgl')
      .prop('checked', false)
      .prop('disabled', true)
      .parent().append(" (Not Available)");
  }

  ////////////////////////
  // Initialize Texture //
  ////////////////////////
  var texture = new Image();
  texture.onload = function() {
    source = new jsfx.Source(this);

    renderEffects(currentFilter);
  };
  texture.src = 'img/sample_thumb.jpg';

  /////////////////////
  // Setup Renderers //
  /////////////////////
  $renderers
    .change(function() {
      renderCanvases();

      if (source) {
        renderEffects(currentFilter);
      }
    })
    .trigger('change');

  ///////////////////
  // Setup Filters //
  ///////////////////
  $filter.change(function() {
    currentFilter = demo.filters[parseInt($filter.val(), 10)];
    renderFilter(currentFilter);
    renderEffects(currentFilter);
  });
  $properties.on('input change', function() {
    renderEffects(currentFilter)
  });

  // add filter select options
  demo.filters.forEach(function(filter, i) {
    $filter.append('<option value="' + i + '">' + filter.name + '</option>');
  });

  // setup current filter
  renderFilter(currentFilter);

  //////////////////////
  // Render Functions //
  //////////////////////
  function renderCanvases() {
    // clear current renderers
    $canvases.empty();
    renderers = [];

    $renderers.filter(':checked').each(function() {
      var $el = $(this);
      var id = $el.attr('id');

      // create canvas
      $canvases.append(generateRendererCanvas(id, $el.parent().text()));

      // create renderer
      renderers.push(new jsfx.Renderer(id));
    });
  }

  function renderFilter(filter) {
    // clear out properties
    $properties.empty();

    // add sliders
    for (var i = 0; i < filter.sliders.length; i++) {
      $properties.append(generateSlider(filter.sliders[i]));
    }
  }

  function renderEffects(filter) {
    renderers.forEach(function(renderer) {
      var type = renderer instanceof jsfx.canvas.Renderer ? 'canvas' : 'webgl';

      if (!renderer) {
        // skip if webgl is not available
        return;
      }

      // ensure source
      renderer.setSource(source);

      // set the filter properties
      for (var i = 0; i < filter.sliders.length; i++) {
        var slider = filter.sliders[i];
        filter[slider.name] = parseFloat($("#" + slider.name).val());
      }

      // draw filter
      filter.draw(renderer);

      // render the canvas
      renderer.render();

      // show results
      var $canvas = $('#canvas-' + type);
      var canvas = $canvas[0];
      var context = canvas.getContext('2d');
      var scale = zoomToFit(source.width, source.height, $canvas.parent().width(), 416);

      // set the canvas size
      canvas.width = source.width * scale;
      canvas.height = source.height * scale;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(renderer.getCanvas(), 0, 0, source.width, source.height, 0, 0, canvas.width, canvas.height);
    });
  }

  ///////////////////////
  // Utility Functions //
  ///////////////////////
  function zoomToFit(innerWidth, innerHeight, outerWidth, outerHeight) {
    return innerWidth / innerHeight > outerWidth / outerHeight ? outerWidth / innerWidth : outerHeight / innerHeight;
  }

  function generateRendererCanvas(type, label) {
    return $('<div class="col-lg-6"><div class="thumbnail"><canvas id="canvas-' + type + '" class="img-rounded img-responsive"></canvas><div class="caption">' + label + '</div></div></div>')
  }

  function generateSlider(slider) {
    return '<div class="form-group"><label for="' + slider.name + '" class="col-sm-1 control-label">' + slider.label + '</label><div class="col-sm-3"><input type="range" id="' + slider.name + '" value="' + slider.value + '" min="' + slider.min + '" max="' + slider.max + '" step="' + slider.step + '" /></div></div>';
  }
})($);
