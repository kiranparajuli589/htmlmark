import { TOKENS } from "../util/tokens.js"
import { REGEX } from "../regex/index.js"


export class Parser {
  #lexers
  #cursor
  #parsedContent
  #currentLexer

  constructor(lexers) {
    this.#lexers = lexers
    this.#parsedContent = []
  }
  static #parseContent(token) {
    return token.value.replace(REGEX.PARAGRAPH.BOLD, "<strong>$1</strong>")
      .replace(REGEX.PARAGRAPH.ITALIC,"<em>$1</em>")
      .replace(REGEX.PARAGRAPH.CODE, "<code>$1</code>")
      .replace(REGEX.PARAGRAPH.STRIKE, "<s>$1</s>")
      .replace(REGEX.PARAGRAPH.UNDERLINE, "<u>$1</u>")
      .replace(REGEX.PARAGRAPH.LINK, "<a href='$2'>$1</a>")
  }
  static #wrapInsideBlockQuote(depth, content) {
    let qHtml = "%s"
    for (let j=0; j<depth; j++) {
      qHtml = qHtml.replace("%s", "<blockquote>%s</blockquote>")
    }
    return qHtml.replace("%s", `${content}
`)
  }
  #parseNewLine() {
    this.#parsedContent.push(`
<br>`)
  }
  #parseHrLine() {
    this.#parsedContent.push(`
<hr>`)
  }
  #parseCodeBlock() {
    let cbHtml = `
<pre><code%class>%s</code></pre>`
    if (this.#currentLexer.language) {
      cbHtml = cbHtml.replace("%class", ` class='language-${this.#currentLexer.language}'`)
    } else {
      cbHtml = cbHtml.replace("%class", "")
    }
    this.#parsedContent.push(cbHtml.replace("%s", Parser.#parseContent(this.#currentLexer)))
  }
  #parseQuote() {
    const q = []
    this.#currentLexer.tokens.forEach(qTokens => {
      let p
      if (Array.isArray(qTokens)) {
        p = new Parser(qTokens)
        q.push(p.run())
      } else {
        p = new Parser(qTokens.value)
        q.push(Parser.#wrapInsideBlockQuote(qTokens.depth, p.run()))
      }
    })
    this.#parsedContent.push(Parser.#wrapInsideBlockQuote(this.#currentLexer.depth, q.join("")))
  }
  #parseHeading() {
    this.#parsedContent.push(`
<h${this.#currentLexer.level}>${Parser.#parseContent(this.#currentLexer)}</h${this.#currentLexer.level}>`)
  }
  #parseList() {
    const listTag = (this.#currentLexer.meta.ordered) ? "ol" : "ul"
    let listBodyHtml = []
    this.#currentLexer.items.forEach(listItem => {
      let listItemHtml = "<li>%s</li>"
      if (this.#currentLexer.meta.isCheckList) {
        const isChecked = (listItem.tokens.isChecked) ? " checked" : ""
        listItemHtml = listItemHtml.replace("%s", `<input type="checkbox"${isChecked}>${Parser.#parseContent(listItem.tokens.value.at(-1))}`)
      } else {
        listItemHtml = listItemHtml.replace("%s", Parser.#parseContent(listItem.tokens.value.at(-1)))
      }
      listBodyHtml.push(listItemHtml)
    })
    this.#parsedContent.push(`
<${listTag}>
  ${listBodyHtml.join("")}
</${listTag}>`)
  }
  #parseComment() {

  }
  #parseImage() {
    this.#parsedContent.push(`
<img src="${this.#currentLexer.url}" alt="${this.#currentLexer.alt}">`)

  }
  #parseTable() {
    const tHeading = this.#currentLexer.rows[0]
    const tBody = this.#currentLexer.rows.slice(1)
    const tHeadingHtml = `<th>${tHeading.map(t => Parser.#parseContent(t)).join("</th><th>")}</th>`
    const tBodyHtml = tBody.map(row => `<tr><td>${row.map(cell => Parser.#parseContent(cell)).join("</td><td>")}</td></tr>`).join("")
    this.#parsedContent.push(`
<table>
  <thead>
    <tr>${tHeadingHtml}</tr>
  </thead>
  <tbody>
    ${tBodyHtml}
  </tbody>
</table>`)
  }
  #parseParagraph() {
    this.#parsedContent.push(`
<p>${Parser.#parseContent(this.#currentLexer)}</p>`)
  }
  #parseCurrentLexer() {
    switch (this.#currentLexer.type) {
    case TOKENS.NEW_LINE:
      this.#parseNewLine()
      break
    case TOKENS.HR_LINE:
      this.#parseHrLine()
      break
    case TOKENS.CODE_BLOCK:
      this.#parseCodeBlock()
      break
    case TOKENS.QUOTE:
      this.#parseQuote()
      break
    case TOKENS.HEADING:
      this.#parseHeading()
      break
    case TOKENS.LIST:
      this.#parseList()
      break
    case TOKENS.COMMENT:
      this.#parseComment()
      break
    case TOKENS.IMAGE:
      this.#parseImage()
      break
    case TOKENS.TABLE:
      this.#parseTable()
      break
    case TOKENS.PARAGRAPH:
      this.#parseParagraph()
      break
    }
  }
  run() {
    for (this.#cursor=0; this.#cursor<this.#lexers.length; this.#cursor++) {
      this.#currentLexer = this.#lexers[this.#cursor]
      this.#parseCurrentLexer()
    }

    // remove any %s leftovers and return
    return this.#parsedContent
      .map(item => item.replaceAll("%s", ""))
      .join("")
  }
}
