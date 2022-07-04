const innerTokenizer = require("./innerTokenizer")
const outerTokenizer = require("./outerTokenizer")

const tokenize = (lines) => {
    const tokenizedContent = outerTokenizer(lines)
    console.log(tokenizedContent)
    const deepTokenizedContent = innerTokenizer(tokenizedContent)
    return deepTokenizedContent
}

module.exports = tokenize