const TOKENS = require("../util/tokens")

const deepTokenize = (token) => {
    let htmlContent = "%s"
  
    for (let k=0; k<token.tokens.length; k++) {
      const itemToken = token.tokens[k]
      // now pToken can be of type
      // code, bold, italic, strikeThrough, link, text
      if (itemToken.type === TOKENS.CODE) {
        htmlContent = htmlContent.replace("%s", `<code>${itemToken.value}</code>%s`)
      } else if (itemToken.type === TOKENS.BOLD) {
        htmlContent = htmlContent.replace("%s", `<strong>${itemToken.value}</strong>%s`)
      } else if (itemToken.type === TOKENS.ITALIC) {
        htmlContent = htmlContent.replace("%s", `<em>${itemToken.value}</em>%s`)
      } else if (itemToken.type === TOKENS.STRIKE_THROUGH) {
        htmlContent = htmlContent.replace("%s", `<s>${itemToken.value}</s>%s`)
      } else if (itemToken.type === TOKENS.LINK) {
        htmlContent = htmlContent.replace("%s", `<a href="${itemToken.href}">${itemToken.value}</a>%s`)
      } else if (itemToken.type === TOKENS.TEXT) {
        htmlContent = htmlContent.replace("%s", `${itemToken.value}%s`)
      }
    }
    return htmlContent.replace("%s", "")
  }

module.exports = deepTokenize
