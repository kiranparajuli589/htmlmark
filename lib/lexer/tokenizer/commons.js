import { REGEX } from "../../regex/index.js"


export class Commons {
  static resetRegexes() {
    REGEX.HR_LINE.lastIndex = 0
    REGEX.COMMENT.lastIndex = 0
    REGEX.IMAGE.lastIndex = 0
    REGEX.HEADING.lastIndex = 0
    REGEX.QUOTE.lastIndex = 0
    REGEX.LIST.ITEM.lastIndex = 0
    REGEX.CODE_BLOCK.lastIndex = 0
  }
  static getIndent(text) {
    if (["", "\n", undefined].includes(text)) return 0
    let i = 0
    while (text[i] === " " || text[i] === "\t") {
      i++
    }
    return i
  }
  static tokenizeHeading(text) {
    REGEX.HEADING.lastIndex = 0
    const hMatch = REGEX.HEADING.exec(text.trim())
    if (hMatch) {
      return {
        level: hMatch.groups.level.length,
        value: hMatch.groups.value
      }
    }
    throw new Error(`Text: ${text} is not of type heading`)
  }
  /**
   * @param {string} text
   * @returns {object}
   * @throws {Error}
   */
  static tokenizeComment(text) {
    REGEX.COMMENT.lastIndex = 0
    const cMatch = REGEX.COMMENT.exec(text.trim())
    if (cMatch) {
      return cMatch.groups
    }
    throw new Error(`Text: ${text} is not of type comment`)
  }
  static tokenizeImage(text) {
    REGEX.IMAGE.lastIndex = 0
    const iMatch = REGEX.IMAGE.exec(text.trim())
    if (iMatch) {
      return iMatch.groups
    }
    throw new Error(`Text: ${text} is not of type image`)
  }
}
