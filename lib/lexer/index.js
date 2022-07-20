const {
  getIndent,
  tokenizeTableCell,
  getTableCellCount, findTheEndOfList, findTheEndOfQuote, getCodeBlock
} = require("./deep")
const REGEX = require("../regex")
const TOKENS = require("../util/tokens")

const lexer = (lines) => {
  // parse every line to the respective markdown tokens
  const lexerContent = []
  for(let i=0; i<lines.length; i++) {
    const lineToParse = lines[i].trimEnd()

    // for paragraphs, we need to parse the line with the PARAGRAPH_REGEX
    const lengthBeforeCompare = lexerContent.length

    // last item in the lexerContent
    const lastItem = (lexerContent.length > 0) ? lexerContent[lexerContent.length - 1] : null

    // current line indentation
    const currentLineIndentation = getIndent(lineToParse)

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
    if (lineToParse.match(REGEX.HR_LINE)) {
      if (lastItem && lastItem.type === TOKENS.HR_LINE) continue
      lexerContent.push({
        type: TOKENS.HR_LINE,
      })
      continue
    }

    // check for the codeblock
    if (lineToParse.trim().startsWith("```")) {

      const { language: codeLanguage, body: codeBody, cursor} = getCodeBlock(lines, i, currentLineIndentation)

      if (codeBody.length > 0) {
        lexerContent.push({
          type: TOKENS.CODE_BLOCK,
          indent: currentLineIndentation,
          value: codeBody,
          language: codeLanguage || null
        })
        // skip the lines that were parsed
        i = cursor
        continue
      }
    }

    // tokenizing table
    if (lineToParse.match(REGEX.TABLE.ROW)) {

      const tableCellCount = getTableCellCount(lineToParse)

      // quickly check if the following two lines are of table types
      let nextLine = lines[i + 1]
      let nextNextLine = lines[i + 2]

      if (!!nextLine && !!nextNextLine && currentLineIndentation === getIndent(nextLine)) {
        // trim next lines
        nextLine = nextLine.trimEnd()
        nextNextLine = nextNextLine.trimEnd()

        let isTableHeadingBodySeparatorPresent = !!nextLine.match(REGEX.TABLE.DASHED_LINE)
        if (!isTableHeadingBodySeparatorPresent) {
          isTableHeadingBodySeparatorPresent = !!nextLine.match(REGEX.TABLE.COLON_DASH_LINE)
        }
        isTableHeadingBodySeparatorPresent = getTableCellCount(nextLine) === tableCellCount

        // still we are not verified that a table is actually there
        // so, we need to check the following 2nd line if it is table row or not
        if (
          isTableHeadingBodySeparatorPresent &&
          nextNextLine.match(REGEX.TABLE.ROW) &&
          getIndent(nextNextLine) === currentLineIndentation &&
          getTableCellCount(nextNextLine) === tableCellCount
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
            getIndent(lines[tBodyRowCount]) === currentLineIndentation &&
            lines[tBodyRowCount].trimEnd().match(REGEX.TABLE.ROW) &&
            getTableCellCount(lines[tBodyRowCount]) === tableCellCount
          ) {
            tBodyRowCount++
          }

          // now we have the end of the table
          // we need to parse the table for it's content
          // only if there are more than or equal to 1 table row
          if (tBodyRowCount > i + 2) {
            const tableRows = lines.slice(i+2, tBodyRowCount)
            const tableLexer = {
              type: TOKENS.TABLE,
              indent: currentLineIndentation,
              rows: []
            }
            // now tokenize the table heading first
            tableLexer.rows.push(tokenizeTableCell(lineToParse))
            // no actions required for the separator line
            // move on to parse the table body items
            for(let j=0; j<tableRows.length; j++) {
              tableLexer.rows.push(tokenizeTableCell(tableRows[j].trimEnd()))
            }
            lexerContent.push(tableLexer)
            i = tBodyRowCount - 1
            continue
          }
        }
      }
    }

    // tokenizing list
    if (lineToParse.match(REGEX.LIST.ITEM)) {
      const {body: listBody, cursor, type: listType} = findTheEndOfList(lines, i, currentLineIndentation)
      i = cursor

      lexerContent.push({
        type: TOKENS.LIST,
        indent: currentLineIndentation,
        items: listBody,
        meta: listType
      })
      continue
    }

    if (lineToParse.match(REGEX.QUOTE)) {
      const {depth, body: quoteBody, cursor} = findTheEndOfQuote(lines, i, currentLineIndentation)
      i = cursor

      lexerContent.push({
        type: TOKENS.QUOTE,
        indent: currentLineIndentation,
        depth,
        tokens: quoteBody,
      })
      continue
    }

    if (lineToParse.match(REGEX.HEADING)) {
      const hMatch = REGEX.HEADING.exec(lineToParse.trim())
      const headingLexer = {
        type: TOKENS.HEADING,
        level: hMatch.groups.level.length,
        indent: currentLineIndentation,
        value: hMatch.groups.value,
        raw: lineToParse
      }
      lexerContent.push(headingLexer)
      continue
    }

    if (lineToParse.match(REGEX.COMMENT)) {
      const cMatch = REGEX.COMMENT.exec(lineToParse.trim())
      const commentLexer = {
        type: TOKENS.COMMENT,
        indent: currentLineIndentation,
        value: cMatch.groups.value,
        raw: lineToParse
      }
      lexerContent.push(commentLexer)
      continue
    }

    if (lineToParse.match(REGEX.IMAGE)) {
      const iMatch = REGEX.IMAGE.exec(lineToParse.trim())
      const imageLexer = {
        type: TOKENS.IMAGE,
        indent: currentLineIndentation,
        url: iMatch.groups.url,
        alt: iMatch.groups.alt,
        raw: lineToParse
      }
      lexerContent.push(imageLexer)
      continue
    }

    // if noting was found, we submit the content as paragraph for deep tokenization
    // if previous line is a paragraph, then we can concatenate the lines
    if (lastItem && lastItem.type === TOKENS.PARAGRAPH) {
      lastItem.value += lineToParse.trim()
      lastItem.raw += lineToParse
    } else {
      lexerContent.push({
        type: TOKENS.PARAGRAPH,
        indent: currentLineIndentation,
        value: lineToParse.trimEnd(),
        raw: lineToParse
      })
    }
  }
  return lexerContent
}

module.exports = lexer
