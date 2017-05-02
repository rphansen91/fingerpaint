module.exports = function (element) {
  var children = [].slice.call(element.children, 0);
  var count = children.length;

  function active () {
    element.classList.add('active');
  }

  function inactive () {
    element.classList.remove('active');
  }

  function radius (r) {
    children.map(function (child, i) {
      child.style['transform'] = compute(r, i);
    });
  }

  function compute (r, i) {
    var degrees = (360 / count) * i;
    var radians = degrees * (Math.PI / 180);
    var x = (Math.cos(radians)*r).toFixed(2);
    var y = (Math.sin(radians)*r).toFixed(2);
    return 'translate3d('+x+'em,'+y+'em, 0)';
  }

  return {
    active: active,
    inactive: inactive,
    radius: radius
  }
}
