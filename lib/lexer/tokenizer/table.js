const REGEX = require("../../regex")
const TOKENS = require("../../util/tokens")
const { getIndent } = require("./commons")


module.exports = class Table {
  static getCellCount(text) {
    return text.split("|").length - 2
  }
  /**
   * table heading - body separator line
   * @param {string} text
   * @param {number} count
   * @param {number} indent
   * @returns {boolean}
   */
  static isHBSeparator(text, count, indent) {
    REGEX.TABLE.DASHED_LINE.lastIndex = 0
    REGEX.TABLE.COLON_DASH_LINE.lastIndex = 0
    return getIndent(text) === indent &&
      (REGEX.TABLE.DASHED_LINE.test(text) || REGEX.TABLE.COLON_DASH_LINE.test(text)) &&
      this.getCellCount(text) === count
  }
  static isRow(text, count, indent) {
    return getIndent(text) === indent &&
        REGEX.TABLE.ROW.test(text) &&
        this.getCellCount(text) === count
  }
  static isOfType(lines, cursor, indent) {
    const lineToParse = lines[cursor]
    REGEX.TABLE.ROW.lastIndex = 0
    if (!REGEX.TABLE.ROW.test(lineToParse)) return false
    const tableCellCount = this.getCellCount(lineToParse)

    let nextLine = lines[cursor + 1]
    let nextNextLine = lines[cursor + 2]

    if (!!nextLine && !!nextNextLine && indent === getIndent(nextLine)) {
      nextLine = nextLine.trimEnd()
      nextNextLine = nextNextLine.trimEnd()

      const isTableHeadingBodySeparatorPresent = this.isHBSeparator(nextLine, tableCellCount, indent)

      if (
        isTableHeadingBodySeparatorPresent &&
        this.isRow(nextNextLine, tableCellCount, indent)
      ) {
        return true
      }
    }
    return false
  }
  static tokenizeCell(text) {
    const rawMatch = text.matchAll(REGEX.TABLE.ROW)

    const cells = []

    for (const match of rawMatch) {
      if (match && match.groups && match.groups.cell) {
        const cellItem = match.groups.cell
        const cellToken = { raw: cellItem }
        cellToken.value = cellItem.trim()
        cells.push(cellToken)
      }
    }

    return cells
  }
  static tokenize(lines, cursor, indent) {
    let bodyRowCount = cursor + 3

    const currLine = lines[cursor]
    const cellCount = this.getCellCount(lines[cursor])

    while(
      lines[bodyRowCount] &&
      this.isRow(lines[bodyRowCount], cellCount, indent)
    ) {
      bodyRowCount++
    }

    if (bodyRowCount > cursor + 2) {
      const rows = lines.slice(cursor+2, bodyRowCount)
      const tLexer = {
        type: TOKENS.TABLE,
        indent,
        rows: []
      }
      // now tokenize the table heading first
      tLexer.rows.push(this.tokenizeCell(currLine))
      // no actions required for the separator line
      // move on to parse the table body items
      for(let j=0; j<rows.length; j++) {
        tLexer.rows.push(this.tokenizeCell(rows[j].trimEnd()))
      }
      return {
        lexer: tLexer,
        cursor: bodyRowCount - 1
      }
    }
  }
}
