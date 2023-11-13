import REGEX from "../regex/index.js"
import {
	Newline, Heading, FrontMatter, List, HTML,
	HrLine, Paragraph, Comment, Quote, Image, Table, CodeBlock
} from "../tokenizer/index.js"
import { Indent, Utils, TOKENS } from "../util/index.js"


class Lexer {
	#cursor
	#lines
	#lexerData
	#currLine
	#nextLine
	#currLineIndent
	#currLineRawIndent
	#lastLexerItem
	#lexerLengthBefore
	#fromToken
	#linkRefs = []
	#frontMatter
	#config
	#indentObj
	#context

	constructor(lines, { from = null, config= {} } = {}) {
		this.#cursor = 0
		this.#lines = lines
		this.#lexerData = []
		this.#fromToken = from

		this.#config = Utils.prepareConfig(config)

		this.#indentObj = new Indent(
			this.#config.indent,
			this.#config.tabSize
		)
	}

	run() {
		this.#skipFrontMatter()
		if (this.#config.useLinkRefs) {
			this.#checkForLinkRefs()
		}

		for (this.#cursor = 0; this.#cursor < this.#lines.length; this.#cursor++) {
			this.#runPrep()
			this.#runCurrLineLexer()
		}

		return this.#lexerData
	}

	#runPrep() {
		this.#currLine = this.#lines[this.#cursor]
		this.#nextLine = this.#lines[this.#cursor + 1]
		this.#lexerLengthBefore = this.#lexerData.length
		this.#lastLexerItem = this.#lexerData[this.#lexerLengthBefore - 1] || null
		this.#currLineRawIndent = this.#indentObj.raw(this.#currLine)
		this.#currLineIndent = this.#indentObj.calc(this.#currLine)

		this.#context = {
			line: this.#currLine,
			nextLine: this.#nextLine,
			lines: this.#lines,
			cursor: this.#cursor,
			indent: this.#currLineIndent,
			lastLexer: this.#lastLexerItem,
			fromToken: this.#fromToken,
			indentObj: this.#indentObj
		}
	}

	#runCurrLineLexer() {
		if (Newline.test(this.#context)) return this.#runNewLineLexer()

		if (Heading.test(this.#context)) return this.#runHeadingLexer()

		if (HrLine.test(this.#context)) return this.#runHrLineLexer()

		if (Comment.test(this.#context)) return this.#runCommentLexer()

		if (Image.test(this.#context)) return this.#runImageLexer()

		if (Quote.test(this.#context)) return this.#runQuoteLexer()

		if (List.test(this.#context)) return this.#runListLexer()

		if (Table.test(this.#context)) {
			return this.#runTableLexer()
		}

		if (HTML.testBlock(this.#context)) return this.#runHTMLLexer()

		if (CodeBlock.test(this.#context)) return this.#runCodeBlockLexer()

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
		// if (this.#lastLexerItem && this.#lastLexerItem.type === TOKENS.HR_LINE) return true
		this.#lexerData.push({
			type: TOKENS.HR_LINE
		})
	}

	#runCodeBlockLexer() {
		const cbTokenizer = new CodeBlock(
			this.#lines,
			this.#cursor,
			this.#indentObj,
			this.#currLineIndent,
			this.#currLineRawIndent
		)

		const cbTokens = cbTokenizer.tokenize()

		this.#lexerData.push(cbTokens.lexer)

		// skip the lines that were parsed
		this.#cursor = cbTokens.cursor
	}

	#runTableLexer() {
		const tableTokenizer = new Table(
			this.#lines,
			this.#cursor,
			this.#indentObj,
			this.#currLineIndent,
			this.#linkRefs
		)
		const tableTokens = tableTokenizer.tokenize()

		this.#lexerData.push(tableTokens.lexer)

		this.#cursor = tableTokens.cursor
	}

	#runHTMLLexer() {
		const htmlTokenizer = new HTML(
			this.#lines,
			this.#cursor,
			this.#currLineIndent,
			this.#linkRefs
		)
		const htmlTokens = htmlTokenizer.tokenize()

		this.#lexerData.push(htmlTokens.lexer)

		this.#cursor = htmlTokens.cursor
	}

	#runListLexer() {
		const list = new List(
			this.#lines,
			this.#cursor,
			this.#currLineIndent,
			this.#fromToken,
			this.#config
		)
		const listTokens = list.tokenize()


		this.#cursor = listTokens.cursor

		// case 1: if the last lexer is a list with same context,
		// then merge the list items into the last lexer items
		if (
			this.#lastLexerItem &&
			List.compareIfTwoListLexerAreOfSameType(this.#lastLexerItem, listTokens, this.#currLineIndent)
		) {
			this.#lastLexerItem.items.push(listTokens.lexer)
			this.#lastLexerItem.raw += `\n${listTokens.lexer.raw}`
			return
		}

		// case 2: if the last lexer is a newline and the lexer before that is a list with same context,
		// then merge the list items into the last lexer items
		const lastLastLexerItem = this.#lexerData[this.#lexerData.length - 2] || false

		if (
			this.#lastLexerItem &&
			this.#lastLexerItem.type === TOKENS.NEW_LINE &&
			List.compareIfTwoListLexerAreOfSameType(lastLastLexerItem, listTokens, this.#currLineIndent)
		) {
			// remove last newline from the lexer content
			this.#lexerData.pop()
			// add the list to the last lexer item
			const lastLexerItem = this.#lexerData.at(-1)
			// lastLexerItem.items.push(newline)
			lastLexerItem.items.push(listTokens.lexer)
			lastLexerItem.raw += `\n${listTokens.lexer.raw}`
			return
		}

		this.#lexerData.push({
			type: TOKENS.LIST,
			indent: this.#currLineIndent,
			meta: listTokens.meta,
			items: [listTokens.lexer],
			raw: listTokens.lexer.raw
		})
	}

	#runQuoteLexer() {
		const quoteTokenizer = new Quote(this.#lines, this.#cursor)
		const quoteTokens = quoteTokenizer.tokenize()
		this.#cursor = quoteTokens.cursor

		this.#lexerData.push({
			indent: this.#currLineIndent,
			...quoteTokens.lexer
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
				// and decrement the cursor
				this.#cursor--
			}
		}
	}

	#skipFrontMatter() {
		if (FrontMatter.test(this.#lines)) {
			this.#frontMatter = new FrontMatter(this.#lines)
			this.#lines = this.#frontMatter.removeFrontMatterFromGivenLines()
			this.#cursor = 0
		}
	}

	getFrontMatter() {
		if (FrontMatter.test(this.#lines)) {
			this.#frontMatter = new FrontMatter(this.#lines)
			return this.#frontMatter.getValue()
		} else {
			return {}
		}
	}
}

export default Lexer
