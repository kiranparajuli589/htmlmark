const REGEX = require("../regex")
const TOKENS = require("../util/tokens")
const {
  commonTokenizer,
  tableTokenizer,
  quoteTokenizer,
  listTokenizer,
  cbTokenizer
} = require("./tokenizer")


const { getIndent, tokenizeComment, tokenizeImage, tokenizeHeading } = commonTokenizer
const { getTableLexer } = tableTokenizer
const { findTheEndOfQuote } = quoteTokenizer
const { findTheEndOfList } = listTokenizer
const { getCodeBlock } = cbTokenizer

const lexer = (lines) => {
  const lexerContent = []
  for(let i=0; i<lines.length; i++) {
    const lineToParse = lines[i].trimEnd()

    const lengthBeforeCompare = lexerContent.length

    const lastItem = (lexerContent.length > 0) ? lexerContent[lexerContent.length - 1] : null

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

      const { language: codeLanguage, body: codeBody, cursor } = getCodeBlock(lines, i, currentLineIndentation)

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

      const tData = getTableLexer(lines, i, currentLineIndentation)
      if (tData) {
        lexerContent.push(tData.lexer)
        i = tData.cursor
        continue
      }

    }

    // tokenizing list
    if (lineToParse.match(REGEX.LIST.ITEM)) {
      const { body: listBody, cursor, type: listType } = findTheEndOfList(lines, i, currentLineIndentation)
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
      const { depth, body: quoteBody, cursor } = findTheEndOfQuote(lines, i, currentLineIndentation)
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
      const hTokens = tokenizeHeading(lineToParse)
      const headingLexer = {
        type: TOKENS.HEADING,
        ...hTokens,
        indent: currentLineIndentation,
        raw: lineToParse
      }
      lexerContent.push(headingLexer)
      continue
    }

    if (lineToParse.match(REGEX.COMMENT)) {
      const cTokens = tokenizeComment(lineToParse)
      const commentLexer = {
        type: TOKENS.COMMENT,
        indent: currentLineIndentation,
        ...cTokens,
        raw: lineToParse
      }
      lexerContent.push(commentLexer)
      continue
    }

    if (lineToParse.match(REGEX.IMAGE)) {
      const iTokens = tokenizeImage(lineToParse)
      const imageLexer = {
        type: TOKENS.IMAGE,
        indent: currentLineIndentation,
        ...iTokens,
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
