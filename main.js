var PALLET = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4B0082', '#9400D3']

window.onload = initialize;

function initialize () {   
    var width = window.innerWidth;
    var height = window.innerHeight;
    var canvas = document.getElementById('canvas');
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext('2d');

    var gallery = paintingGallery(document.getElementById('gallery'));
    var pallet = colorPallet(document.getElementById('pallet'));
    var radius = brushRadius(document.getElementById('radius'));
    var cursor = createCursor();
    var paint = brush(context);
    var lines = [{}];

    gallery.selected(function (item) {
        canvas.width = item.width;
        canvas.height = item.height;
        lines = item.lines;
        draw();
    })

    document.getElementById('saved').addEventListener('click', showGallery)
    document.getElementById('header').addEventListener('click', showGallery)

    function showGallery () {
        gallery.show({
            lines: lines,
            height: height,
            width: width
        });
    }

    radius.onChange(pallet.setRadius);

    trackMove(canvas, function (pos) {
        if (!pos) return cursor.hide();
        cursor.track(pos, pallet.value(), radius.value());
    });

    trackDrag(canvas, function (drag) {
        if (!drag.dragging) return lines.push({});

        lines[lines.length - 1] = {
            points: drag.points,
            color: pallet.value(),
            radius: radius.value()
        }
        
        draw();
    })

    function draw (x) {
        context.clearRect(0,0,600,600);
        paint.lines(lines);
    }
}

function brush (context) {
    function circle (radius) {
        return function (point) {
            context.beginPath();
            context.arc(point.x, point.y, radius, 0, Math.PI * 2);
            context.fill();   
        }
    }

    function lines (ls) {
        ls.map(line);
    }

    function line (options) {
        var radius = options.radius || 10;
        if (options.color) context.fillStyle = options.color;
        (options.points || []).map(circle(radius));
    }

    return {
        circle: circle,
        lines: lines,
        line: line
    }
}

function trackMove (element, fn) {
    element.addEventListener('mousemove', mousemove);
    element.addEventListener('mouseleave', mouseleave);
    element.addEventListener('touchmove', touchmove);

    function mousemove (evt) {
        var x = evt.pageX - element.offsetLeft;
        var y = evt.pageY - element.offsetTop;
        fn({ x: x, y: y })
    }

    function touchmove (evt) {
        evt.preventDefault();
        mousemove(evt);
    }

    function mouseleave () {
        fn()
    }

    return function () {
        element.removeEventListener('mousemove', mousemove);
        element.removeEventListener('mouseleave', mouseleave);
        element.removeEventListener('touchmove', touchmove);
    }
}

function trackDrag (element, fn) {
    var points = [];

    element.addEventListener('mousedown', startDrag);
    element.addEventListener('touchstart', startDrag);

    function startDrag (evt) {
        points = [];
        element.addEventListener('mousemove', handleDrag);
        element.addEventListener('touchmove', handleDrag);
        element.addEventListener('mouseup', endDrag);
        element.addEventListener('mouseleave', endDrag);
        element.addEventListener('touchend', endDrag);
    }

    function handleDrag (evt) {
        addPoint(evt, true);
    }

    function endDrag (evt) {
        element.removeEventListener('mousemove', handleDrag);
        element.removeEventListener('touchmove', handleDrag);
        element.removeEventListener('mouseup', endDrag);
        element.removeEventListener('mouseleave', endDrag);
        element.removeEventListener('touchend', endDrag);
        addPoint(evt, false);
    }

    function addPoint (evt, dragging) {
        var x = evt.pageX - element.offsetLeft;
        var y = evt.pageY - element.offsetTop;
        
        points.push({ x: x, y: y });
        
        fn({ points: points, dragging: dragging });
    }

    return function () {
        element.removeEventListener('mousedown', startDrag);
        element.removeEventListener('touchstart', startDrag);
    }
}

