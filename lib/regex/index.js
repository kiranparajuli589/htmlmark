module.exports = {
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

  INDENT: /^(?<indent>[\t\s]*)\S/g,
  PARAGRAPH: /(\*\*)(?<bold>[^**]+)(\*\*)|`(?<code>[^`]+)`|(~~)(?<strike>[^~~]+)(~~)|\[(?<linkTitle>.*)]\((?<linkHref>.*)\)|(?<normal>[^`*[~]+)|\*(?<italic>[^**]+)\*/g,
  TABLE_ROW: /^(?<indent>[ \t]*)\|(?=(?:[^/|]+\|)+$)|(?!^)(?<cell>[^|]+)\|/gy,
  TABLE_LINE_1: /^(?<indent>[ \t]*)\|(?=(?:-+\|)+$)|(?!^)(?<cell>-+)\|/gy,
  TABLE_LINE_2: /^(?<indent>[ \t]*)\|(?=(?::-+:\|)+$)|(?!^):(?<cell>-+):\|/gy,
}
