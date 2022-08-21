import { TOKENS } from "../util/tokens.js"
import { REGEX } from "../regex/index.js"
import { Table } from "../tokenizer/table.js"
import { Image } from "../tokenizer/image.js"
import { Comment } from "../tokenizer/comment.js"
import { HR } from "../tokenizer/hr.js"
import { CodeBlock } from "../tokenizer/codeblock.js"
import { Quote } from "../tokenizer/quote.js"
import { Heading } from "../tokenizer/heading.js"
import { List } from "../tokenizer/list.js"
import { Newline } from "../tokenizer/newline.js"


export class Parser {
	#lexers
	#cursor
	#parsedContent
	#currentLexer

	constructor(lexers) {
		this.#lexers = lexers
		this.#parsedContent = []
	}

	static escape(str) {
		return str.replaceAll(">", "&gt;")
			.replaceAll("<", "&lt;")
			.replaceAll("\"", "&quot;")
			.replaceAll("'", "&#39;")
	}

	static parseContent(token) {
		return token.value.replace(REGEX.PARAGRAPH.BOLD, "<strong>$1</strong>")
			.replace(REGEX.PARAGRAPH.ITALIC,"<em>$1</em>")
			.replace(REGEX.PARAGRAPH.CODE, (match, value) => {
				return `<code>${
					Parser.escape(value)
				}</code>`
			})
			.replace(REGEX.PARAGRAPH.STRIKE, "<s>$1</s>")
			.replace(REGEX.PARAGRAPH.UNDERLINE, "<u>$1</u>")
			.replace(REGEX.PARAGRAPH.LINK, "<a href='$2'>$1</a>")
	}

	#parseNewLine() {
		this.#parsedContent.push((Newline.parse()))
	}
	#parseHrLine() {
		this.#parsedContent.push(HR.parse())
	}
	#parseCodeBlock() {
		this.#parsedContent.push(CodeBlock.parse(this.#currentLexer))
	}
	#parseQuote() {
		this.#parsedContent.push(Quote.parse(this.#currentLexer))
	}
	#parseHeading() {
		this.#parsedContent.push(Heading.parse(this.#currentLexer))
	}
	#parseList() {
		this.#parsedContent.push(List.parse(this.#currentLexer))
	}
	#parseComment() {
		this.#parsedContent.push(Comment.parse(this.#currentLexer))
	}
	#parseImage() {
		this.#parsedContent.push(Image.parse(this.#currentLexer))
	}
	#parseTable() {
		this.#parsedContent.push(Table.parse(this.#currentLexer))
	}
	#parseParagraph() {
		this.#parsedContent.push(`<p>${Parser.parseContent(this.#currentLexer)}</p>`)
	}
	#parseCurrentLexer() {
		switch (this.#currentLexer.type) {
		case TOKENS.NEW_LINE:
			this.#parseNewLine()
			break
		case TOKENS.HR_LINE:
			this.#parseHrLine()
			break
		case TOKENS.CODE_BLOCK:
			this.#parseCodeBlock()
			break
		case TOKENS.QUOTE:
			this.#parseQuote()
			break
		case TOKENS.HEADING:
			this.#parseHeading()
			break
		case TOKENS.LIST:
			this.#parseList()
			break
		case TOKENS.COMMENT:
			this.#parseComment()
			break
		case TOKENS.IMAGE:
			this.#parseImage()
			break
		case TOKENS.TABLE:
			this.#parseTable()
			break
		case TOKENS.PARAGRAPH:
			this.#parseParagraph()
			break
		}
	}
	run() {
		for (this.#cursor=0; this.#cursor<this.#lexers.length; this.#cursor++) {
			this.#currentLexer = this.#lexers[this.#cursor]
			this.#parseCurrentLexer()
		}

		// remove any %s leftovers and return
		return this.#parsedContent
			.map(item => item.replaceAll("%s", ""))
			.join("")
	}
}
