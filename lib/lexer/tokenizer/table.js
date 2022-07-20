const {TABLE} = require("../../regex")
const TOKENS = require("../../util/tokens")
const {getIndent} = require("./commons")

module.exports = {
  getTableCellCount: (text) => {
    return text.split("|").length - 2
  },
  tokenizeTableCell: (text) => {
    const rawMatch = text.matchAll(TABLE.ROW)

    const cells = []

    for (const match of rawMatch) {
      if (match?.groups?.cell) {
        const cellItem = match.groups.cell
        const cellToken = {raw: cellItem}
        cellToken.value = cellItem.trim()
        cells.push(cellToken)
      }
    }

    return cells
  },
  getTableLexer(lines, cursor, indent) {
    const lineToParse = lines[cursor]
    const tableCellCount = module.exports.getTableCellCount(lineToParse)

    let nextLine = lines[cursor + 1]
    let nextNextLine = lines[cursor + 2]

    if (!!nextLine && !!nextNextLine && indent === getIndent(nextLine)) {
      nextLine = nextLine.trimEnd()
      nextNextLine = nextNextLine.trimEnd()

      let isTableHeadingBodySeparatorPresent = !!nextLine.match(TABLE.DASHED_LINE)
      if (!isTableHeadingBodySeparatorPresent) {
        isTableHeadingBodySeparatorPresent = !!nextLine.match(TABLE.COLON_DASH_LINE)
      }
      isTableHeadingBodySeparatorPresent = module.exports.getTableCellCount(nextLine) === tableCellCount

      if (
        isTableHeadingBodySeparatorPresent &&
        nextNextLine.match(TABLE.ROW) &&
        getIndent(nextNextLine) === indent &&
        module.exports.getTableCellCount(nextNextLine) === tableCellCount
      ) {
        let tBodyRowCount = cursor + 3

        while(
          lines[tBodyRowCount] &&
          getIndent(lines[tBodyRowCount]) === indent &&
          lines[tBodyRowCount].trimEnd().match(TABLE.ROW) &&
          module.exports.getTableCellCount(lines[tBodyRowCount]) === tableCellCount
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
  }
}
