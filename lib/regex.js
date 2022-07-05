const TOKENS = require("./tokenizer/tokens")

module.exports = {
  findRegex: (regex, text) => {
    const matches = []
    let match = regex.exec(text)
    do {
      if (match?.groups?.code) {
        matches.push({
          type: TOKENS.code,
          value: match.groups.code
        })
      } else if (match?.groups?.bold) {
        matches.push({
          type: TOKENS.bold,
          value: match.groups.bold
        })
      } else if (match?.groups?.italic) {
        matches.push({
          type: TOKENS.italic,
          value: match.groups.italic
        })
      } else if (match?.groups?.strike) {
        matches.push({
          type: TOKENS.strikeThrough,
          value: match.groups.strike
        })
      } else if (match?.groups?.linkTitle) {
        matches.push({
          type: TOKENS.link,
          value: match.groups.linkTitle,
          href: match.groups.linkHref
        })
      } else {
        matches.push({
          type: TOKENS.text,
          value: Array.isArray(match) ? match[0] : match
        })
      }
    } while((match = regex.exec(text)) !== null)
    return matches
  },
    
  REGEX: {
    // regex with group to get the text
    heading: /^(?<indent>\s*)(?<level>#{1,6})\s(?<value>.*)/g,
    listItem: /^(?<indent>[\s]*)-\s(?<value>[^[]+)/g,
    countItem: /^(?<indent>[\s]*)\d+\.\s(?<value>[^[]+)/g,
    comment: /^(?<indent>[\s]*)<!--\s(?<value>.*)\s-->/g,
    checkBox: /^(?<indent>[\s]*)-\s\[\s\]\s(?<value>.*)/g,
    checkBoxChecked: /^(?<indent>[\s]*)-\s\[x\]\s(?<value>.*)/g,
    quote: /^(?<indent>[\s]*)>\s(?<value>.*)/g,
    image: /^(?<indent>[\s]*)!\[(?<alt>.*)\]\((?<url>.*)\)/g
  },
    
  PARAGRAPH_REGEX: /(\*\*)(?<bold>[^**]+)(\*\*)|`(?<code>[^`]+)`|(~~)(?<strike>[^~~]+)(~~)|\[(?<linkTitle>.*)]\((?<linkHref>.*)\)|(?<normal>[^`*[~]+)|\*(?<italic>[^**]+)\*/g
}