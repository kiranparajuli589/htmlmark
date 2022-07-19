const TOKENS = require("../util/tokens")
const parseContent = require("./deep")

const parser = (tokens) => {

  const parsedContent = []

  for (let i=0; i<tokens.length; i++) {
    const token = tokens[i]

    // new line
    if (token.type === TOKENS.NEW_LINE) {
      parsedContent.push("<br>")
      continue
    }

    if (token.type === TOKENS.HR_LINE) {
      parsedContent.push("<hr>")
      continue
    }

    // CODE_BLOCK
    if (token.type === TOKENS.CODE_BLOCK) {
      let cbHtml = "<pre><code%class>%s</code></pre>"
      if (token.language) {
        cbHtml = cbHtml.replace("%class", ` class="language-${token.language}"`)
      } else {
        cbHtml = cbHtml.replace("%class", "")
      }
      parsedContent.push(cbHtml.replace("%s", parseContent(token)))
      continue
    }

    // QUOTE
    if (token.type === TOKENS.QUOTE) {
      let quoteHtml = "<blockquote>%s</blockquote>"
      for (let j=0; j<token.depth; j++) {
        quoteHtml = quoteHtml.replace("%s", "<blockquote>%s</blockquote>")
      }
      parsedContent.push(quoteHtml.replace("%s", parseContent(token)))
      continue
    }

    // HEADING
    if (token.type === TOKENS.HEADING) {
      parsedContent.push(`<h${token.level}>${parseContent(token)}</h${token.level}>`)
      continue
    }

    // LIST
    // if the LIST_ITEM is not the first one
    // we need to insert it into the list created beforehand
    if (token.type === TOKENS.LIST) {
      const listTag = (token.meta.ordered) ? "ol" : "ul"
      let listBodyHtml = []
      token.items.forEach(listItem => {
        let listItemHtml = "<li>%s</li>"
        if (token.meta.isCheckList) {
          listItemHtml = listItemHtml.replace("%s", `<input type="checkbox"${(listItem.tokens.isChecked) ? " checked" : ""}>${parseContent(listItem.tokens)}`)
        } else {
          listItemHtml = listItemHtml.replace("%s", parseContent(listItem.tokens))
        }
        listBodyHtml.push(listItemHtml)
      })
      parsedContent.push(`<${listTag}>${listBodyHtml.join("")}</${listTag}>`)
      continue
    }

    // COMMENT
    if (token.type === TOKENS.COMMENT) {
      continue
    }

    // IMAGE
    if (token.type === TOKENS.IMAGE) {
      parsedContent.push(`<img src="${token.url}" alt="${token.alt}">`)
      continue
    }

    // PARAGRAPH
    if (token.type === TOKENS.PARAGRAPH) {
      parsedContent.push(
        `<p>${parseContent(token)}</p>`
      )
      continue
    }

    // TABLE
    if (token.type === TOKENS.TABLE) {
      const tHeading = token.rows[0]
      const tBody = token.rows.slice(1)
      const tHeadingHtml = `<th>${tHeading.map(t => parseContent(t)).join("</th><th>")}</th>`
      const tBodyHtml = tBody.map(row => `<tr><td>${row.map(cell => parseContent(cell)).join("</td><td>")}</td></tr>`).join("")
      parsedContent.push(
        `<table>
  <thead>
    <tr>${tHeadingHtml}</tr>
  </thead>
  <tbody>
    ${tBodyHtml}
  </tbody>
</table>`
      )
      continue
    }
  }

  // remove any %s leftovers and return
  return parsedContent
    .map(item => item.replaceAll("%s", ""))
    .join("")
}

module.exports = parser
