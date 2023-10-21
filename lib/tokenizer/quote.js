import { Lexer } from "../lexer/index.js"
import { REGEX } from "../regex/index.js"
import { Parser } from "../parser/index.js"
import { Newline } from "./newline.js"
import { TOKENS } from "../util/tokens.js"
import { Utils } from "../util/utils.js"


export class Quote {
	static tokenName = TOKENS.QUOTE
	#lines
	#start
	#cursor
	#body = []
	#tBody = []
	#cDepth
	// these items should break the quote
	#breakTokens = [
		// TODO: for heading, we may have to
		//  check for underlined headings too
		REGEX.HEADING.ITEM,
		REGEX.LIST.ITEM,
		REGEX.CODE_BLOCK
	]

	/**
	 * Checks if the given text matches the Quote regex
	 * REGEX: /^\s*(?:>\s*)+(?<value>.+)/g
	 *
	 * @returns {boolean}
	 */
	static test({ line }) {
		return Utils.testRegex(line, REGEX.QUOTE.ITEM)
	}

	/**
	 * Checks if the given text matches the Empty Quote regex
	 * REGEX: /^\s*[>\s]+$/g
	 *
	 * @param {string} text
	 *
	 * @returns {boolean}
	 */
	static testEmpty(text) {
		return Utils.testRegex(text, REGEX.QUOTE.EMPTY)
	}

	/**
	 * Returns the depth of the quote
	 *
	 * If the text does not start with > i.e. the lazy items, then 0 is returned
	 * Otherwise, the count of > before the first non > character is returned
	 *
	 * @param {string} text
	 *
	 * @returns {number}
	 */
	static getDepth(text) {
		text = text.trimStart()
		if (text[0] !== ">") return 0
		if (Quote.testEmpty(text.trim())) return text.match(/>/g).length
		const firstNonQuote = text.search(/[^>\s\t]/)
		const quotePart = text.substring(0, firstNonQuote)
		return quotePart.match(/>/g).length
	}

	/**
	 * Returns the value of the quote from the provided depth
	 *
	 * @param {string} text - the text to be parsed
	 * @param depth - the depth of the quote
	 *
	 * @returns {string}
	 */
	static getValue(text, depth) {
		text = text.trimStart()
		const cursor = Utils.getNthIndex(text, depth)
		// +1 for the ">" character
		return text.substring(cursor + 1)
	}

	constructor(lines, cursor) {
		this.#lines = lines
		this.#cursor = cursor
		this.#start = cursor
	}

	#findLazyEnd() {
		this.#cursor--

		let nextLine
		// check for laziness
		let endLazy = false
		do {
			nextLine = this.#lines[++this.#cursor]
			if (nextLine !== undefined) {
				if (Newline.test({ line: nextLine })) {
					endLazy = true
				}
				for (let r=0; r<this.#breakTokens.length; r++) {
					if (Utils.testRegex(nextLine, this.#breakTokens[r])) {
						endLazy = true
						break
					}
				}
			}
		} while (nextLine !== undefined && !endLazy)


		this.#cursor--
	}

	/**
	 * Finds the end of the quote
	 *
	 * Runs check for laziness and breaks
	 */
	#findEnd() {
		let nextLine = this.#lines[this.#cursor]
		let nextLineMatch

		do {
			nextLine = this.#lines[++this.#cursor]
			if (nextLine !== undefined) {
				nextLineMatch = nextLine.trim().startsWith(">")
			} else nextLineMatch = false
		} while (
			nextLineMatch
			// nextLineIndent === indent
		)

		// here we have formal end of the quote
		// keeping beside the laziness
		// if the last item of the quote is a quote separator
		// then no laziness is allowed
		const lastLineOfQuote = this.#lines[this.#cursor - 1]
		if (Quote.testEmpty(lastLineOfQuote)) {
			this.#cursor--
			return
		}

		this.#findLazyEnd()
	}

	/**
	 * Calculates the common depth for the Quote
	 */
	#calcCommonDepth() {
		this.#body.forEach((item) => {
			const currDepth = Quote.getDepth(item)
			if (this.#cDepth === undefined) {
				this.#cDepth = currDepth
			} else if (currDepth !== 0) { // bypass lazy items
				this.#cDepth = Math.min(this.#cDepth, currDepth)
			}
		})
	}


	/**
	 * Sets the body of the quote
	 */
	#setBody() {
		this.#body = this.#lines.slice(this.#start, this.#cursor + 1)
	}

	/**
	 * Trims the quote from the body
	 * Every common depth quote part is stripped
	 */
	#trimBody() {
		this.#body.forEach((item) => {
			if (Quote.test({ line: item }) || Quote.testEmpty(item)) {
				this.#tBody.push(Quote.getValue(item, this.#cDepth).trimEnd())
			} else {
				// the lazy items can be non-quote so no need to get quote value
				this.#tBody.push(item.trimEnd())
			}
		})
	}

	/**
	 * Tokenizes the lines for the Quote token
	 *
	 * @returns {{cursor: number, depth: *, raw: *, tokens}}
	 */
	tokenize() {
		this.#findEnd()

		this.#setBody()

		this.#calcCommonDepth()

		this.#trimBody()

		const lex = new Lexer(this.#tBody, TOKENS.QUOTE)

		return {
			tokens: lex.run(),
			depth: this.#cDepth,
			cursor: this.#cursor,
			raw: this.#body.join("\n")
		}
	}

	/**
	 * Wraps the body of the quote inside the Quote HTML tag
	 *
	 * @param {number} depth - the depth of the quote
	 * @param {string} content - the body of the quote
	 *
	 * @returns {string} - the HTML quote
	 */
	static #wrapInside(depth, content) {
		let qHtml = "%s"
		for (let j=0; j<depth; j++) {
			qHtml = qHtml.replace("%s", `<blockquote>
%s</blockquote>
`)
		}
		return qHtml.replace("%s", `${content}
`)
	}

	/**
	 * Runs the HTML parsing for the Quote token
	 *
	 * @param {Object} lexer - the Quote lex
	 *
	 * @returns {string} - the HTML quote
	 */
	static parse(lexer) {
		const qParts = []
		lexer.tokens.forEach(qTokens => {
			let babyParser
			babyParser = new Parser([qTokens])
			qParts.push(babyParser.run())
		})
		return Quote.#wrapInside(
			lexer.depth,
			qParts.join("")
		)
	}
}
