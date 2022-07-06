const TOKENS = require("./tokens")

module.exports = {
  find: (regex, text) => {
    const matches = []
    let match = regex.exec(text)
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
    } while((match = regex.exec(text)) !== null)
    return matches
  },
    
  COMMON: {
    // regex with group to get the text
    HEADING: /^(?<indent>\s*)(?<level>#{1,6})\s(?<value>.*)/g,
    LIST_ITEM: /^(?<indent>[\s]*)-\s(?<value>[^[]+)/g,
    COUNT_ITEM: /^(?<indent>[\s]*)\d+\.\s(?<value>[^[]+)/g,
    COMMENT: /^(?<indent>[\s]*)<!--\s(?<value>.*)\s-->/g,
    CHECKBOX: /^(?<indent>[\s]*)-\s\[\s\]\s(?<value>.*)/g,
    CHECKBOX_CHECKED: /^(?<indent>[\s]*)-\s\[x\]\s(?<value>.*)/g,
    QUOTE: /^(?<indent>[\s]*)>\s(?<value>.*)/g,
    IMAGE: /^(?<indent>[\s]*)!\[(?<alt>.*)\]\((?<url>.*)\)/g
  },
    
  PARAGRAPH: /(\*\*)(?<bold>[^**]+)(\*\*)|`(?<code>[^`]+)`|(~~)(?<strike>[^~~]+)(~~)|\[(?<linkTitle>.*)]\((?<linkHref>.*)\)|(?<normal>[^`*[~]+)|\*(?<italic>[^**]+)\*/g,
  TABLE: /^(?<indent>\s*)\|(?<value>[^\n\r]+)\|/g
}