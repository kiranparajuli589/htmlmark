const lexer = require("./lexer")
const parser = require("./parser")
const { read } = require("./util/file")
const Lexer = require("./lexer")


module.exports = {
  Lexer,
  parser,
  /**
   * a wrapper for the lexer and parser
   * @param {string} filePath file path
   * @returns a html string
   */
  toHtml: (filePath) => {
    const fileContent = read(filePath)
    const lineArray = fileContent.split("\n")
    const start = Date.now()
    const lexer = new Lexer(lineArray)
    const html = parser(lexer.run())
    const end = Date.now()
    console.info(`\x1b[35mParsing time: ${end - start}ms\x1b[0m`)
    return html
  }
}
