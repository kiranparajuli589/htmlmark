import { TOKENS } from "../util/tokens.js"
import { REGEX } from "../regex/index.js"
import { Commons } from "./tokenizer/commons.js"
import { CodeBlock } from "./tokenizer/codeblock.js"
import { Table } from "./tokenizer/table.js"
import { List } from "./tokenizer/list.js"
import { Quote } from "./tokenizer/quote.js"


export class Lexer {
	#cursor
	#lines
	#lexerData
	#currLine
	#currLineIndent
	#lastLexerItem
	#lexerLengthBefore

	#lazyTokens = [
		TOKENS.QUOTE,
		TOKENS.LIST
	]

	constructor(lines) {
		this.#lines = lines
		this.#lexerData = []
	}

	#runCurrLineLexer() {
		if (["", "\n"].includes(this.#currLine.trim())) return this.#runNewLineLexer()

		Commons.resetRegexes()

		if (REGEX.HR_LINE.test(this.#currLine)) return this.#runHrLineLexer()
		if (REGEX.COMMENT.test(this.#currLine)) return this.#runCommentLexer()
		if (REGEX.IMAGE.test(this.#currLine)) return this.#runImageLexer()
		if (REGEX.HEADING.test(this.#currLine)) return this.#runHeadingLexer()
		if (Quote.test(this.#currLine)) return this.#runQuoteLexer()
		if (List.test(this.#currLine)) return this.#runListLexer()

		if (CodeBlock.typeTest(this.#lines, this.#cursor, this.#currLineIndent)) return this.#runCodeBlockLexer()
		if (Table.typeTest(this.#lines, this.#cursor, this.#currLineIndent)) return this.#runTableLexer()

		const found = this.#checkForLazyLexer()
		if (found) return

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
		const cbTokens = CodeBlock.tokenize(this.#lines, this.#cursor, this.#currLineIndent)

		this.#lexerData.push({
			type: TOKENS.CODE_BLOCK,
			indent: this.#currLineIndent,
			language: cbTokens.language || null,
			value: cbTokens.body
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
		const listTokens = List.tokenize(this.#lines, this.#cursor, this.#currLineIndent)
		this.#cursor = listTokens.cursor

		this.#lexerData.push({
			type: TOKENS.LIST,
			indent: this.#currLineIndent,
			meta: listTokens.type,
			items: listTokens.body
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
		const headingTokens = Commons.tokenizeHeading(this.#currLine)
		const headingLexer = {
			type: TOKENS.HEADING,
			...headingTokens,
			indent: this.#currLineIndent,
			raw: this.#currLine
		}
		this.#lexerData.push(headingLexer)
	}

	#runCommentLexer() {
		const commentTokens = Commons.tokenizeComment(this.#currLine)
		const commentLexer = {
			type: TOKENS.COMMENT,
			indent: this.#currLineIndent,
			...commentTokens,
			raw: this.#currLine
		}
		this.#lexerData.push(commentLexer)
	}

	#runImageLexer() {
		const iTokens = Commons.tokenizeImage(this.#currLine)
		const imageLexer = {
			type: TOKENS.IMAGE,
			indent: this.#currLineIndent,
			...iTokens,
			raw: this.#currLine
		}
		this.#lexerData.push(imageLexer)
	}

	#runParagraphLexer() {
		if (
			this.#lastLexerItem &&
      this.#lastLexerItem.type === TOKENS.PARAGRAPH &&
      this.#lastLexerItem.indent === this.#currLineIndent
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

	#checkForLazyLexer() {
		if (this.#lastLexerItem) {
			if (this.#lazyTokens.includes(this.#lastLexerItem.type)) {
				if (this.#lastLexerItem.type === TOKENS.LIST) {
					const lastItemToken = this.#lastLexerItem.items.at(-1).tokens.value.at(0)
					if (lastItemToken.type === TOKENS.PARAGRAPH) {
						lastItemToken.value += ` ${this.#currLine.trim()}`
						lastItemToken.raw += `\n${this.#currLine}`
						return true
					}
				} else if (this.#lastLexerItem.type === TOKENS.QUOTE) {
					const lastToken = this.#lastLexerItem.tokens.at(-1)
					const lastPiece = Array.isArray(lastToken) ? lastToken.at(-1) : lastToken.value.at(-1)
					if (lastPiece.type === TOKENS.PARAGRAPH) {
						lastPiece.value += ` ${this.#currLine.trim()}`
						lastPiece.raw += `\n${this.#currLine}`
						return true
					}
				}
			}
		}
		return false
	}

	run() {
		for (this.#cursor = 0; this.#cursor < this.#lines.length; this.#cursor++) {
			this.#currLine = this.#lines[this.#cursor].trimEnd()
			this.#lexerLengthBefore = this.#lexerData.length
			this.#lastLexerItem = this.#lexerData[this.#lexerLengthBefore - 1] || null
			this.#currLineIndent = Commons.getIndent(this.#currLine)

			this.#runCurrLineLexer()
		}
		return this.#lexerData
	}
}
