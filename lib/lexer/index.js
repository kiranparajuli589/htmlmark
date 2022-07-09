const { getIndent, tokenizeParagraph, tokenizeTableCell } = require("../regex/helper")
const REGEX = require("../regex")
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

    // tokenizing table
    if (lineToParse.match(REGEX.TABLE_ROW)) {

      // quickly check if the followinng two lines are of table types
      const nextLine = lines[i + 1]
      const nextNextLine = lines[i + 2]

      const tableIndent = getIndent(lineToParse)

      if (nextLine === undefined || nextNextLine === undefined || tableIndent !== getIndent(nextLine)) {
        lexerContent.push({
          type: TOKENS.PARAGRAPH,
          tokens: tokenizeParagraph(lineToParse),
          indent: tableIndent
        })
        continue
      }

      let isTableHeadingBodySeparatorPresent = !!nextLine.match(REGEX.TABLE_LINE_1)
      if (!isTableHeadingBodySeparatorPresent) isTableHeadingBodySeparatorPresent = !!nextLine.match(REGEX.TABLE_LINE_2)

      // still we are not verified that a table is actually there
      // so we need to check the next next line if it is table row or not
      if (
        isTableHeadingBodySeparatorPresent &&
        nextNextLine.match(REGEX.TABLE_ROW) &&
        getIndent(nextNextLine) === tableIndent
      ) {
        // now we have 3 lines of table types
        // 1st one is the table header
        // 2nd one is the table header and body separator
        // 3rd one is the table body
        // `i` is the position of the table header

        // we need to find if there are more table rows ahead
        // if there are, then we need to find the end of the table
          
        // start with the first 2nd from the table body
        // cause first row is already proved as a table row
        let tBodyRowCount = i + 3

        while(
          lines[tBodyRowCount] &&
          getIndent(lines[tBodyRowCount]) === tableIndent &&
          lines[tBodyRowCount].match(REGEX.TABLE_ROW)
        ) {
          tBodyRowCount++
        }

        // now we have the end of the table
        // we need to parse the table for it's content
        // only if there are more than or equal to 1 table row
        // +1 to include the 1st row in the table body
        if (tBodyRowCount + 1 > i + 3) {
          const tableRows = lines.slice(i+2, tBodyRowCount)
          const tableLexer = {
            type: TOKENS.TABLE,
            rows: []
          }
          // now tokenize the table heading first
          tableLexer.rows.push(tokenizeTableCell(lineToParse))
          // no actions required for the separator line
          // move on to parse the table body items
          for(let j=0; j<tableRows.length; j++) {
            tableLexer.rows.push(tokenizeTableCell(tableRows[j]))
          }
          lexerContent.push(tableLexer)
          i = tBodyRowCount - 1 // -1 because i is incremented after the loop
          continue
        }
      } else {
        lexerContent.push({
          type: TOKENS.PARAGRAPH,
          tokens: tokenizeParagraph(lineToParse),
          indent: tableIndent
        })
      }
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
          
          lexerData.tokens = tokenizeParagraph(match.groups.value)
          
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

          lexerData.tokens = tokenizeParagraph(quoteLine)

          lexerContent.push(lexerData)
          break
        }

        // if not heading, quote, comment
        // we can check the inner tokens
        lexerData.tokens = tokenizeParagraph(match.groups.value)
        lexerContent.push(lexerData)
        break
      }
    }
    // if noting was found, we submit the content as paragraph for deep tokenization
    if (lengthBeforeCompare === lexerContent.length) {
      lexerContent.push({
        type: TOKENS.PARAGRAPH,
        tokens: tokenizeParagraph(lineToParse),
        raw: lineToParse // just \r is removed,
      })
    }
  }
  return lexerContent
}

module.exports = lexer
