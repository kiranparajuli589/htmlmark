const { CODE_BLOCK } = require("../../regex")
const {getIndent} = require("./commons")
module.exports = {
  getEndOfTheCodeBlock(lines, cursor, indent) {
    let cursorPosition = cursor

    let nextLine, nextLineIndent, nextLineMatch, isNextLineClosingOne

    do {
      cursorPosition++
      nextLine = lines[cursorPosition]
      nextLineIndent = (nextLine) ? getIndent(nextLine) : null

      if (nextLine !== undefined) {
        nextLineMatch = nextLine.trim() === "```"
        if (
          nextLineMatch &&
          indent + 4 > nextLineIndent &&
          nextLineIndent >= indent
        ) {
          isNextLineClosingOne = true
        } else {
          nextLineMatch = false
        }
      }
    } while (
      nextLine !== undefined &&
      !nextLineMatch &&
      (nextLine === "" || nextLineIndent >= indent) &&
      !isNextLineClosingOne
    )

    if (cursorPosition - cursor <= 1) return false
    return cursorPosition
  },
  isCB(lines, cursor, indent) {
    if (CODE_BLOCK.test(lines[cursor])) {
      return module.exports.getEndOfTheCodeBlock(lines, cursor, indent) !== false
    } return false
  },
  getCodeBlock(lines, cursor, indent) {
    const language = lines[cursor].trim().substring(3)
    const footCursor = module.exports.getEndOfTheCodeBlock(lines, cursor, indent)

    const body = lines.slice(cursor + 1, footCursor)
      .map(line => line.slice(indent))
      .join("\n")
    return {
      language,
      body,
      cursor: footCursor
    }
  }
}
