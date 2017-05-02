module.exports = {
  "env": {
    "es6": true,
    "browser": true
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "sourceType": "module"
  },
  "rules": {
    "no-console": [
      process.env.NODE_ENV === "prod" ? "error" : "off",
      { "allow": ["info"] }
    ],
    "indent": [
      "error",
      2,
      {"SwitchCase": 1}
    ],
    "linebreak-style": [
      "error",
      "unix"
    ]
  }
};
