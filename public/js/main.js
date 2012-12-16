var Bubble = {};

// Prevent scroling on the iPhone / iPad
document.ontouchstart = function(e) {
    e.preventDefault();
};
document.ontouchmove = function(e) {
    e.preventDefault();
};

// Detect support for HSL(A) (borrowed to the Modernizr project)
(function() {
    function contains(str, substr) {
        return !!~('' + str).indexOf(substr);
    }

    var elem = document.createElement('div');
    var style = elem.style;
    style.cssText = 'background-color:hsla(120,40%,100%,.5)';

    Bubble.hslaSupport = contains(style.backgroundColor, 'rgba') || contains(style.backgroundColor, 'hsla');
})();

(function() {
    var canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d');

    // resize the canvas to fill browser window dynamically
    window.addEventListener('resize', resizeCanvas, false);

    function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    
    var multiRadios = $('input[type="radio"][name="mode"]');
    Bubble.multi = multiRadios.filter(':checked').val() == 'multi';
    multiRadios.on('change', function(event) {
        Bubble.multi = multiRadios.filter(':checked').val() == 'multi';
    });
})();

Bubble.canvas = oCanvas.create({ canvas: "#canvas", background: "#EEE" });

console.log('width : ' + canvas.width);
console.log('height : ' + canvas.height);

//Bubble.audiolet = new Audiolet();

Bubble.socket = io.connect();

Bubble.canvas.bind('mousedown touchstart', function(event) {
    Bubble.canvas.startTime = +new Date();
});

Bubble.canvas.bind('mouseup touchend', function(event) {
    
    if ((Bubble.canvas.mouse.canvasFocused && Bubble.canvas.mouse.canvasHovered) || (Bubble.canvas.touch.canvasFocused && Bubble.canvas.touch.canvasHovered)) {
        var x = event.x;
        var y = event.y;
        
        var hue = x / Bubble.canvas.width * 360 + 30;
        var sat = 100;
        var light = y / Bubble.canvas.height * 100;
        
        var radius = Bubble.canvas.width / 20;
        
        if (Bubble.canvas.startTime) {
            radius = Math.min(Math.max(5, (+new Date() - Bubble.canvas.startTime) / 2), Bubble.canvas.width / 5);
        }
        
        if (Bubble.multi) {
            Bubble.socket.emit('bubble', { hue: hue, sat: sat, light: light, x: x, y: y, radius: radius });
        }
        
        launchBubble(hue, sat, light, x, y, radius);
    } else {
        console.log('You mouseuped outside of the canvas');
    }
});

Bubble.socket.on('bubble', function(data) {
    if (Bubble.multi) {
        launchBubble(data.hue, data.sat, data.light, data.x, data.y, data.radius);
    }
});

var launchBubble = function(hue, sat, light, x, y, radius) {
    
    var rgbFillStart = hslToRgb(hue, sat, light);
    var fillStart = 'rgb(' + rgbFillStart.R + ', ' + rgbFillStart.G + ', ' + rgbFillStart.B + ')';
    var rgbStrokeStart = hslToRgb(hue, sat, light / 3);
    var strokeStart = 'rgb(' + rgbStrokeStart.R + ', ' + rgbStrokeStart.G + ', ' + rgbStrokeStart.B + ')';
    
    var rgbFillEnd = hslToRgb(hue, sat, 0);
    var fillEnd = 'rgb(' + rgbFillEnd.R + ', ' + rgbFillEnd.G + ', ' + rgbFillEnd.B + ')';
    
    var xEnd = x + (Math.random() * (Bubble.canvas.width / 5) - (Bubble.canvas.width / 10));
    var yEnd = Bubble.canvas.height - radius;
    
    var circle = Bubble.canvas.display.ellipse({
        x: x,
        y: y,
        radius: radius,
        fill: fillStart,
        stroke: '1px ' + strokeStart,
        shadow: '2px 2px 5px #000',
        opacity: 1
    }).add().animate({
        x: xEnd,
        y: yEnd,
        fill: fillEnd,
        opacity: 0.2
    }, {
        duration : 'long',
        easing : 'ease-out-bounce',
        callback : function() {
            this.remove();
        }
    });
};

function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
    var r, g, b;
    if (s == 0) {
        r = g = b = l;
    } else {
        var l2 = l < 0.5 ? l * (1 + s) : (l + s) - (s * l);
        var l1 = (2 * l) - l2;
        r = hueToRgb(l1, l2, (h + (1 / 3)));
        g = hueToRgb(l1, l2, h);
        b = hueToRgb(l1, l2, (h - (1 / 3)));
    }
    r = Math.round(255 * r);
    g = Math.round(255 * g);
    b = Math.round(255 * b);
    return {
        R : r,
        G : g,
        B : b
    };
}

// helper function used above
function hueToRgb(l1, l2, h) {
    if (h < 0)
        h += 1;
    if (h > 1)
        h -= 1;
    if (h < 1 / 6)
        return (l1 + (l2 - l1) * 6 * h);
    if (h < 1 / 2)
        return l2;
    if (h < 2 / 3)
        return (l1 + (l2 - l1) * ((2 / 3) - h) * 6);
    return l1;
}


