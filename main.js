var PALLET = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4B0082', '#9400D3']

window.onload = initialize;

function initialize () {   
    var width = window.innerWidth;
    var height = window.innerHeight;
    var canvas = find('#canvas');
    canvas.width = width;
    canvas.height = height;
    var context = canvas.getContext('2d');

    var gallery = paintingGallery(find('#gallery'));
    var pallet = colorPallet(find('#pallet'));
    var radius = brushRadius(find('#radius'));
    var cursor = createCursor();
    var paint = brush(context);
    var lines = [{}];

    gallery.selected(function (item) {
        canvas.width = item.width;
        canvas.height = item.height;
        lines = item.lines;
        draw();
    })

    find('#saved').on('click', showGallery);
    find('#header').on('click', showGallery);

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
    element.on('mousemove', mousemove);
    element.on('mouseleave', mouseleave);
    element.on('touchmove', touchmove);

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

    element.on('mousedown', startDrag);
    element.on('touchstart', startDrag);

    function startDrag (evt) {
        points = [];
        element.on('mousemove', handleDrag);
        element.on('touchmove', handleDrag);
        element.on('mouseup', endDrag);
        element.on('mouseleave', endDrag);
        element.on('touchend', endDrag);
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
    var pickerModal = create('div', { class: 'dialog' });
    var pickerContainer = create('div', { class: 'pickers' });
    var pickerModalDisplay = active(pickerModal, 'active');
    pickerModal.innerHTML = '<h2>Select a color:</h2>'
    pickerModal.appendChild(pickerContainer);

    var pickerColors = PALLET.reverse().map(picker).map(function (elem) {
        pickerContainer.appendChild(elem);
        return elem;
    });
    document.body.appendChild(pickerModal);
    element.on('click', toggle);
    pickerModal.on('click', close);
    setColor(color);

    function picker (c, i, arr) {
        var count = Math.max(8, arr.length);
        var degrees = -(360 / count) * (i - count / 4);
        var radians = degrees * (Math.PI / 180);
        var x = (Math.cos(radians)*8.5).toFixed(2);
        var y = (Math.sin(radians)*8.5).toFixed(2);
        var elem = create('div', { class: 'picker' });
        elem.style['background-color'] = c;
        elem.destination = `translate3d(${x}em,${y}em,0)`;
        elem.on('mouseenter', scale(1.4));
        elem.on('touchstart', scale(1.4));
        elem.on('mouseleave', scale(1));
        elem.on('touchend', scale(1));
        elem.on('click', function (evt) {
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
        pickerModalDisplay.on();
        pickerColors.map(function (picker) {
            picker.style['transform'] = picker.destination;
        })
    }

    function close () {
        pickerModalDisplay.off();
        pickerColors.map(function (picker) {
            picker.style['transform'] = '';
        })
    }

    function toggle () {
        if (pickerModalDisplay.isOn()) {
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
    var rangeEl = create('input', {
        type: 'range',
        value: 10,
        min: 6,
        max: 20
    });
    rangeEl.on('change', onChange);
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
    var element = create('div', { class: 'cursor' });
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
    var galleryDisplay = active(element, 'active');
    
    var closer = create('div', { class: 'gallery-closer' });
    closer.textContent = 'X';
    closer.on('click', hide);
    element.appendChild(closer);

    var container = create('div', { class: 'gallery-container' });
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
        
        Object.keys(items)
        .filter(function (i) { return !!items[i] })
        .map(function (name) {
            var rmEl = create('div', { class: 'gallery-closer' });
            rmEl.style['z-index'] = 2;
            rmEl.textContent = 'X';
            rmEl.on('click', function (evt) {
                evt.stopPropagation();
                paintings.remove(name);
                hide();
                show(inProgress);
            });
            var p = previewPainting(name, items[name]);
            p.addEventListener('click', function () {
                selected(items[name]);
            });
            p.appendChild(rmEl);
            return p;
        }).map(container.appendChild.bind(container));
        
        galleryDisplay.on();
    }

    function hide () {
        container.innerHTML = '';
        galleryDisplay.off();
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
    var preview = create('div', { class: 'preview' });

    var canvas = create('canvas');
    canvas.width = item.width;
    canvas.height = item.height;
    var context = canvas.getContext('2d');

    var paint = brush(context);
    paint.lines(item.lines);
    
    preview.appendChild(canvas);
    return preview;
}