module.exports = {
  COMMON: {
    HEADING: /^\s*(?<level>#{1,6})\s(?<value>.*)/g,
    COMMENT: /^\s*<!--\s(?<value>.*)\s-->/g,
    CHECKBOX: /^\s*-\s\[(?<checked>[\s|x])]\s(?<value>.*)/g,
    IMAGE: /^\s*!\[(?<alt>.*)\]\((?<url>.*)\)/g
  },
  LIST_ITEM: /^\s*(?<countText>-|\d+\.)\s(?<value>[^[]+)/g,
  QUOTE: /^\s*>\s+(?<value>.*)/g,
  PARAGRAPH: /(\*\*)(?<bold>[^**]+)(\*\*)|`(?<code>[^`]+)`|(~~)(?<strike>[^~~]+)(~~)|\[(?<linkTitle>.*)]\((?<linkHref>.*)\)|(?<normal>[^`*[~]+)|\*(?<italic>[^**]+)\*/g,
  TABLE_ROW: /^\s*\|(?=(?:[^/|]+\|)+$)|(?!^)(?<cell>[^|]+)\|/gy,
  // type: |----|-----|------|
  TABLE_LINE_1: /^\s*\|(?=(?:-+\|)+$)|(?!^)(?<cell>-+)\|/gy,
  // type: |:---:|:---:|:---:|
  TABLE_LINE_2: /^\s*\|(?=(?::-+:\|)+$)|(?!^):(?<cell>-+):\|/gy,
}
