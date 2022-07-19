const {PARAGRAPH} = require("../regex")

const parseContent = (token) => {
  return token.value.replace(PARAGRAPH.BOLD, "<strong>$1</strong>")
    .replace(PARAGRAPH.ITALIC,"<em>$1</em>")
    .replace(PARAGRAPH.CODE, "<code>$1</code>")
    .replace(PARAGRAPH.STRIKE, "<s>$1</s>")
    .replace(PARAGRAPH.UNDERLINE, "<u>$1</u>")
    .replace(PARAGRAPH.LINK, "<a href='$2'>$1</a>")

}

module.exports = parseContent
