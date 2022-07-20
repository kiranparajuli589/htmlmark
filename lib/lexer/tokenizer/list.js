const REGEX = require("../../regex")
const {getIndent} = require("./commons")

module.exports = {
  getListItemTokens: (text) => {
    text = text.trimEnd()
    const match = REGEX.LIST.ITEM.exec(text)
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
    const isCheckItem = text.match(REGEX.LIST.CHECKBOX)
    const ordered = !!text.match(REGEX.LIST.ORDERED)
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
  findTheEndOfList: (lines, cursor, indent) => {
    const body = []

    let cursorPosition = cursor
    let nextLine = lines[cursorPosition]
    let nextLineTokens = module.exports.getListItemTokens(nextLine)
    let nextLineIndent, nextLineLType, nextLineMatch

    const listType = module.exports.getListItemType(lines[cursor])

    do {
      if (nextLineTokens.check === undefined) delete nextLineTokens.check
      if (nextLineTokens.count === undefined) delete nextLineTokens.count
      body.push({
        tokens: nextLineTokens,
        raw: nextLine
      })
      cursorPosition++
      nextLine = lines[cursorPosition]
      if (nextLine) {
        nextLineMatch = !! nextLine.trimEnd().match(REGEX.LIST.ITEM)
        nextLineTokens = (nextLineMatch) ? module.exports.getListItemTokens(nextLine) : null
        nextLineLType = (nextLineMatch) ? module.exports.getListItemType(nextLine) : null
        nextLineIndent = (nextLineMatch) ? getIndent(nextLine) : null
      }
    } while(
      nextLine &&
      nextLineMatch &&
      nextLineIndent === indent &&
      nextLineLType.isCheckList === listType.isCheckList &&
      nextLineLType.identifier === listType.identifier &&
      nextLineLType.ordered === listType.ordered
    )
    return {
      body,
      cursor: cursorPosition - 1,
      type: listType
    }
  },
}
