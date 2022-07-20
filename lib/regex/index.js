module.exports = {
  HR_LINE: /^\s*-{3,}\s*$/g,
  QUOTE: /^\s*(?:>\s)+(?<value>.+)/g,
  COMMENT: /^\s*<!--\s(?<value>.+)\s-->/g,
  IMAGE: /^\s*!\[(?<alt>.+)]\((?<url>.+)\)/g,
  HEADING: /^\s*(?<level>#{1,6})\s(?<value>.+)/g,
  CHECKBOX: /^\s*-\s\[(?<checked>[\s|x])]\s(?<value>.+)/g,
  LIST: {
    CHECKBOX: /^\s*(?:[-~*]|\d+\.)\s\[(?<check>\s|x)]\s(?<value>.+)/g,
    UNORDERED: /^\s*(?<mark>[-*+])\s(?<value>.+)/g,
    ORDERED: /^\s*(?<count>\d)\.\s(?<value>.+)/g,
    ITEM: /^\s*(?:[-*+]|(?<count>\d+)\.)\s(\[(?<check>\s|x)]\s)?(?<value>.+)/g
  },
  PARAGRAPH: {
    CODE: /`(?<code>.+?)`(?!`)/g,
    BOLD: /\*\*(?<bold>.+?)\*\*(?!\*)/g,
    ITALIC: /\*(?<italic>.+?)\*(?!\*)/g,
    STRIKE: /~~(?<strike>.+?)~~(?!~)/g,
    UNDERLINE: /__(?<underline>.+?)__(?!_)/g,
    LINK: /\[(?<title>.+?)]\((?<href>.+?)\)/g,
  },
  TABLE: {
    ROW: /^\s*\|(?=(?:[^|]+\|)+$)|(?!^)(?<cell>[^|]+)\|/gy,
    // type: |----|-----|------|
    DASHED_LINE: /^\s*\|(?=(?:-+\|)+$)|(?!^)(?<cell>-+)\|/gy,
    // type: |:----:|:----:|:----:|
    COLON_DASH_LINE: /^\s*\|(?=(?::-+:\|)+$)|(?!^):(?<cell>-+):\|/gy,
  },
}
