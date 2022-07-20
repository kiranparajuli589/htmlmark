const {TABLE, LIST, QUOTE} = require("../regex")
const REGEX = require("../regex")
const {lexer} = require("../index")
const {getIndent} = require("./deep")

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
        nextLineIndent = (nextLineMatch) ? module.exports.getIndent(nextLine) : null
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
  getQuoteDepth(text) {
    const match = text.match(/^\s*(>\s)+/g)
    if (match) {
      const quoteIdentifier = match[0].replaceAll(" ", "")
      return quoteIdentifier.length
    } else {
      throw new Error(`Text: ${text} is not of type quote`)
    }
  },
  findTheEndOfQuote(lines, cursor, indent) {
    const body = []
    let cursorPosition = cursor
    let nextLine = lines[cursorPosition]
    let nextLineDepth,
      nextLineIndent,
      nextLineMatch

    const depth = module.exports.getQuoteDepth(lines[cursor])

    do {
      body.push(nextLine.trimStart().slice(depth*2))
      cursorPosition++
      nextLine = lines[cursorPosition]
      nextLineMatch = (nextLine) ? lines[cursorPosition].match(QUOTE) : null
      nextLineIndent = (nextLineMatch) ? module.exports.getIndent(nextLine) : null
      nextLineDepth = (nextLineMatch) ? module.exports.getQuoteDepth(nextLine) : null
    } while(
      nextLine &&
      nextLineMatch &&
      nextLineIndent === indent &&
      nextLineDepth >= depth
    )

    // this body can have any paragraph type
    // it can have headings, list, table, quote, codeblock, new line inside
    // we've to build some recursive engine to be able to call the lexer again
    // on the body


    return {
      depth,
      body,
      cursor: cursorPosition - 1
    }
  },
  getCodeBlock(lines, cursor, indent) {
    const language = lines[cursor].trimStart().substring(3)
    let cursorPosition = cursor

    let nextLine, nextLineIndent, nextLineMatch, isNextLineClosingOne

    do {
      cursorPosition++
      nextLine = lines[cursorPosition]
      nextLineIndent = (nextLine) ? module.exports.getIndent(nextLine) : null

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

