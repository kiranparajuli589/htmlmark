module.exports = {
  findRegex: (regex, text) => {
    const matches = []
    let match = regex.exec(text)
    do {
      if (match?.groups?.code) {
        matches.push({
          type: "code",
          value: match.groups.code
        })
      } else if (match?.groups?.bold) {
        matches.push({
          type: "bold",
          value: match.groups.bold
        })
      } else if (match?.groups?.italic) {
        matches.push({
          type: "italic",
          value: match.groups.italic
        })
      } else if (match?.groups?.strike) {
        matches.push({
          type: "strike",
          value: match.groups.strike
        })
      } else if (match?.groups?.linkTitle) {
        matches.push({
          type: "link",
          value: match.groups.linkTitle,
          href: match.groups.linkHref
        })
      } else {
        matches.push({
          type: "text",
          value: Array.isArray(match) ? match[0] : match
        })
      }
    } while((match = regex.exec(text)) !== null)
    return matches
  },
    
  REGEX: {
    // regex with group to get the text
    heading1: /^(?<indent>[\s]*)#\s(?<value>.*)/,
    heading2: /^(?<indent>[\s]*)##\s(?<value>.*)/,
    heading3: /^(?<indent>[\s]*)###\s(?<value>.*)/,
    heading4: /^(?<indent>[\s]*)####\s(?<value>.*)/,
    heading5: /^(?<indent>[\s]*)#####\s(?<value>.*)/,
    heading6: /^(?<indent>[\s]*)######\s(?<value>.*)/,
    listItem: /^(?<indent>[\s]*)-\s(?<value>[^[]+)/g,
    countItem: /^(?<indent>[\s]*)\d+\.\s(?<value>[^[]+)/g,
    comment: /^(?<indent>[\s]*)<!--\s(?<value>.*)\s-->/g,
    checkbox: /^(?<indent>[\s]*)-\s\[\s\]\s(?<value>.*)/g,
    checkboxChecked: /^(?<indent>[\s]*)-\s\[x\]\s(?<value>.*)/g,
    quote: /^(?<indent>[\s]*)>\s(?<value>.*)/g,
    image: /^(?<indent>[\s]*)!\[(?<alt>.*)\]\((?<url>.*)\)/g
  },
    
  PARAGRAPH_REGEX: /(\*\*)(?<bold>[^**]+)(\*\*)|`(?<code>[^`]+)`|(~~)(?<strike>[^~~]+)(~~)|\[(?<linkTitle>.*)]\((?<linkHref>.*)\)|(?<normal>[^`*[~]+)|\*(?<italic>[^**]+)\*/g
    
}