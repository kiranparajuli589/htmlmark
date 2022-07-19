const {TABLE, LIST} = require("../regex")
const TOKENS = require("../util/tokens")
const REGEX = require("../regex")

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
  getListItemTokens: (text) => {
    text = text.trimEnd()
    const match = LIST.ITEM.exec(text)
    if (match) {
      if (
        match.groups.check !== undefined &&
        typeof match.groups.check === "string"
      ) {
        match.groups.isChecked = match.groups.check === "x"
        delete match.groups.check
      }
      return match.groups
    }
    throw new Error(`Text: ${text} is not of type list-item`)
  },
  getListItemType: (text) => {
    const isCheckItem = text.match(LIST.CHECKBOX)
    const ordered = !!text.match(LIST.ORDERED)
    // find the position of next space in trimmed text
    let identifier = null
    if (!ordered) {
      const nextSpace = text.trim().indexOf(" ")
      identifier = text.trim().substring(0, nextSpace)
    }
    return {
      isCheckList: !!isCheckItem,
      ordered,
      identifier
    }
  },
  getTableCellCount: (text) => {
    return text.split("|").length - 2
  },
  findTheEndOfList: (lines, cursor, indent, lType) => {
    let cursorPosition = cursor
    let nextLine = lines[cursorPosition]
    let nextLineIndent = module.exports.getIndent(nextLine)
    let nextLineType = module.exports.getListItemType(nextLine)
    let nextLineMatch = nextLine.trimEnd().match(REGEX.LIST.ITEM)

    const body = []

    while(
      nextLine &&
      nextLineIndent === indent &&
      nextLineMatch &&
      nextLineType.isCheckList === lType.isCheckList &&
      nextLineType.identifier === lType.identifier &&
      nextLineType.ordered === lType.ordered
    ) {
      const lTokens = module.exports.getListItemTokens(nextLine)
      if (lTokens.check === undefined) delete lTokens.check
      if (lTokens.count === undefined) delete lTokens.count
      body.push({
        tokens: lTokens,
        raw: nextLine
      })
      cursorPosition++
      nextLine = lines[cursorPosition]
      nextLineIndent = (nextLine) ? module.exports.getIndent(nextLine) : null
      nextLineType = (nextLine) ? module.exports.getListItemType(nextLine) : null
      nextLineMatch = (nextLine) ? nextLine.trimEnd().match(REGEX.LIST.ITEM) : null
    }
    return {body, cursor: cursorPosition}
  }
}

