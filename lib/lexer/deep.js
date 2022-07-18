const {
  PARAGRAPH,
  TABLE_ROW,
  LIST_ITEM
} = require("../regex")
const TOKENS = require("../util/tokens")

module.exports = {
  tokenizeParagraph: (text)=> {
    let mLink
    const tokens = []
    let paragraphMatch = module.exports.getRegexGroupMatches(text, PARAGRAPH)
    paragraphMatch.forEach(match => {
      const value = match.value

      switch (match.groupName) {
      case "code":
        tokens.push({
          type: TOKENS.CODE,
          value
        })
        break
      case "italic":
        tokens.push({
          type: TOKENS.ITALIC,
          value,
        })
        break
      case "bold":
        tokens.push({
          type: TOKENS.BOLD,
          value,
        })
        break
      case "strike":
        tokens.push({
          type: TOKENS.STRIKE_THROUGH,
          value,
        })
        break
      case "underline":
        tokens.push({
          type: TOKENS.UNDERLINE,
          value,
        })
        break
      case "link":
        mLink = /\[(?<title>.+)]\((?<href>.+)\)/g.exec(value)
        tokens.push({
          type: TOKENS.LINK,
          ...mLink.groups,
        })
        break
      case "normal":
        // if last token is text, append to it
        if (tokens.length > 0 && tokens[tokens.length - 1].type === TOKENS.TEXT) {
          tokens[tokens.length - 1].value += value
        } else tokens.push({
          type: TOKENS.TEXT,
          value,
        })
        break
      }
    })
    return tokens
  },
  tokenizeContent: (text) => {
    const tokens = module.exports.tokenizeParagraph(text)
    tokens.forEach(token => {
      switch(token.type) {
      case TOKENS.ITALIC:
      case TOKENS.BOLD:
      case TOKENS.STRIKE_THROUGH:
        token.deep = module.exports.tokenizeParagraph(token.value)
        break
      case TOKENS.LINK:
        token.tDeep = module.exports.tokenizeParagraph(token.title)
        break
      }
    })
    return tokens
  },
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
        cellToken.tokens = module.exports.tokenizeContent(cellItem.trim())
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
  getRegexGroupMatches: (text, regex) => {
    let m
    const matches = []

    while ((m = regex.exec(text)) !== null) {
      if (m.index === regex.lastIndex) {
        regex.lastIndex++
      }

      const rGroups = Object.keys(m.groups)

      m.forEach((match, groupIndex) => {
        if (match && groupIndex !== 0) {
          matches.push({
            groupName: rGroups[groupIndex - 1],
            value: match
          })
        }
      })
    }
    return matches
  }
}

