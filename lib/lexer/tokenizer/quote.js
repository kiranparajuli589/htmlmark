import { REGEX } from "../../regex/index.js"
import Commons from "./commons"
import Lexer from "../index.js"
import { TOKENS } from "../../util/tokens.js"


export default class Quote {
  static GetNthIndex(text, position, delimiter = ">") {
    let count = 0
    for (let i = 0; i < text.length; i++){
      if (text[i] === delimiter) {
        count++
        if (count === position) {
          return i
        }
      }
    }
    return -1
  }
  static getDepth(text) {
    text = text.trimStart()
    if (text[0] !== ">") return 0
    const firstNonQuote = text.search(/[^>\s\t]/)
    const quotePart = text.substring(0, firstNonQuote)
    return quotePart.match(/>/g).length
  }
  static getValue(text, depth) {
    text = text.trimStart()
    const cursor = this.GetNthIndex(text, depth)
    return text.substring(cursor + 1)
  }
  static findEndCursor(lines, cursor, indent, depth) {
    let nextLine = lines[cursor]
    let nextLineDepth, nextLineIndent, nextLineMatch

    do {
      nextLine = lines[++cursor]
      REGEX.QUOTE.lastIndex = 0
      nextLineMatch = (nextLine !== undefined) ? REGEX.QUOTE.test(nextLine) : null
      nextLineIndent = (nextLineMatch) ? Commons.getIndent(nextLine) : null
      nextLineDepth = (nextLineMatch) ? this.getDepth(nextLine) : null
    } while(
      nextLine !== undefined &&
      nextLineMatch &&
      nextLineIndent === indent &&
      nextLineDepth >= depth
    )
    return cursor - 1
  }
  static shrinkBody(body, qDepth) {
    const sBody = []
    for (let i = 0; i < body.length; i++) {
      const lastItemInQBody = sBody[sBody.length - 1] || false
      REGEX.QUOTE.lastIndex = 0
      if (REGEX.QUOTE.test(body[i])) {
        const currDepth = this.getDepth(body[i])
        if (lastItemInQBody &&
          lastItemInQBody.type === TOKENS.QUOTE &&
          currDepth === lastItemInQBody.depth
        ) {
          lastItemInQBody.value.push(this.getValue(body[i], currDepth))
        } else {
          sBody.push({
            type: TOKENS.QUOTE,
            depth: currDepth,
            value: [this.getValue(body[i], currDepth)]
          })
        }
      } else {
        if (
          lastItemInQBody &&
          lastItemInQBody.type === TOKENS.TEXT
        ) {
          lastItemInQBody.value.push(body[i])
        } else {
          sBody.push({
            type: TOKENS.TEXT,
            value: [body[i]],
          })
        }
      }
    }
    return sBody
  }
  static tokenize(lines, cursor, indent) {
    const qDepth = this.getDepth(lines[cursor])

    const endCursor = this.findEndCursor(lines, cursor, indent, qDepth)

    const body = lines.slice(cursor, endCursor + 1)
      .map(line => this.getValue(line, qDepth))

    const shrunkBody = this.shrinkBody(body, qDepth)

    console.log(shrunkBody)

    return {
      depth: qDepth,
      body,
      cursor: cursor - 1
    }
  }
}
