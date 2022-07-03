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
    heading1: /^#\s(?<heading1>.*)/,
    heading2: /^##\s(?<heading2>.*)/,
    heading3: /^###\s(?<heading3>.*)/,
    heading4: /^####\s(?<heading4>.*)/,
    heading5: /^#####\s(?<heading5>.*)/,
    heading6: /^######\s(.*)$/,
    listItem: /^-\s(?<listItem>[^[]+)/g,
    countItem: /^\d+\.\s(?<listItem>[^[]+)/g,
    comment: /^<!--\s(?<comment>.*)\s-->/,
    checkbox: /-\s\[\s\]\s(?<checkbox>.*)/g,
    checkboxChecked: /-\s\[x\]\s(?<checkboxChecked>.*)/g,
    quote: /^>\s(?<quote>.*)/g
  },
    
  PARAGRAPH_REGEX: /(\*\*)(?<bold>[^**]+)(\*\*)|`(?<code>[^`]+)`|(~~)(?<strike>[^~~]+)(~~)|\[(?<linkTitle>.*)]\((?<linkHref>.*)\)|(?<normal>[^`*[~]+)|\*(?<italic>[^**]+)\*/g
    
}