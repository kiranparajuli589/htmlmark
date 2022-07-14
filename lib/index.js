const {read} = require("./util/file")

const lexer = require("./lexer")
const parser = require("./parser")

module.exports = {
  lexer,
  parser,
  /**
   * a wrapper for the lexer and parser
   *
   * @param {string} path path to a markdown file
   * @returns a html string
   */
  toHtml: (path) => {
    const fileContent = read(path).split("\n")
    const start = Date.now()
    // const html = parser(lexer(fileContent))
    const tokens = lexer(fileContent)
    const html = parser(tokens)
    const end = Date.now()
    console.info(`\x1b[35mParsing time: ${end - start}ms\x1b[0m`)
    return html
  }
}
