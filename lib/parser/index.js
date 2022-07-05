const TOKENS = require("../tokenizer/tokens")

const parseParaToken = (token) => {
  let paraHtml = "%s"
  for (let j=0; j<token.tokens.length; j++) {
    const pToken = token.tokens[j]
    // now pToken can be of type
    // code, bold, italic, strikeThrough, link, text
    if (pToken.type === TOKENS.code) {
      paraHtml = paraHtml.replace("%s", `<code>${pToken.value}</code>%s`)
    } else if (pToken.type === TOKENS.bold) {
      paraHtml = paraHtml.replace("%s", `<strong>${pToken.value}</strong>%s`)
    } else if (pToken.type === TOKENS.italic) {
      paraHtml = paraHtml.replace("%s", `<em>${pToken.value}</em>%s`)
    } else if (pToken.type === TOKENS.strikeThrough) {
      paraHtml = paraHtml.replace("%s", `<s>${pToken.value}</s>%s`)
    } else if (pToken.type === TOKENS.link) {
      paraHtml = paraHtml.replace("%s", `<a href="${pToken.href}">${pToken.value}</a>%s`)
    } else if (pToken.type === TOKENS.text) {
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
    if (token.type === TOKENS.newLine) {
      // if previous line is not new line, add new line
      if (lastItem && lastItem.type !== TOKENS.newLine) {
        parsedContent.push("<br>")
      }
      continue
    }
    
    // codeblock
    if (token.type === TOKENS.codeblock) {
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
    if (token.type === TOKENS.quote) {
      let quoteHtml = "<blockquote>%s</blockquote>"
      for (let j=0; j<token.depth; j++) {
        quoteHtml = quoteHtml.replace("%s", "<blockquote>%s</blockquote>")
      }
      parsedContent.push(quoteHtml.replace("%s", parseParaToken(token)))
      continue
    }
    
    // heading
    if (token.type === TOKENS.heading) {
      parsedContent.push(`<h${token.level}>${parseParaToken(token)}</h${token.level}>`)
      continue
    }
    
    // list item
    // if the list item is not the first one
    // we need to insert it into the list created beforehand
    if ([TOKENS.listItem, TOKENS.countItem].includes(token.type)) {
      const listItem = `<li>${parseParaToken(token)}</li>%s`
      if (lastItem && lastItem.trim().startsWith("<ul>")) {
        parsedContent[parsedContent.length - 1] = lastItem.replace("%s", listItem)
      } else {
        parsedContent.push(`<ul>${listItem}%s</ul>`)
      }
      continue
    }
    
    // TOKENS.checkBox, TOKENS.checkBoxChecked
    if ([TOKENS.checkBox, TOKENS.checkBoxChecked].includes(token.type)) {
      const checkboxItem = `<li><input type="checkbox" ${token.type === TOKENS.checkBoxChecked ? "checked" : ""}>${parseParaToken(token)}</li>%s`
      if (lastItem && lastItem.trim().startsWith("<ul>")) {
        parsedContent[parsedContent.length - 1] = lastItem.replace("%s", checkboxItem)
      } else {
        parsedContent.push(`<ul>${checkboxItem}</ul>`)
      }
        
      continue
    }
    
    // comment
    if (token.type === TOKENS.comment) {
      continue
    }
    
    // image
    if (token.type === TOKENS.image) {
      parsedContent.push(`<img src="${token.tokens.url} alt="${token.tokens.alt}">`)
      continue
    }
    
    // if checked checkbox
    if (token.type === TOKENS.checkBoxChecked) {
      parsedContent.push(`<input type="checkbox" checked>${parseParaToken(token)}`)
    }
    
    // if paragraph
    if (token.type === TOKENS.paragraph) {
      parsedContent.push(
        `<p>${parseParaToken(token)}<p>`
      )
    }
  }
  return parsedContent.join("\n")
  // TODO: clean leftover %s
  // TODO: see why multiple br tags are added
}

module.exports = parser
