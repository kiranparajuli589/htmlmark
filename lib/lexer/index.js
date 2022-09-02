import { TOKENS } from "../util/tokens.js"
import { CodeBlock } from "../tokenizer/codeblock.js"
import { Table } from "../tokenizer/table.js"
import { Comment } from "../tokenizer/comment.js"
import { List } from "../tokenizer/list.js"
import { Quote } from "../tokenizer/quote.js"
import { HrLine } from "../tokenizer/hrLine.js"
import { Image } from "../tokenizer/image.js"
import { Heading } from "../tokenizer/heading.js"
import { Indent } from "../util/indent.js"
import { Newline } from "../tokenizer/newline.js"
import { Utils } from "../util/utils.js"
import { REGEX } from "../regex/index.js"
import { Paragraph } from "../tokenizer/paragraph.js"


export class Lexer {
	#cursor
	#lines
	#lexerData
	#currLine
	#nextLine
	#currLineIndent
	#currLineRawIndent
	#lastLexerItem
	#lexerLengthBefore
	#from
	#linkRefs = []

	constructor(lines, from = null) {
		this.#lines = lines
		this.#lexerData = []
		this.#from = from
	}
	#runCurrLineLexer() {
		if (Newline.test(this.#currLine)) return this.#runNewLineLexer()

		if (HrLine.test(this.#currLine)) return this.#runHrLineLexer()
		if (Comment.test(this.#currLine)) return this.#runCommentLexer()
		if (Image.test(this.#currLine)) return this.#runImageLexer()
		if (Quote.test(this.#currLine)) return this.#runQuoteLexer()
		if (List.test(this.#currLine)) return this.#runListLexer()
		if (Heading.test(this.#currLine, this.#nextLine)) return this.#runHeadingLexer()

		if (Table.test(this.#lines, this.#cursor, this.#currLineIndent)) return this.#runTableLexer()
		if (CodeBlock.test(this.#currLine, this.#currLineIndent, this.#from, this.#lastLexerItem)) return this.#runCodeBlockLexer()

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
		const cbTokenizer = new CodeBlock(
			this.#lines,
			this.#cursor,
			this.#currLineIndent,
			this.#currLineRawIndent
		)

		const cbTokens = cbTokenizer.tokenize()

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
		const tableTokenizer = new Table(
			this.#lines,
			this.#cursor,
			this.#currLineIndent,
			this.#linkRefs
		)
		const tableTokens = tableTokenizer.tokenize()

		this.#lexerData.push(tableTokens.lexer)

		this.#cursor = tableTokens.cursor
	}

	#runListLexer() {
		const list = new List(
			this.#lines,
			this.#cursor,
			this.#currLineIndent,
			this.#from
		)
		const listTokens = list.tokenize()


		this.#cursor = listTokens.cursor

		if (
			List.isLastLexerTheSameList(this.#lastLexerItem, listTokens, this.#currLineIndent)
		) {
			this.#lastLexerItem.items.push(listTokens.body)
			this.#lastLexerItem.raw += `\n${listTokens.body.raw}`
			return
		}

		const lastLastLexerItem = this.#lexerData[this.#lexerData.length - 2] || false

		if (
			this.#lastLexerItem &&
			this.#lastLexerItem.type === TOKENS.NEW_LINE &&
			List.isLastLexerTheSameList(lastLastLexerItem, listTokens, this.#currLineIndent)
		) {
			// remove last newline from the lexer content
			this.#lexerData.pop()
			// add the list to the last lexer item
			const lastLexerItem = this.#lexerData.at(-1)
			// lastLexerItem.items.push(newline)
			lastLexerItem.items.push(listTokens.body)
			lastLexerItem.raw += `\n${listTokens.body.raw}`
			return
		}

		this.#lexerData.push({
			type: TOKENS.LIST,
			indent: this.#currLineIndent,
			meta: listTokens.meta,
			items: [listTokens.body],
			raw: listTokens.body.raw
		})
	}

	#runQuoteLexer() {
		const quoteTokenizer = new Quote(this.#lines, this.#cursor)
		const quoteTokens = quoteTokenizer.tokenize()
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

		const hTokenizer = new Heading(this.#currLine, this.#nextLine)
		const hTokens = hTokenizer.tokenize()

		if (hTokens.setext) {
			this.#cursor++
		}

		this.#lexerData.push({
			type: TOKENS.HEADING,
			indent: this.#currLineIndent,
			...hTokens,
			tokens: Paragraph.tokenize(hTokens.value, this.#linkRefs)
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

			// if the last line has 2 or more spaces at the end,
			// then a line break is added to the last line
			// otherwise, the line is added to the last line

			if (this.#lastLexerItem.raw.endsWith("  ")) {
				this.#lastLexerItem.value = this.#lastLexerItem.value.trimEnd() + "<br>"
			}
			this.#lastLexerItem.raw += `\n${this.#currLine}`
			this.#lastLexerItem.value += ` ${this.#currLine}`
			this.#lastLexerItem.tokens = Paragraph.tokenize(this.#lastLexerItem.value, this.#linkRefs)
		} else {
			this.#lexerData.push({
				type: TOKENS.PARAGRAPH,
				indent: this.#currLineIndent,
				tokens: Paragraph.tokenize(this.#currLine, this.#linkRefs),
				raw: this.#currLine,
				value: this.#currLine
			})
		}
	}

	#checkForLinkRefs() {
		for (this.#cursor = 0; this.#cursor < this.#lines.length; this.#cursor++) {
			const line = this.#lines[this.#cursor]
			if (Utils.testRegex(line, REGEX.LINK_REF.DECLARATION)) {
				this.#linkRefs.push(Utils.execRegex(line, REGEX.LINK_REF.DECLARATION).groups)
				// now remove the current line from the lines array
				this.#lines.splice(this.#cursor, 1)
			}
		}
	}

	#runPrep() {
		this.#currLine = this.#lines[this.#cursor]
		this.#nextLine = this.#lines[this.#cursor + 1]
		this.#lexerLengthBefore = this.#lexerData.length
		this.#lastLexerItem = this.#lexerData[this.#lexerLengthBefore - 1] || null
		this.#currLineRawIndent = Indent.raw(this.#currLine)
		this.#currLineIndent = Indent.calc(this.#currLineRawIndent)
	}

	run() {
		this.#checkForLinkRefs()

		for (this.#cursor = 0; this.#cursor < this.#lines.length; this.#cursor++) {
			this.#runPrep()

			this.#runCurrLineLexer()
		}

		return this.#lexerData
	}
}
