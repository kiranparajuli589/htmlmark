const {read} = require("./file")

const lexer = require("./tokenizer/lexer")
const parser = require("./parser/index")

module.exports = {
  /**
   * a wrapper for the lexer and parser
   * 
   * @param {string} path path to a markdown file
   * @returns a html string
   */
  renderer: (path) => {
    const fileContent = read(path).split("\n")
    return parser(lexer(fileContent))
  }
}