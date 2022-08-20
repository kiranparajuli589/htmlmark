import { TOKENS } from "../util/tokens.js"
import { CodeBlock } from "../tokenizer/codeblock.js"
import { Table } from "../tokenizer/table.js"
import { Comment } from "../tokenizer/comment.js"
import { List } from "../tokenizer/list.js"
import { Quote } from "../tokenizer/quote.js"
import { HR } from "../tokenizer/hr.js"
import { Image } from "../tokenizer/image.js"
import { Heading } from "../tokenizer/heading.js"
import { Indent } from "../util/indent.js"
import { Newline } from "../tokenizer/newline.js"


export class Lexer {
	#cursor
	#lines
	#lexerData
	#currLine
	#currLineIndent
	#currLineRawIndent
	#lastLexerItem
	#lexerLengthBefore
	#deep

	constructor(lines, deep = false) {
		this.#lines = lines
		this.#lexerData = []
		this.#deep = deep
	}

	#runCurrLineLexer() {
		if (Newline.test(this.#currLine)) return this.#runNewLineLexer()

		if (HR.test(this.#currLine)) return this.#runHrLineLexer()
		if (Comment.test(this.#currLine)) return this.#runCommentLexer()
		if (Image.test(this.#currLine)) return this.#runImageLexer()
		if (Heading.test(this.#currLine)) return this.#runHeadingLexer()
		if (Quote.test(this.#currLine)) return this.#runQuoteLexer()
		if (List.testItem(this.#currLine)) return this.#runListLexer()

		if (Table.test(this.#lines, this.#cursor, this.#currLineIndent)) return this.#runTableLexer()
		if (CodeBlock.test(this.#currLine, this.#currLineIndent, this.#deep, this.#lastLexerItem)) return this.#runCodeBlockLexer()

		// otherwise, it is a paragraph
		return this.#runParagraphLexer()
	}

	#runNewLineLexer() {
		// cannot be added at the top of the content
		if (this.#lexerLengthBefore === 0) return true
		// if there are multiple new lines in a row,
		// only single new line is added to the lexerContent
		if (this.#lastLexerItem.type !== TOKENS.NEW_LINE) {
			this.#lexerData.push({
				type: TOKENS.NEW_LINE
			})
		}
	}

	#runHrLineLexer() {
		if (this.#lastLexerItem && this.#lastLexerItem.type === TOKENS.HR_LINE) return true
		this.#lexerData.push({
			type: TOKENS.HR_LINE
		})
	}

	#runCodeBlockLexer() {
		const cbTokens = CodeBlock.tokenize(
			this.#lines,
			this.#cursor,
			this.#currLineIndent,
			this.#currLineRawIndent
		)

		this.#lexerData.push({
			type: TOKENS.CODE_BLOCK,
			indent: this.#currLineIndent,
			language: cbTokens.language || null,
			value: cbTokens.body,
			raw: cbTokens.raw
		})
		// skip the lines that were parsed
		this.#cursor = cbTokens.cursor
	}

	#runTableLexer() {
		const tableTokens = Table.tokenize(this.#lines, this.#cursor, this.#currLineIndent)
		this.#lexerData.push(tableTokens.lexer)
		this.#cursor = tableTokens.cursor
	}

	#runListLexer() {
		const list = new List(
			this.#lines,
			this.#cursor,
			this.#currLineIndent,
			this.#deep
		)
		const listTokens = list.tokenize()


		this.#cursor = listTokens.cursor

		if (
			this.#lastLexerItem &&
			this.#lastLexerItem.type === TOKENS.LIST &&
			this.#lastLexerItem.indent === this.#currLineIndent &&
			this.#lastLexerItem.meta.checked === listTokens.meta.checked &&
			this.#lastLexerItem.meta.ordered === listTokens.meta.ordered &&
			this.#lastLexerItem.meta.identifier === listTokens.meta.identifier
		) {
			this.#lastLexerItem.items.push(listTokens.body)
			return
		}

		this.#lexerData.push({
			type: TOKENS.LIST,
			indent: this.#currLineIndent,
			meta: listTokens.meta,
			items: [listTokens.body]
		})
	}

	#runQuoteLexer() {
		const quoteTokens = Quote.tokenize(this.#lines, this.#cursor, this.#currLineIndent)
		this.#cursor = quoteTokens.cursor

		this.#lexerData.push({
			type: TOKENS.QUOTE,
			indent: this.#currLineIndent,
			depth: quoteTokens.depth,
			tokens: quoteTokens.tokens,
			raw: quoteTokens.raw
		})
	}

	#runHeadingLexer() {
		this.#lexerData.push({
			type: TOKENS.HEADING,
			indent: this.#currLineIndent,
			...Heading.tokenize(this.#currLine),
			raw: this.#currLine
		})
	}

	#runCommentLexer() {
		this.#lexerData.push({
			type: TOKENS.COMMENT,
			indent: this.#currLineIndent,
			...Comment.tokenize(this.#currLine),
			raw: this.#currLine
		})
	}

	#runImageLexer() {
		this.#lexerData.push({
			type: TOKENS.IMAGE,
			indent: this.#currLineIndent,
			...Image.tokenize(this.#currLine),
			raw: this.#currLine
		})
	}

	#runParagraphLexer() {
		if (
			this.#lastLexerItem &&
      this.#lastLexerItem.type === TOKENS.PARAGRAPH &&
      this.#currLineIndent >= this.#lastLexerItem.indent
		) {
			this.#lastLexerItem.value += ` ${this.#currLine.trim()}`
			this.#lastLexerItem.raw += `\n${this.#currLine}`
		} else {
			this.#lexerData.push({
				type: TOKENS.PARAGRAPH,
				indent: this.#currLineIndent,
				value: this.#currLine.trimEnd(),
				raw: this.#currLine
			})
		}
	}

	run() {
		for (this.#cursor = 0; this.#cursor < this.#lines.length; this.#cursor++) {
			this.#currLine = this.#lines[this.#cursor].trimEnd()
			this.#lexerLengthBefore = this.#lexerData.length
			this.#lastLexerItem = this.#lexerData[this.#lexerLengthBefore - 1] || null
			this.#currLineRawIndent = Indent.raw(this.#currLine)
			this.#currLineIndent = Indent.calc(this.#currLineRawIndent)

			this.#runCurrLineLexer()
		}
		return this.#lexerData
	}
}
