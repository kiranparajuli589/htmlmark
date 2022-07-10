module.exports = {
  COMMON: {
    HEADING: /^[\s]*(?<level>#{1,6})\s(?<value>.*)/g,
    LIST_ITEM: /^[\s]*-\s(?<value>[^[]+)/g,
    COUNT_ITEM: /^[\s]*\d+\.\s(?<value>[^[]+)/g,
    COMMENT: /^[\s]*<!--\s(?<value>.*)\s-->/g,
    CHECKBOX: /^[\s]*-\s\[(?<checked>[\s|x])]\s(?<value>.*)/g,
    QUOTE: /^[\s]*>\s(?<value>.*)/g,
    IMAGE: /^[\s]*!\[(?<alt>.*)\]\((?<url>.*)\)/g
  },
  PARAGRAPH: /(\*\*)(?<bold>[^**]+)(\*\*)|`(?<code>[^`]+)`|(~~)(?<strike>[^~~]+)(~~)|\[(?<linkTitle>.*)]\((?<linkHref>.*)\)|(?<normal>[^`*[~]+)|\*(?<italic>[^**]+)\*/g,
  TABLE_ROW: /^(?<indent>[ \t]*)\|(?=(?:[^/|]+\|)+$)|(?!^)(?<cell>[^|]+)\|/gy,
  // type: |----|-----|------|
  TABLE_LINE_1: /^(?<indent>[ \t]*)\|(?=(?:-+\|)+$)|(?!^)(?<cell>-+)\|/gy,
  // type: |:---:|:---:|:---:|
  TABLE_LINE_2: /^(?<indent>[ \t]*)\|(?=(?::-+:\|)+$)|(?!^):(?<cell>-+):\|/gy,
}
