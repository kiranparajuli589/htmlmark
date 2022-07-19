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
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta http-equiv="X-UA-Compatible" content="ie=edge">
      <title>Document</title>
    </head>
    <body>
      ${parser(lexer(fileContent))}
    </body>
    </html>
    `
    const end = Date.now()
    console.info(`\x1b[35mParsing time: ${end - start}ms\x1b[0m`)
    return html
  }
}
