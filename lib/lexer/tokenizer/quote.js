const {QUOTE} = require("../../regex")
const {getIndent} = require("./commons")

module.exports = {
  getQuoteDepth(text) {
    const match = text.match(/^\s*(>\s)+/g)
    if (match) {
      const quoteIdentifier = match[0].replaceAll(" ", "")
      return quoteIdentifier.length
    } else {
      throw new Error(`Text: ${text} is not of type quote`)
    }
  },
  findTheEndOfQuote(lines, cursor, indent) {
    const body = []
    let cursorPosition = cursor
    let nextLine = lines[cursorPosition]
    let nextLineDepth,
      nextLineIndent,
      nextLineMatch

    const depth = module.exports.getQuoteDepth(lines[cursor])

    do {
      body.push(nextLine.trimStart().slice(depth*2))
      cursorPosition++
      nextLine = lines[cursorPosition]
      nextLineMatch = (nextLine) ? lines[cursorPosition].match(QUOTE) : null
      nextLineIndent = (nextLineMatch) ? getIndent(nextLine) : null
      nextLineDepth = (nextLineMatch) ? module.exports.getQuoteDepth(nextLine) : null
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


    return {
      depth,
      body,
      cursor: cursorPosition - 1
    }
  },

}
