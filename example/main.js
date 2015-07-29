// create the new image we want to use for the texture
var image = new Image();

// setup onload
image.onload = function () {
    console.log("IMAGE LOADED: " + image.width + " x " + image.height);

    var source = new jsfx.Source(image);
    var brightnessFilter = new jsfx.filter.BrightnessContrast(0, -0.5);

    ['webgl', 'canvas'].forEach(function(type) {
        var renderer = new jsfx.Renderer(type);
        var canvas = document.getElementById(type);
        var context = canvas.getContext('2d');

        // render the image
        renderer
            .setSource(source)
            .applyFilter(brightnessFilter)
            .render()
        ;

        // draw render on to respective canvas
        var scale = zoomToFit(image.width, image.height, canvas.width, canvas.height);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(renderer.getCanvas(), 0, 0, image.width, image.height, 0, 0, image.width * scale, image.height * scale);
    });
};

// load the image
var src = document.getElementById('texture').src;
image.src = src;

function zoomToFit(innerWidth, innerHeight, outerWidth, outerHeight) {
    return innerWidth / innerHeight > outerWidth / outerHeight ? outerWidth / innerWidth : outerHeight / innerHeight;
}