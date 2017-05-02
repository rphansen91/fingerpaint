var serialize = JSON.stringify.bind(JSON);
var tokenize = JSON.parse.bind(JSON);

module.exports = function (key) {
  function all () {
    return tokenize(localStorage.getItem(key)) || {};
  }

  function save (items) {
    return localStorage.setItem(key, serialize(items));
  }

  return {
    items: all,
    remove: function (name) {
      var items = all();
      items[name] = null;
      save(items);
    },
    save: function (name, item) {
      var items = all();
      items[name] = item;
      save(items);
    }
  }
}
