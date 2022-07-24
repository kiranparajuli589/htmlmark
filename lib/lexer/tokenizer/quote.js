const { QUOTE } = require("../../regex")
const { getIndent } = require("./commons")
const { Lexer } = require("../../index")


module.exports = class Quote {
  static getDepth(text) {
    const match = text.match(/^\s*(>\s)+/g)
    if (match) {
      const quoteIdentifier = match[0].replaceAll(" ", "")
      return quoteIdentifier.length
    } else {
      throw new Error(`Text: ${text} is not of type quote`)
    }
  }
  static tokenize(lines, cursor, indent) {
    const body = []
    let nextLine = lines[cursor]
    let nextLineDepth,
      nextLineIndent,
      nextLineMatch

    const depth = this.getDepth(nextLine)

    do {
      body.push(nextLine.trimStart().slice(depth*2))
      cursor++
      nextLine = lines[cursor]
      nextLineMatch = (nextLine) ? nextLine.match(QUOTE) : null
      nextLineIndent = (nextLineMatch) ? getIndent(nextLine) : null
      nextLineDepth = (nextLineMatch) ? this.getDepth(nextLine) : null
    } while(
      nextLine &&
      nextLineMatch &&
      nextLineIndent === indent &&
      nextLineDepth >= depth
    )

    // this body can have any paragraph type
    // it can have headings, list, table, quote, codeblock, new line inside
    // we've to build some recursive engine to be able to call the lexer again
    // on the body
    // TODO BIG

    // const quoteLexer = new Lexer(body)
    // const quoteLexed = quoteLexer.run()
    // console.log(quoteLexed)


    return {
      depth,
      body,
      cursor: cursor - 1
    }
  }
}
