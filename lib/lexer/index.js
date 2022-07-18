const {
  getIndent,
  tokenizeTableCell,
  isListItemOfOrderedType,
  getListItemTokens,
  isListItemOfCheckboxType,
  getTableCellCount
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
        indent: currentLineIndentation,
        value: codeBlock.trim(),
        language: codeLanguage || null
      })
      // skip the lines that were parsed
      i = lineNumber
      continue
    }

    // tokenizing table
    if (lineToParse.match(REGEX.TABLE_ROW)) {

      const tableCellCount = getTableCellCount(lineToParse)

      // quickly check if the followinng two lines are of table types
      let nextLine = lines[i + 1]
      let nextNextLine = lines[i + 2]

      if (nextLine === undefined || nextNextLine === undefined || currentLineIndentation !== getIndent(nextLine)) {
        lexerContent.push({
          type: TOKENS.PARAGRAPH,
          value: lineToParse.trim(),
          indent: currentLineIndentation,
          raw: lineToParse
        })
        continue
      }

      // trim next lines
      nextLine = nextLine.trimEnd()
      nextNextLine = nextNextLine.trimEnd()

      let isTableHeadingBodySeparatorPresent = !!nextLine.match(REGEX.TABLE_LINE_1)
      if (!isTableHeadingBodySeparatorPresent) isTableHeadingBodySeparatorPresent = !!nextLine.match(REGEX.TABLE_LINE_2)
      isTableHeadingBodySeparatorPresent = getTableCellCount(nextLine) === tableCellCount

      // still we are not verified that a table is actually there
      // so, we need to check the following 2nd line if it is table row or not
      if (
        isTableHeadingBodySeparatorPresent &&
        nextNextLine.match(REGEX.TABLE_ROW) &&
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
          lines[tBodyRowCount].trimEnd().match(REGEX.TABLE_ROW) &&
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
      } else {
        lexerContent.push({
          type: TOKENS.PARAGRAPH,
          value: lineToParse.trim(),
          indent: currentLineIndentation,
          raw: lineToParse
        })
      }
    }

    // tokenizing list
    if (lineToParse.match(REGEX.LIST_ITEM)) {
      // check for the end of the list
      // start from the next line

      // find the first line if it is of count type
      const isOrderedList = isListItemOfOrderedType(lineToParse)
      const isCheckboxList = isListItemOfCheckboxType(lineToParse)

      let cursorPosition = i + 1

      const listBody = {}

      listBody[lineToParse] = getListItemTokens(lineToParse)

      while (
        lines[cursorPosition] &&
        getIndent(lines[cursorPosition]) === currentLineIndentation &&
        lines[cursorPosition].match(REGEX.LIST_ITEM) &&
        isListItemOfOrderedType(lines[cursorPosition]) === isOrderedList &&
        isListItemOfCheckboxType(lines[cursorPosition]) === isCheckboxList
      ) {
        listBody[lines[cursorPosition]] = getListItemTokens(lines[cursorPosition])
        cursorPosition++
      }
      // now we have the end of the list
      // we need to parse the list for it's content
      const listLexer = {
        type: TOKENS.LIST,
        indent: currentLineIndentation,
        items: [],
        ordered: isOrderedList,
        checkList: isCheckboxList
      }

      // now tokenize the list items
      Object.keys(listBody).forEach(listItem => {
        const listItemLexer = {
          type: TOKENS.LIST_ITEM,
          raw: listItem.trimEnd(),
        }
        if (listBody[listItem].countText) {
          listItemLexer.type = TOKENS.COUNT_ITEM
          listItemLexer.countText = listBody[listItem].countText
        }
        if (listBody[listItem].checkText) {
          listItemLexer.type = TOKENS.CHECK_ITEM
          listItemLexer.checked = listBody[listItem].checkText === "x"
        }
        listItemLexer.value = listBody[listItem].value.trim()
        listLexer.items.push(listItemLexer)
      })
      lexerContent.push(listLexer)
      i = cursorPosition - 1
      continue
    }

    if (lineToParse.match(REGEX.QUOTE)) {
      // preserver the quote depth and tokenize the value
      let depth = -1
      let lineValue = lineToParse
      do {
        depth++
        const qMatch = REGEX.QUOTE.exec(lineValue)
        lineValue = qMatch.groups.value
      } while(lineValue.match(REGEX.QUOTE))

      lexerContent.push({
        type: TOKENS.QUOTE,
        indent: currentLineIndentation,
        depth,
        value: lineValue.trim(),
        raw: lineToParse
      })
    }

    // look for the every common items from REGEX
    // except for newline, paragraph & codeblock
    // cause, handled slightly differently
    for (let key in REGEX.COMMON) {
      const regex = REGEX.COMMON[key]
      if (lineToParse.match(regex)) {
        let match = regex.exec(lineToParse)

        const lexerData = {
          type: TOKENS[key],
          indent: currentLineIndentation,
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
        }

        // if not heading, quote, comment
        // we can check the inner tokens
        lexerData.value = match.groups.value.trim()
        lexerContent.push(lexerData)
        break
      }
    }
    // if noting was found, we submit the content as paragraph for deep tokenization
    if (lengthBeforeCompare === lexerContent.length) {
      lexerContent.push({
        type: TOKENS.PARAGRAPH,
        indent: currentLineIndentation,
        value: lineToParse.trim(),
        raw: lineToParse // just \r is removed,
      })
    }
  }
  return lexerContent
}

module.exports = lexer
