function domEl (element) {
    element.on = element.addEventListener.bind(element);
    return element;
}

function find (selector) {
    return domEl(document.querySelector(selector));
}

function create (tagName, options) {
    options = options || {};

    var element = document.createElement(tagName);

    for (opt in options) {
        element.setAttribute(opt, options[opt]);
    }

    return domEl(element);
}

function active (element, name) {
    return {
        isOn: function () {
            return element.classList.contains(name)
        },
        on: function () {
            element.classList.add(name)
        },
        off: function () {
            element.classList.remove(name)
        }
    }
}