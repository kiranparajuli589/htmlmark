const innerTokenizer = require("./innerTokenizer")
const outerTokenizer = require("./outerTokenizer")

const tokenize = (lines) => {
  return innerTokenizer(outerTokenizer(lines))
}

module.exports = tokenize