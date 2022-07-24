module.exports = {
  "env": {
    "node": true,
    "browser": true,
    "es2022": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:import/recommended",
  ],
  "parserOptions": {
    "ecmaVersion": "latest"
  },
  "overrides": [{
    "files": ["**/*.spec.js"],
    "env": {
      "jest": true
    }
  }],
  "rules": {
    "no-var": "error",
    "indent": ["error", 2],
    "no-multi-spaces": "error",
    "semi": ["error", "never"],
    "quotes": ["error", "double"],
    "linebreak-style": ["error", "unix" ],
    "object-curly-spacing": ["error", "always"],
    "import/newline-after-import": ["error", { "count": 2 }],
    "no-console": ["error", { "allow": ["debug", "info", "error"] }]
  }
}
