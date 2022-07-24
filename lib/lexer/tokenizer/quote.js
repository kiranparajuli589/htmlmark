import { REGEX } from "../../regex/index.js"
import Commons from "./commons"
import Lexer from "../index.js"


export default class Quote {
  static getDepth(text) {
    const depthRegex = /^\s*(?<quote>(?:>\s?)+)/g
    depthRegex.lastIndex = 0
    if (depthRegex.test(text)) {
      depthRegex.lastIndex = 0
      const match = depthRegex.exec(text)
      const quoteIdentifier = match.groups.quote.replace(/\s/g, "")
      return quoteIdentifier.length
    }
  }
  static getValue(text, depth) {
    const depthRegex = new RegExp("^\\s*(?:>\\s?){" + depth + "}(?<value>.+)", "g")
    depthRegex.lastIndex = 0
    if (depthRegex.test(text)) {
      depthRegex.lastIndex = 0
      const match = depthRegex.exec(text)
      return match.groups.value
    } else {
      throw new Error(`Text: ${text} is not of type quote`)
    }
  }
  static tokenize(lines, cursor, indent) {
    const body = []

    let nextLine = lines[cursor]
    let nextLineDepth, nextLineIndent, nextLineMatch

    const qDepth = this.getDepth(nextLine)

    do {
      body.push(this.getValue(nextLine, qDepth))

      nextLine = lines[++cursor]
      REGEX.QUOTE.lastIndex = 0
      nextLineMatch = (nextLine !== undefined) ? REGEX.QUOTE.test(nextLine) : null
      nextLineIndent = (nextLineMatch) ? Commons.getIndent(nextLine) : null
      nextLineDepth = (nextLineMatch) ? this.getDepth(nextLine) : null
    } while(
      nextLine !== undefined &&
      nextLineMatch &&
      nextLineIndent === indent &&
      nextLineDepth >= qDepth
    )

    // this body can have any paragraph type
    // it can have headings, list, table, quote, codeblock, new line inside
    // we've to build some recursive engine to be able to call the lexer again
    // on the body
    // TODO BIG

    const quoteLexer = new Lexer(body)
    const quoteLexed = quoteLexer.run()
    console.log(quoteLexed)


    return {
      depth: qDepth,
      body,
      cursor: cursor - 1
    }
  }
}
