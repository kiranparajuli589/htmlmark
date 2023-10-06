import { TOKENS } from "../util/tokens.js"
import { Table } from "../tokenizer/table.js"
import { Image } from "../tokenizer/image.js"
import { Comment } from "../tokenizer/comment.js"
import { HrLine } from "../tokenizer/hrLine.js"
import { CodeBlock } from "../tokenizer/codeblock.js"
import { Quote } from "../tokenizer/quote.js"
import { Heading } from "../tokenizer/heading.js"
import { List } from "../tokenizer/list.js"
import { HTML } from "../tokenizer/html.js"
import { Esc } from "../util/esc.js"


export class Parser {
	#lexers
	#cursor
	#parsedContent
	#currentLexer
	#fromToken
	#codeHighlightFn

	constructor(lexers, from = null, codeHighlightFn = null) {
		this.#lexers = lexers
		this.#parsedContent = []
		this.#fromToken = from
		this.#codeHighlightFn = codeHighlightFn
	}

	static parseContent(token) {
		let parsed = ""
		token.tokens.forEach(token => {
			if (token.type === TOKENS.BOLD) {
				parsed += `<strong>${Parser.parseContent(token)}</strong>`
			} else if (token.type === TOKENS.ITALIC) {
				parsed += `<em>${Parser.parseContent(token)}</em>`
			} else if (token.type === TOKENS.CODE) {
				parsed += `<code>${Esc.everything(token.value)}</code>`
			}else if (token.type === TOKENS.STRIKE_THROUGH) {
				parsed += `<s>${Parser.parseContent(token)}</s>`
			} else if (token.type === TOKENS.LINK) {
				const linkTokens = token.tokens
				let linkTag = `<a href="${linkTokens.href}"` +
					(linkTokens.tooltip ? ` title="${linkTokens.tooltip}"` : "") +
					">" +
					Parser.parseContent(linkTokens.title) +
					"</a>"

				parsed += linkTag
			} else if (token.type === TOKENS.UNDERLINE) {
				parsed += `<u>${Parser.parseContent(token)}</u>`
			} else if (token.type === TOKENS.IMAGE) {
				const imgTokens = token.tokens
				let imgTag = `<img src="${imgTokens.href}"` +
					(imgTokens.alt !== undefined ? ` alt="${imgTokens.alt}"` : "") +
					(imgTokens.title !== undefined ? ` title="${imgTokens.title}"` : "") +
					(imgTokens.width !== undefined ? ` width="${imgTokens.width}"` : "") +
					(imgTokens.height !== undefined ? ` height="${imgTokens.height}"` : "") +
					">"
				parsed += imgTag
			} else if (token.type === TOKENS.HTML) {
				parsed += token.raw
			} else {
				const escaped = Esc.nonTags(token.value)
				const unescaped = Esc.unEscape(escaped)
				parsed += unescaped
			}
		})
		return parsed
	}

	#parseNewLine() {
		// TODO: maybe implement with configurable line breaks
		// this.#parsedContent.push((Newline.parse()))
	}
	#parseHrLine() {
		this.#parsedContent.push(HrLine.parse())
	}
	#parseCodeBlock() {
		this.#parsedContent.push(CodeBlock.parse(this.#currentLexer, this.#codeHighlightFn))
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
	#parseHTML() {
		this.#parsedContent.push(HTML.parse(this.#currentLexer))
	}
	#parseParagraph() {
		let parsed = Parser.parseContent(this.#currentLexer)
		if (this.#fromToken === TOKENS.LIST) {
			this.#parsedContent.push(`${parsed}
`)
		} else this.#parsedContent.push(`<p>${parsed}</p>
`)
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
		case TOKENS.HTML:
			this.#parseHTML()
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
