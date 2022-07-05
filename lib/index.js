const {read} = require("./file")

const tokenize = require("./tokenizer/index")
const parser = require("./parser/index")

module.exports = {
  renderer: (path) => {
    const fileContent = read(path).split("\n")
    return parser(tokenize(fileContent))
  }
}