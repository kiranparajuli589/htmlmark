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

module.exports = class Lexer {
  #cursor
  #lines
  #lexerData
  #currentLine
  #currentLineIndent
  #lastLexer
  #lexerLengthBefore

  constructor(lines) {
    this.#lines = lines
    this.#lexerData = []
  }

  getCurrLineType() {
    if (["", "\n"].includes(this.#currentLine.trim())) return TOKENS.NEW_LINE


    // reset all regexes
    REGEX.HR_LINE.lastIndex = 0
    REGEX.COMMENT.lastIndex = 0
    REGEX.IMAGE.lastIndex = 0
    REGEX.HEADING.lastIndex = 0
    REGEX.QUOTE.lastIndex = 0
    REGEX.LIST.lastIndex = 0
    REGEX.CODE_BLOCK.lastIndex = 0


    if (REGEX.HR_LINE.test(this.#currentLine)) return TOKENS.HR_LINE
    if (REGEX.COMMENT.test(this.#currentLine)) return TOKENS.COMMENT
    if (REGEX.IMAGE.test(this.#currentLine)) return TOKENS.IMAGE
    if (REGEX.HEADING.test(this.#currentLine)) return TOKENS.HEADING
    if (REGEX.QUOTE.test(this.#currentLine)) return TOKENS.QUOTE
    if (REGEX.LIST.ITEM.test(this.#currentLine)) return TOKENS.LIST
    if (cbTokenizer.isCB(this.#lines, this.#cursor, this.#currentLineIndent)) return TOKENS.CODE_BLOCK
    if (tableTokenizer.isTable(this.#lines, this.#cursor, this.#currentLineIndent)) return TOKENS.TABLE
    // otherwise, it is a paragraph
    return TOKENS.PARAGRAPH
  }

  runNewLineLexer() {
    // cannot be added at the top of the content
    if (this.#lexerLengthBefore === 0) return true
    // if there are multiple new lines in a row,
    // only single new line is added to the lexerContent
    if (this.#lastLexer.type !== TOKENS.NEW_LINE) {
      this.#lexerData.push({
        type: TOKENS.NEW_LINE,
      })
    }
  }

  runHrLineLexer() {
    if (this.#lastLexer && this.#lastLexer.type === TOKENS.HR_LINE) return true
    this.#lexerData.push({
      type: TOKENS.HR_LINE,
    })
  }

  runCodeBlockLexer() {
    const cbTokens = getCodeBlock(this.#lines, this.#cursor, this.#currentLineIndent)

    this.#lexerData.push({
      type: TOKENS.CODE_BLOCK,
      indent: this.#currentLineIndent,
      value: cbTokens.body,
      language: cbTokens.language || null
    })
    // skip the lines that were parsed
    this.#cursor = cbTokens.cursor
  }

  runTableLexer() {
    const tableTokens = getTableLexer(this.#lines, this.#cursor, this.#currentLineIndent)
    if (tableTokens) {
      this.#lexerData.push(tableTokens.lexer)
      this.#cursor = tableTokens.cursor
    }
  }

  runListLexer() {
    const listTokens = findTheEndOfList(this.#lines, this.#cursor, this.#currentLineIndent)
    this.#cursor = listTokens.cursor

    this.#lexerData.push({
      type: TOKENS.LIST,
      indent: this.#currentLineIndent,
      items: listTokens.body,
      meta: listTokens.type
    })
  }

  runQuoteLexer() {
    const quoteTokens = findTheEndOfQuote(this.#lines, this.#cursor, this.#currentLineIndent)
    this.#cursor = quoteTokens.cursor

    this.#lexerData.push({
      type: TOKENS.QUOTE,
      indent: this.#currentLineIndent,
      depth: quoteTokens.depth,
      tokens: quoteTokens.body,
    })
  }

  runHeadingLexer() {
    const headingTokens = tokenizeHeading(this.#currentLine)
    const headingLexer = {
      type: TOKENS.HEADING,
      ...headingTokens,
      indent: this.#currentLineIndent,
      raw: this.#currentLine
    }
    this.#lexerData.push(headingLexer)
  }

  runCommentLexer() {
    const commentTokens = tokenizeComment(this.#currentLine)
    const commentLexer = {
      type: TOKENS.COMMENT,
      indent: this.#currentLineIndent,
      ...commentTokens,
      raw: this.#currentLine
    }
    this.#lexerData.push(commentLexer)
  }

  runImageLexer() {
    const iTokens = tokenizeImage(this.#currentLine)
    const imageLexer = {
      type: TOKENS.IMAGE,
      indent: this.#currentLineIndent,
      ...iTokens,
      raw: this.#currentLine
    }
    this.#lexerData.push(imageLexer)
  }

  runParagraphLexer() {
    if (this.#lastLexer && this.#lastLexer.type === TOKENS.PARAGRAPH) {
      this.#lastLexer.value += this.#currentLine.trim()
      this.#lastLexer.raw += this.#currentLine
    } else {
      this.#lexerData.push({
        type: TOKENS.PARAGRAPH,
        indent: this.#currentLineIndent,
        value: this.#currentLine.trimEnd(),
        raw: this.#currentLine
      })
    }
  }

  run () {
    for (this.#cursor = 0; this.#cursor < this.#lines.length; this.#cursor++) {
      this.#currentLine = this.#lines[this.#cursor].trimEnd()
      this.#lexerLengthBefore = this.#lexerData.length
      this.#lastLexer = this.#lexerData[this.#lexerLengthBefore - 1] || null
      this.#currentLineIndent = getIndent(this.#currentLine)

      const mayBeType = this.getCurrLineType()

      switch (mayBeType) {
      case TOKENS.NEW_LINE:
        this.runNewLineLexer()
        continue
      case TOKENS.HR_LINE:
        this.runHrLineLexer()
        continue
      case TOKENS.CODE_BLOCK:
        this.runCodeBlockLexer()
        continue
      case TOKENS.TABLE:
        this.runTableLexer()
        continue
      case TOKENS.LIST:
        this.runListLexer()
        continue
      case TOKENS.QUOTE:
        this.runQuoteLexer()
        continue
      case TOKENS.HEADING:
        this.runHeadingLexer()
        continue
      case TOKENS.COMMENT:
        this.runCommentLexer()
        continue
      case TOKENS.IMAGE:
        this.runImageLexer()
        continue
      default:
        this.runParagraphLexer()
      }
    }
    return this.#lexerData
  }
}
