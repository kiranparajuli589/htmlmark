const {getIndent} = require("./commons")
module.exports = {
  getCodeBlock(lines, cursor, indent) {
    const language = lines[cursor].trimStart().substring(3)
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

    if (cursorPosition - cursor === 1) {
      // hmm, no code block found
      return {
        language: null,
        body: [],
        cursor
      }
    }

    const body = lines.slice(cursor + 1, cursorPosition)
      .map(line => line.slice(indent))
      .join("\n")
    return {
      language,
      body,
      cursor: cursorPosition
    }
  }
}
