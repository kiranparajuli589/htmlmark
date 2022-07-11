const TOKENS = require("../util/tokens")
const deepTokenize = require("./deep")

const parser = (tokens) => {
    
  const parsedContent = []

  for (let i=0; i<tokens.length; i++) {
    const token = tokens[i]
    const lastItem = (parsedContent.length > 0) ? parsedContent[parsedContent.length - 1] : null
    
    // new line
    if (token.type === TOKENS.NEW_LINE) {
      parsedContent.push("<br>")
      continue
    }

    if (token.type === TOKENS.HR_LINE) {
      parsedContent.push("<hr>")
      continue
    }
    
    // codeblock
    if (token.type === TOKENS.CODE_BLOCK) {
      let cbHtml = "<pre><code%class>%s</code></pre>"
      if (token.language) {
        cbHtml = cbHtml.replace("%class", ` class="language-${token.language}"`)
      } else {
        cbHtml = cbHtml.replace("%class", "")
      }
      parsedContent.push(cbHtml.replace("%s", token.tokens[0].value))
      continue
    }
    
    // quote
    if (token.type === TOKENS.QUOTE) {
      let quoteHtml = "<blockquote>%s</blockquote>"
      for (let j=0; j<token.depth; j++) {
        quoteHtml = quoteHtml.replace("%s", "<blockquote>%s</blockquote>")
      }
      parsedContent.push(quoteHtml.replace("%s", deepTokenize(token)))
      continue
    }
    
    // heading
    if (token.type === TOKENS.HEADING) {
      parsedContent.push(`<h${token.level}>${deepTokenize(token)}</h${token.level}>`)
      continue
    }
    
    // list item
    // if the list item is not the first one
    // we need to insert it into the list created beforehand
    if (token.type === TOKENS.LIST) {
      const listTag = (token.ordered) ? "ol" : "ul"
      let listBodyHtml = "%s"
      token.items.forEach(listItem => {
        listBodyHtml = listBodyHtml.replace("%s", `<li>${deepTokenize(listItem)}</li>%s`)
      })
      parsedContent.push(`<${listTag}>${listBodyHtml.replace("%s", "")}</${listTag}>`)
      continue
    }
    
    if (token.type === TOKENS.CHECKBOX) {
      const checkboxItem = `<li><input type="checkbox"${token.checked ? " checked" : ""}>${deepTokenize(token)}</li>%s`
      if (lastItem && lastItem.trim().startsWith("<ul>")) {
        parsedContent[parsedContent.length - 1] = lastItem.replace("%s", checkboxItem)
      } else {
        parsedContent.push(`<ul>${checkboxItem}</ul>`)
      }
        
      continue
    }
    
    // comment
    if (token.type === TOKENS.COMMENT) {
      continue
    }
    
    // image
    if (token.type === TOKENS.IMAGE) {
      parsedContent.push(`<img src="${token.tokens.url}" alt="${token.tokens.alt}">`)
      continue
    }
    
    // if paragraph
    if (token.type === TOKENS.PARAGRAPH) {
      parsedContent.push(
        `<p>${deepTokenize(token)}</p>`
      )
    }

    // if table
    if (token.type === TOKENS.TABLE) {
      const tHeading = token.rows[0]
      const tBody = token.rows.slice(1)
      const tHeadingHtml = `<th>${tHeading.map(t => deepTokenize(t)).join("</th><th>")}</th>`
      const tBodyHtml = tBody.map(row => `<tr><td>${row.map(cell => deepTokenize(cell)).join("</td><td>")}</td></tr>`).join("")
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
    }
  }

  // remove any %s leftovers and return
  return parsedContent
    .map(item => item.replaceAll("%s", ""))
    .join("")
}

module.exports = parser
