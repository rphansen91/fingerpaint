export default function brush (context) {
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
