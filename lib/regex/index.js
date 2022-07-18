module.exports = {
  COMMON: {
    HEADING: /^\s*(?<level>#{1,6})\s(?<value>.*)/g,
    COMMENT: /^\s*<!--\s(?<value>.*)\s-->/g,
    IMAGE: /^\s*!\[(?<alt>.*)]\((?<url>.*)\)/g
  },
  CHECKBOX: /^\s*-\s\[(?<checked>[\s|x])]\s(?<value>.*)/g,
  LIST_ITEM: /^\s*(?<countText>-|\d+\.)\s(?:\[(?<checkText>\s|x)]\s)*(?<value>.+)/g,
  QUOTE: /^\s*>\s+(?<value>.*)/g,
  PARAGRAPH: /`(?<code>.+?)`(?!`)|\*\*(?<bold>.+?)\*\*(?!\*)|\*(?<italic>.+?)\*(?!\*)|~~(?<strike>.+?)~~(?!~)|\+\+(?<underline>.+?)\+\+(?!\+)|(?<link>\[[^\]]+]\(.+?\))|(?<normal>.)/g,
  TABLE_ROW: /^\s*\|(?=(?:[^|]+\|)+$)|(?!^)(?<cell>[^|]+)\|/gy,
  // type: |----|-----|------|
  TABLE_LINE_1: /^\s*\|(?=(?:-+\|)+$)|(?!^)(?<cell>-+)\|/gy,
  // type: |:----:|:----:|:----:|
  TABLE_LINE_2: /^\s*\|(?=(?::-+:\|)+$)|(?!^):(?<cell>-+):\|/gy,
}
