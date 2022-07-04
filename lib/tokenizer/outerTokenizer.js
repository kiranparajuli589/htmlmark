const { REGEX } = require("../regex.js")

const outerTokenizer = (lines) => {
  // parse every line to the respective markdown tokens
  const tokenizedContent = []
  for(let i=0; i<lines.length; i++) {
    const lineToParse = lines[i].replace("\r", "")
    
    // for paragraphs, we need to parse the line with the PARAGRAPH_REGEX
    const beforeCompare = tokenizedContent.length
    
    // new line parsing
    // cannot be added at the top of the content
    // if there are multiple new lines in a row,
    // only single new line is added to the tokenizedContent
    if(["", "\n"].includes(lineToParse)) {
      // last item of tokenizedContent is an empty line
      if (beforeCompare > 0 && tokenizedContent[beforeCompare-1].type !== "newline") {
        tokenizedContent.push({
          type: "newline"
        })
      }
      continue
    }
    
    // check for the codeblock
    if (lineToParse.startsWith("```")) {
      // find the following "```"
      let lineNumber = i + 1
      while(lines.length > lineNumber && !lines[lineNumber].startsWith("```")) {
        lineNumber++
      }
      const codeBlock = lines.slice(i+1, lineNumber)
        .map(line => line.replace("\r", ""))
        .join("\n")
        // calculate the codeblock tokens here
      const codeLanguage = lineToParse.substring(3)
      tokenizedContent.push({
        type: "codeblock",
        value: codeBlock,
        language: codeLanguage || null
      })
      i = lineNumber
      continue
    }
    
    // look for the every regex in the REGEX object
    for (let key in REGEX) {
      const regex = REGEX[key]
      let match = lineToParse.match(regex)

      if (match) {
        match = regex.exec(lineToParse)

        const indent = match.groups.indent
        delete match.groups.indent

        tokenizedContent.push({
          type: key,
          indent,
          tokens: match.groups,
          raw: lineToParse
        })
        break
      }
    }
    // if noting was found, we submit the content as paragraph for deep tokenization
    if (beforeCompare === tokenizedContent.length) {
      tokenizedContent.push({
        type: "paragraph",
        tokens: {
          value: lineToParse 
        },
        raw: lineToParse // just \r is removed,
      })
    }
    
  }
  return tokenizedContent
}

module.exports = outerTokenizer
