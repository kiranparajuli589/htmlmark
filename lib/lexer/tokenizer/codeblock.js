import { Commons } from "./commons.js"
import { REGEX } from "../../regex/index.js"


export class CodeBlock {
  static getTheEnd(lines, cursor, indent) {
    let cursorPosition = cursor

    let nextLine, nextLineIndent, nextLineMatch, isNextLineClosingOne

    do {
      nextLine = lines[++cursorPosition]
      nextLineIndent = (nextLine) ? Commons.getIndent(nextLine) : null

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

    // allow empty code block
    // if (cursorPosition - cursor <= 1) return false

    return cursorPosition
  }
  static typeTest(lines, cursor, indent) {
    REGEX.CODE_BLOCK.lastIndex = 0
    if (REGEX.CODE_BLOCK.test(lines[cursor])) {
      return this.getTheEnd(lines, cursor, indent) !== false
    } return false
  }
  static tokenize(lines, cursor, indent) {
    const language = lines[cursor].trim().substring(3)
    const footCursor = this.getTheEnd(lines, cursor, indent)

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
