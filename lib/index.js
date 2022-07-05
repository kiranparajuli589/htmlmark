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
    const start = Date.now()
    const html = parser(lexer(fileContent))
    const end = Date.now()
    console.info(`\x1b[35mParsing time: ${end - start}ms\x1b[0m`)
    return html
  }
}