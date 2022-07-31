import { Lexer } from "../index.js"
import { Commons } from "./commons.js"
import { REGEX } from "../../regex/index.js"
import { TOKENS } from "../../util/tokens.js"


export class Quote {
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
    REGEX.EMPTY_QUOTE.lastIndex = 0
    if (REGEX.EMPTY_QUOTE.test(text.trim())) return text.match(/>/g).length
    const firstNonQuote = text.search(/[^>\s\t]/)
    const quotePart = text.substring(0, firstNonQuote)
    return quotePart.match(/>/g).length
  }
  static getValue(text, depth) {
    text = text.trimStart()
    const cursor = this.GetNthIndex(text, depth)
    return text.substring(cursor + 1)
  }
  static findEndCursor(lines, cursor, indent) {
    let nextLine = lines[cursor]
    let nextLineIndent, nextLineMatch

    do {
      nextLine = lines[++cursor]
      REGEX.QUOTE.lastIndex = 0
      nextLineMatch = (nextLine !== undefined) ? REGEX.QUOTE.test(nextLine) : null
      nextLineIndent = (nextLineMatch) ? Commons.getIndent(nextLine) : null
    } while(
      nextLine !== undefined &&
      nextLineMatch &&
      nextLineIndent === indent
    )
    return cursor - 1
  }
  /**
   * remember depth for quotes if present inside
   * merges consecutive quotes with the same or less depth
   * merges consecutive non-quote lines
   *
   * @param {array} body
   * @returns {*[]}
   */
  static shrinkBody(body) {
    const sBody = []
    body.forEach(item => {
      const lastItemInQBody = sBody[sBody.length - 1] || false
      const currDepth = this.getDepth(item)
      REGEX.EMPTY_QUOTE.lastIndex = 0
      if (REGEX.EMPTY_QUOTE.test(item)) {
        sBody.push({
          type: TOKENS.QUOTE_SEPARATOR,
          raw: item
        })
      }
      if (lastItemInQBody &&
        currDepth <= lastItemInQBody.depth
      ) {
        lastItemInQBody.value.push(this.getValue(item, currDepth))
      } else {
        sBody.push({
          depth: currDepth,
          value: [this.getValue(item, currDepth)]
        })
      }
    })
    return sBody
  }
  static getCommonDepth(shrunkBody) {
    let cDepth
    shrunkBody.forEach(item => {
      if (item.depth) {
        if (cDepth === undefined) {
          cDepth = item.depth
        } else {
          cDepth = Math.min(cDepth, item.depth)
        }
      }
    })
    return cDepth
  }
  static refineBody(shrunkBody, cDepth) {
    const rBody = []
    shrunkBody.forEach(item => {
      if (item.type === TOKENS.QUOTE_SEPARATOR) return
      const l = new Lexer(item.value)

      if (item.depth === cDepth) {
        rBody.push(l.run())
      } else {
        rBody.push({
          type: TOKENS.QUOTE,
          depth: item.depth - cDepth,
          value: l.run()
        })
      }
    })
    return rBody
  }
  static tokenize(lines, cursor, indent) {
    const endCursor = this.findEndCursor(lines, cursor, indent)

    const body = lines.slice(cursor, endCursor + 1)

    const shrunkBody = this.shrinkBody(body)

    const commonDepth = this.getCommonDepth(shrunkBody)

    const qBody = this.refineBody(shrunkBody, commonDepth)

    return {
      depth: commonDepth,
      body: qBody,
      cursor: endCursor
    }
  }
}