function colorPallet (element) {
    var color = PALLET[0];
    var pickerModal = document.createElement('div');
    var pickerContainer = document.createElement('div');
    pickerModal.classList.add('dialog');
    pickerContainer.classList.add('pickers');
    pickerModal.innerHTML = '<h2>Select a color:</h2>'
    pickerModal.appendChild(pickerContainer);

    var pickerColors = PALLET.reverse().map(picker).map(function (elem) {
        pickerContainer.appendChild(elem);
        return elem;
    });
    document.body.appendChild(pickerModal);
    element.addEventListener('click', toggle);
    pickerModal.addEventListener('click', close);
    setColor(color);

    function picker (c, i, arr) {
        var count = Math.max(8, arr.length);
        var degrees = -(360 / count) * (i - count / 4);
        var radians = degrees * (Math.PI / 180);
        var x = (Math.cos(radians)*8.5).toFixed(2);
        var y = (Math.sin(radians)*8.5).toFixed(2);
        var elem = document.createElement('div');
        elem.style['background-color'] = c;
        elem.destination = `translate3d(${x}em,${y}em,0)`;
        elem.classList.add('picker');
        elem.addEventListener('mouseenter', scale(1.4));
        elem.addEventListener('touchstart', scale(1.4));
        elem.addEventListener('mouseleave', scale(1));
        elem.addEventListener('touchend', scale(1));
        elem.addEventListener('click', function (evt) {
            evt.stopPropagation();
            setColor(c);
            close();
        });
        function scale (s) {
            return function () {
                var index = elem.style['transform'].indexOf('scale');
                if (~index) {
                    elem.style['transform'] = elem.style['transform'].slice(0, index) + ' scale('+s+')';
                } else {
                    elem.style['transform'] += ' scale('+s+')';
                }
            }
        }
        return elem;
    }

    function setColor (c) {
        element.style['background-color'] = c;
        color = c;
        close();
    }

    function open () {
        pickerModal.classList.add('active');
        pickerColors.map(function (picker) {
            picker.style['transform'] = picker.destination;
        })
    }

    function close () {
        pickerModal.classList.remove('active');
        pickerColors.map(function (picker) {
            picker.style['transform'] = '';
        })
    }

    function toggle () {
        if (pickerModal.classList.contains('active')) {
            close()
        } else {
            open()
        }
    }

    return {
        value: function () {
            return color;
        },
        setRadius: function (size) {
            element.style['width'] = (size * 2) + 'px';
            element.style['height'] = (size * 2) + 'px';
        }
    }
}

function brushRadius (element) {
    var changedCb;
    var rangeEl = document.createElement('input');
    rangeEl.type = 'range';
    rangeEl.defaultValue = 10;
    rangeEl.min = 6;
    rangeEl.max = 20;
    rangeEl.addEventListener('change', onChange);
    element.appendChild(rangeEl);
    
    function onChange () {
        changedCb && changedCb(rangeEl.value);
    }

    return {
        value: function () {
            return rangeEl.value;
        },
        onChange: function (fn) {
            changedCb = fn;
            onChange();
        }
    }
}

function createCursor () {
    var element = document.createElement('div');
    element.classList.add('cursor');
    document.body.appendChild(element);

    return {
        track: function (position, color, size) {
            element.style['background-color'] = color;
            element.style['width'] = (size * 2) + 'px';
            element.style['height'] = (size * 2) + 'px';
            element.style['left'] = (position.x - size) + 'px';
            element.style['top'] = (position.y - size) + 'px';
            element.style['visibility'] = 'visible';
        },
        hide: function () {
            element.style['visibility'] = 'hidden';
        }
    }
}

function paintingGallery (element) {
    var onSelected;
    var paintings = SafeStorage('paintings');
    
    var closer = document.createElement('div');
    closer.classList.add('gallery-closer');
    closer.addEventListener('click', hide);
    closer.textContent = 'X';
    element.appendChild(closer);

    var container = document.createElement('div');
    container.classList.add('gallery-container');
    element.appendChild(container);

    function show (inProgress) {
        var items = paintings.items();
        console.log(inProgress, items);

        if (inProgress.lines && inProgress.lines[0] && inProgress.lines[0].points) {
            var currPreview = previewPainting('Unsaved', inProgress);
            currPreview.classList.add('current');
            currPreview.addEventListener('click', function () {
                var name = 'Painting: ' + (Object.keys(items).length + 1);
                paintings.save(name, inProgress);
                hide();
            });
            container.appendChild(currPreview);
        }
        
        Object.keys(items).map(function (name) {
            var p = previewPainting(name, items[name]);
            p.addEventListener('click', function () {
                selected(items[name]);
            });
            return p;
        }).map(container.appendChild.bind(container));
        
        element.classList.add('active');
    }

    function hide () {
        container.innerHTML = '';
        element.classList.remove('active');
    }

    function selected (item) {
        onSelected(item);
        hide();
    }

    return {
        show: show,
        hide: hide,
        selected: function (fn) {
            onSelected = fn;
        }
    }
}

function Loader () {
    var wheel = Wheel(document.getElementById('wheel'));

    return function (l) {
        if (l) {
            wheel.radius(3);
            wheel.active();
        } else {
            wheel.radius(0);
            setTimeout(wheel.inactive, 500);
        }
    }
}

function previewPainting (name, item) {
    var preview = document.createElement('div');
    preview.classList.add('preview');

    var canvas = document.createElement('canvas');
    canvas.width = item.width;
    canvas.height = item.height;
    var context = canvas.getContext('2d');

    var paint = brush(context);
    paint.lines(item.lines);
    
    preview.appendChild(canvas);
    return preview;
}