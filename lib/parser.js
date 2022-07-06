const TOKENS = require("./tokens")

const parseParaToken = (token) => {
  let paraHtml = "%s"
  for (let j=0; j<token.tokens.length; j++) {
    const pToken = token.tokens[j]
    // now pToken can be of type
    // code, bold, italic, strikeThrough, link, text
    if (pToken.type === TOKENS.CODE) {
      paraHtml = paraHtml.replace("%s", `<code>${pToken.value}</code>%s`)
    } else if (pToken.type === TOKENS.BOLD) {
      paraHtml = paraHtml.replace("%s", `<strong>${pToken.value}</strong>%s`)
    } else if (pToken.type === TOKENS.ITALIC) {
      paraHtml = paraHtml.replace("%s", `<em>${pToken.value}</em>%s`)
    } else if (pToken.type === TOKENS.STRIKE_THROUGH) {
      paraHtml = paraHtml.replace("%s", `<s>${pToken.value}</s>%s`)
    } else if (pToken.type === TOKENS.LINK) {
      paraHtml = paraHtml.replace("%s", `<a href="${pToken.href}">${pToken.value}</a>%s`)
    } else if (pToken.type === TOKENS.TEXT) {
      paraHtml = paraHtml.replace("%s", `${pToken.value}%s`)
    }
  }
  return paraHtml.replace("%s", "")
}

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
      parsedContent.push(quoteHtml.replace("%s", parseParaToken(token)))
      continue
    }
    
    // heading
    if (token.type === TOKENS.HEADING) {
      parsedContent.push(`<h${token.level}>${parseParaToken(token)}</h${token.level}>`)
      continue
    }
    
    // list item
    // if the list item is not the first one
    // we need to insert it into the list created beforehand
    if ([TOKENS.LIST_ITEM, TOKENS.COUNT_ITEM].includes(token.type)) {
      const listItem = `<li>${parseParaToken(token)}</li>%s`
      if (lastItem && lastItem.trim().startsWith("<ul>")) {
        parsedContent[parsedContent.length - 1] = lastItem.replace("%s", listItem)
      } else {
        parsedContent.push(`<ul>${listItem}%s</ul>`)
      }
      continue
    }
    
    // TOKENS.checkBox, TOKENS.checkBoxChecked
    if ([TOKENS.CHECKBOX, TOKENS.CHECKBOX_CHECKED].includes(token.type)) {
      const checkboxItem = `<li><input type="checkbox" ${token.type === TOKENS.CHECKBOX_CHECKED ? "checked" : ""}>${parseParaToken(token)}</li>%s`
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
      parsedContent.push(`<img src="${token.tokens.url} alt="${token.tokens.alt}">`)
      continue
    }
    
    // if checked checkbox
    if (token.type === TOKENS.CHECKBOX_CHECKED) {
      parsedContent.push(`<input type="checkbox" checked>${parseParaToken(token)}`)
    }
    
    // if paragraph
    if (token.type === TOKENS.PARAGRAPH) {
      parsedContent.push(
        `<p>${parseParaToken(token)}<p>`
      )
    }
  }
  // TODO: see why multiple br tags are added
  return parsedContent
    .map(item => item.replace("%s", ""))
    .join("\n")
}

module.exports = parser
