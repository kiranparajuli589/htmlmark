const { REGEX, findRegex, PARAGRAPH_REGEX } = require("../regex.js")

module.exports = {
  tokenize: (lines) => {
    // parse every line to the respective markdown tokens
    const tokenizedContent = []
    for(let i=0; i<lines.length; i++) {
      const lineToParse = lines[i].replace("\r", "")
      
    
    
      // for paragraphs, we need to parse the line with the PARAGRAPH_REGEX
      const beforeCompare = tokenizedContent.length
    
      // new line parsing
      // if there are multiple new lines in a row,
      // only single new line is added to the tokenizedContent
      if(lineToParse === "") {
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
        while(lines[lineNumber] && !lines[lineNumber].startsWith("```")) {
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
          languuage: codeLanguage
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
      // if noting was found, we parse the line with the PARAGRAPH_REGEX
      if (beforeCompare === tokenizedContent.length) {
        const tokens = findRegex(PARAGRAPH_REGEX, lineToParse)
        tokenizedContent.push({
          type: "paragraph",
          tokens,
          raw: lines[i],
        })
      }
    
    }
    return tokenizedContent
  },
    
  deepTokenizer: (tokenizedContent) => {
    // check for every paresed line for inner tokens
    // if only type is not newline, paragraph, image, comment
    // we add the inner tokens to the parsed line
    for(let i=0; i<tokenizedContent.length; i++) {
      const line = tokenizedContent[i]
      
      if (!["newline", "paragraph", "image", "comment", "quote", "codeblock"].includes(line.type)) {
        line.indent = line.tokens.indent
        line.tokens = findRegex(PARAGRAPH_REGEX, line.tokens.value)
        continue
      }
      // TODO: if quote type handle separately.
      // if quote type, first we need to find the quote depth
      // then we need to find the inner tokens
      // then we need to add the quote depth to the inner tokens
      // then we need to add the inner tokens to the parsed line
      if (line.type === "quote") {
        let depth = 0
        let quoteLine = line.tokens.value
        while(quoteLine.trim().startsWith(">")) {
          depth++
          quoteLine = quoteLine.substring(1).trim()
        }
        // now the quoteline is pure raw text
        // we can check it with the pqragraph regex
        line.depth = depth
        line.indent = line.tokens.indent
        line.tokens = findRegex(PARAGRAPH_REGEX, quoteLine)
      }
    }
    return tokenizedContent
  }
}