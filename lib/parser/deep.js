const TOKENS = require("../util/tokens")

const parseDeepTokens = (itemToken) => {
  switch (itemToken.type) {
  case TOKENS.CODE:
    return `<code>${itemToken.value}</code>`
  case TOKENS.ITALIC:
    return `<em>${itemToken.value}</em>`
  case TOKENS.BOLD:
    return `<strong>${itemToken.value}</strong>`
  case TOKENS.STRIKE_THROUGH:
    return `<s>${itemToken.value}</s>`
  case TOKENS.LINK:
    return `<a href="${itemToken.href}">${itemToken.title}</a>`
  case TOKENS.UNDERLINE:
    return `<u>${itemToken.value}</u>`
  case TOKENS.TEXT:
    return itemToken.value
  }
}

const deepTokenize = (token) => {
  let htmlContent = ""

  for (let k=0; k<token.tokens.length; k++) {
    const itemToken = token.tokens[k]
    // now pToken can be of type
    // code, bold, italic, strikeThrough, link, text
    if (itemToken.deep) {
      let itemHTML = ""
      itemToken.deep.forEach(dToken => {
        itemHTML += parseDeepTokens(dToken)
      })
      htmlContent += parseDeepTokens({
        type: itemToken.type,
        value: itemHTML
      })
    } else if (itemToken.tDeep) {
      let deepTitleHtml = ""
      itemToken.tDeep.forEach(dToken => {
        deepTitleHtml += parseDeepTokens(dToken)
      })
      htmlContent += parseDeepTokens({
        ...itemToken,
        title: deepTitleHtml
      })
    } else {
      htmlContent += parseDeepTokens(itemToken)
    }
  }
  return htmlContent
}

module.exports = deepTokenize
