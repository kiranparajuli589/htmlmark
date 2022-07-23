const lexer = require("./lexer")
const parser = require("./parser")
const { read } = require("./util/file")


module.exports = {
  lexer,
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
    const html = parser(lexer(lineArray))
    const end = Date.now()
    console.info(`\x1b[35mParsing time: ${end - start}ms\x1b[0m`)
    return html
  }
}
