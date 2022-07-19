const {
  TABLE_ROW,
  LIST_ITEM
} = require("../regex")

module.exports = {
  getIndent: (text) => {
    if (["", "\n", undefined].includes(text)) return 0
    let i = 0
    while (text[i] === " " || text[i] === "\t") {
      i++
    }
    return i
  },
  tokenizeTableCell: (text) => {
    const rawMatch = text.matchAll(TABLE_ROW)

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
  getListItemTokens: (text) => {
    text = text.trimEnd()
    const match = LIST_ITEM.exec(text)
    if (match) {
      return match.groups
    }
    throw new Error(`Text: ${text} is not of type list-item`)
  },
  isListItemOfOrderedType: (text) => {
    const match = /^\s*(-|(?<count>\d+)\.)\s.*/g.exec(text)
    return !!match?.groups?.count
  },
  isListItemOfCheckboxType: (text) => {
    return !!/^\s*(?:-|\d+\.)\s\[(?:\s|x)]\s.*/g.exec(text)
  },
  getTableCellCount: (text) => {
    return text.split("|").length - 2
  },
}

