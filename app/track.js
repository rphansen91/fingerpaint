export function trackMove (element, fn) {
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

export function trackDrag (element, fn) {
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
