const {PARAGRAPH_REGEX, findRegex} = require("../regex")
const TOKENS = require("./tokens")

const innerTokenizer = (tokenizedContent) => {
  // check for every paresed line for inner tokens
  // if only type is not newline, paragraph, image, comment
  // we add the inner tokens to the parsed line
  for(let i=0; i<tokenizedContent.length; i++) {
    const line = tokenizedContent[i]

    if ([TOKENS.newLine, TOKENS.codeblock, TOKENS.comment, TOKENS.image].includes(line.type)) {
      // newline does not have inner tokens
      // codeblock, comment, image doesn't need to be checked
      continue
    }
    if (line.type === TOKENS.heading) {
      // manage level of heading
      line.level = line.tokens.level.length
      delete line.tokens.level
      line.tokens = findRegex(PARAGRAPH_REGEX, line.tokens.value)
      continue
    }
    if (line.type === TOKENS.quote) {
      // if quote type, first we need to find the quote depth
      // then we need to find the inner tokens
      // then we need to add the quote depth to the inner tokens
      // then we need to add the inner tokens to the parsed line
      let depth = 0
      let quoteLine = line.tokens.value
      while(quoteLine.trim().startsWith(">")) {
        depth++
        quoteLine = quoteLine.substring(1).trim()
      }
      // now the quoteline is pure raw text
      // we can check it with the pqragraph regex
      line.depth = depth
      line.tokens = findRegex(PARAGRAPH_REGEX, quoteLine)
    } else {
      line.tokens = findRegex(PARAGRAPH_REGEX, line.tokens.value)
    }
  }
  return tokenizedContent
}

module.exports = innerTokenizer
