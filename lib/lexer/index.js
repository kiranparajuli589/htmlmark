const REGEX = require("../util/regex")
const TOKENS = require("../util/tokens")

const lexer = (lines) => {
  // parse every line to the respective markdown tokens
  const lexerContent = []
  for(let i=0; i<lines.length; i++) {
    const lineToParse = lines[i].replaceAll("\r", "")
    
    // for paragraphs, we need to parse the line with the PARAGRAPH_REGEX
    const lengthBeforeCompare = lexerContent.length

    // last item in the lexerContent
    const lastItem = (lexerContent.length > 0) ? lexerContent[lexerContent.length - 1] : null
    
    // new line parsing
    if(lineToParse === "" || lineToParse === "\n") {
      if (lengthBeforeCompare === 0) continue // cannot be added at the top of the content
      // if there are multiple new lines in a row,
      // only single new line is added to the lexerContent
      if (lastItem.type !== TOKENS.NEW_LINE) {
        lexerContent.push({
          type: TOKENS.NEW_LINE,
        })
      }
      continue
    }

    // hr line parsing
    // no multiple consecutive hr lines
    if (lineToParse === "---") {
      if (lastItem && lastItem.type === TOKENS.HR_LINE) continue
      lexerContent.push({
        type: TOKENS.HR_LINE,
      })
      continue
    }
    
    // check for the codeblock
    if (lineToParse.trim().startsWith("```")) {
      // find the closing codeblock "```"
      // start with the next line
      let lineNumber = i + 1
      while(lines.length > lineNumber && !lines[lineNumber].trim().startsWith("```")) {
        lineNumber++
      }
      // now we have the start and end of the codeblock
      // we need to parse the codeblock for it's content
      const codeBlock = lines.slice(i+1, lineNumber)
        // these line may not have \r stripped, so we need to remove them here
        .map(line => line.replace("\r", ""))
        .join("\n")
      // calculate the codeblock tokens
      // get the language from the first line
      const codeLanguage = lineToParse.trim().substring(3)

      lexerContent.push({
        type: TOKENS.CODE_BLOCK,
        tokens: [{
          value: codeBlock
        }],
        language: codeLanguage || null
      })
      // skip the lines that were parsed
      i = lineNumber
      continue
    }
    
    // look for the every commen items from REGEX
    // except for newline, paragraph & codeblock
    // cause, handled slightly differenty
    for (let key in REGEX.COMMON) {
      const regex = REGEX.COMMON[key]
      let match = lineToParse.match(regex)
      if (match) {
        match = regex.exec(lineToParse)

        const indent = match.groups.indent
        delete match.groups.indent

        const lexerData = {
          type: TOKENS[key],
          indent,
          tokens: match.groups,
          raw: lineToParse
        }

        if ([TOKENS.COMMENT, TOKENS.IMAGE].includes(TOKENS[key])) {
          // codeblock, image doesn't need to be checked for the inner tokens
          lexerContent.push(lexerData)
          break
        }

        if (TOKENS[key] === TOKENS.HEADING) {
          // preserve the heading depth
          lexerData.level = match.groups.level.length
          delete match.groups.level
          
          lexerData.tokens = REGEX.find(REGEX.PARAGRAPH, match.groups.value)
          
          lexerContent.push(lexerData)
          break
        }

        if (TOKENS[key] === TOKENS.QUOTE) {
          // if quote type, first we need to find the quote depth
          let depth = 0 // first depth is 0
          let quoteLine = lexerData.tokens.value
          while(quoteLine.trim().startsWith(">")) {
            depth++
            quoteLine = quoteLine.substring(1).trim()
          }
          // now the quoteline is pure raw text
          // we can check it for the inner tokens
          lexerData.depth = depth

          lexerData.tokens = REGEX.find(REGEX.PARAGRAPH, quoteLine)

          lexerContent.push(lexerData)
          break
        }

        // if not heading, quote, comment
        // we can check the inner tokens
        lexerData.tokens = REGEX.find(REGEX.PARAGRAPH, match.groups.value)
        lexerContent.push(lexerData)
        break
      }
    }
    // if noting was found, we submit the content as paragraph for deep tokenization
    if (lengthBeforeCompare === lexerContent.length) {
      lexerContent.push({
        type: TOKENS.PARAGRAPH,
        tokens: REGEX.find(REGEX.PARAGRAPH, lineToParse),
        raw: lineToParse // just \r is removed,
      })
    }
  }
  return lexerContent
}

module.exports = lexer
