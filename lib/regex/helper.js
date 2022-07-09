const {PARAGRAPH, TABLE_ROW} = require("../regex")
const TOKENS = require("../util/tokens")

module.exports = {
  find: (text) => {
    const matches = []
    let match = PARAGRAPH.exec(text)
    do {
      if (match?.groups?.code) {
        matches.push({
          type: TOKENS.CODE,
          value: match.groups.code
        })
      } else if (match?.groups?.bold) {
        matches.push({
          type: TOKENS.BOLD,
          value: match.groups.bold
        })
      } else if (match?.groups?.italic) {
        matches.push({
          type: TOKENS.ITALIC,
          value: match.groups.italic
        })
      } else if (match?.groups?.strike) {
        matches.push({
          type: TOKENS.STRIKE_THROUGH,
          value: match.groups.strike
        })
      } else if (match?.groups?.linkTitle) {
        matches.push({
          type: TOKENS.LINK,
          value: match.groups.linkTitle,
          href: match.groups.linkHref
        })
      } else {
        matches.push({
          type: TOKENS.TEXT,
          value: Array.isArray(match) ? match[0] : match
        })
      }
    } while((match = PARAGRAPH.exec(text)) !== null)
    return matches
  },
  getIndent: (text) => {
    if (["", "\n", undefined].includes(text)) return 0
    let i = 0
    while(text[i] === " " || text[i] === "\t") {
      i++
    }
    return i
  },
  matchTableCell: (text) => {
    const rawMatch = text.matchAll(TABLE_ROW)

    const matches = {
      indent: null,
      cell: []
    }

    for (const match of rawMatch) {
      if (match?.groups?.indent !== undefined) {
        matches.indent = match.groups.indent
      }
      if (match?.groups?.cell) {
        const cellItem = match.groups.cell
        const cellToken = {
          raw: cellItem,
        }
        cellToken.tokens = module.exports.find(cellItem.trim())
        matches.cell.push(cellToken)
      }
    }

    return matches
  }
}
