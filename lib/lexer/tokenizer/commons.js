const REGEX = require("../../regex")

module.exports = {
  getIndent: (text) => {
    if (["", "\n", undefined].includes(text)) return 0
    let i = 0
    while (text[i] === " " || text[i] === "\t") {
      i++
    }
    return i
  },
  tokenizeHeading(text) {
    const hMatch = REGEX.HEADING.exec(text.trim())
    if (hMatch) {
      return {
        level: hMatch.groups.level.length,
        value: hMatch.groups.value
      }
    }
    throw new Error(`Text: ${text} is not of type heading`)
  },
  tokenizeComment(text) {
    const cMatch = REGEX.COMMENT.exec(text.trim())
    if (cMatch) {
      return cMatch.groups
    }
    throw new Error(`Text: ${text} is not of type comment`)
  },
  tokenizeImage(text) {
    const iMatch = REGEX.IMAGE.exec(text.trim())
    if (iMatch) {
      return iMatch.groups
    }
    throw new Error(`Text: ${text} is not of type image`)
  }
}
