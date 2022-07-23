const REGEX = require("../../regex")
const TOKENS = require("../../util/tokens")
const { getIndent } = require("./commons")


module.exports = {
  getTableCellCount: (text) => {
    return text.split("|").length - 2
  },
  /**
   * table heading - body separator line
   * @param {string} text
   * @param {number} count
   * @returns {boolean}
   */
  isTableHBSeparator: (text, count, indent) => {
    REGEX.TABLE.DASHED_LINE.lastIndex = 0
    REGEX.TABLE.COLON_DASH_LINE.lastIndex = 0
    return getIndent(text) === indent &&
      (REGEX.TABLE.DASHED_LINE.test(text) || REGEX.TABLE.COLON_DASH_LINE.test(text)) &&
      module.exports.getTableCellCount(text) === count
  },
  isTableRow(text, count, indent) {
    return getIndent(text) === indent &&
        TABLE.ROW.test(text) &&
        module.exports.getTableCellCount(text) === count
  },
  isTable(lines, cursor, indent) {
    const lineToParse = lines[cursor]
    REGEX.TABLE.ROW.lastIndex = 0
    if (!REGEX.TABLE.ROW.test(lineToParse)) return false
    const tableCellCount = module.exports.getTableCellCount(lineToParse)

    let nextLine = lines[cursor + 1]
    let nextNextLine = lines[cursor + 2]

    if (!!nextLine && !!nextNextLine && indent === getIndent(nextLine)) {
      nextLine = nextLine.trimEnd()
      nextNextLine = nextNextLine.trimEnd()

      const isTableHeadingBodySeparatorPresent = module.exports.isTableHBSeparator(nextLine, tableCellCount, indent)

      if (
        isTableHeadingBodySeparatorPresent &&
        module.exports.isTableRow(nextNextLine, tableCellCount, indent)
      ) {
        return true
      }
    }
    return false
  },
  tokenizeTableCell: (text) => {
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
  },
  getTableLexer(lines, cursor, indent) {
    let tBodyRowCount = cursor + 3

    const lineToParse = lines[cursor]
    const tableCellCount = module.exports.getTableCellCount(lines[cursor])

    while(
      lines[tBodyRowCount] &&
      module.exports.isTableRow(lines[tBodyRowCount], tableCellCount, indent)
    ) {
      tBodyRowCount++
    }

    if (tBodyRowCount > cursor + 2) {
      const tableRows = lines.slice(cursor+2, tBodyRowCount)
      const tableLexer = {
        type: TOKENS.TABLE,
        indent,
        rows: []
      }
      // now tokenize the table heading first
      tableLexer.rows.push(module.exports.tokenizeTableCell(lineToParse))
      // no actions required for the separator line
      // move on to parse the table body items
      for(let j=0; j<tableRows.length; j++) {
        tableLexer.rows.push(module.exports.tokenizeTableCell(tableRows[j].trimEnd()))
      }
      return {
        lexer: tableLexer,
        cursor: tBodyRowCount - 1
      }
    }
  }
}
