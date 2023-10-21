import { REGEX } from "../regex/index.js"
import { Utils } from "../util/utils.js"
import { TOKENS } from "../util/tokens.js"

/**
 * HTML code
 */
export class HTML {
	#linkRefs
	#lines
	#cursor
	#indent
	#lex

	static tokenName = TOKENS.HTML

	constructor(lines, cursor, indent, linkRefs) {
		this.#lines = lines
		this.#cursor = cursor
		this.#indent = indent
		this.#linkRefs = linkRefs
		this.#lex = []
	}

	/**
	 * @param {string} text
	 *
	 * @returns {boolean}
	 */
	static test(text) {
		return Utils.testRegex(text, REGEX.PARAGRAPH.HTML)
	}

	static testBlock({ lines, cursor }) {
		const lineToParse = lines[cursor]
		return Utils.testRegex(lineToParse, REGEX.HTML)
	}

	tokenize() {
		const regexMatch = Utils.execRegex(this.#lines[this.#cursor], REGEX.HTML)
		this.#lex = {
			type: TOKENS.HTML,
			indent: this.#indent,
			...regexMatch.groups,
			raw: this.#lines[this.#cursor]
		}
		return { lexer: this.#lex, cursor: this.#cursor }
	}

	/**
	 * returns HTML
	 *
	 * @returns {string}
	 */
	static parse(lexer) {
		// if (lexer.tag.toLowerCase() === "a") {
		// 	return `<p>${lexer.raw}</p>`
		// }
		return lexer.raw
	}
}
