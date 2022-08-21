import { REGEX } from "../regex/index.js"
import { Parser } from "../parser/index.js"


export class Heading {
	#line
	#nextLine
	#level
	#match
	#uType = false


	static testRegex(text) {
		REGEX.HEADING.ITEM.lastIndex = 0
		return REGEX.HEADING.ITEM.test(text)
	}

	static testH1UnderlineRegex(text) {
		REGEX.HEADING.EQUAL_TO_LINE.lastIndex = 0
		return REGEX.HEADING.EQUAL_TO_LINE.test(text)
	}

	static testH2UnderlineRegex(text) {
		REGEX.HEADING.UNDERLINE.lastIndex = 0
		return REGEX.HEADING.UNDERLINE.test(text)
	}

	/**
	 * @param {string} text
	 *
	 * @returns {RegExpExecArray}
	 */
	static match(text) {
		REGEX.HEADING.ITEM.lastIndex = 0
		return REGEX.HEADING.ITEM.exec(text)
	}

	/**
	 * @param {string} text
	 *
	 * @param {string|undefined} nextLine
	 * @returns {boolean}
	 */
	static test(text, nextLine) {
		if (Heading.testRegex(text)) return true
		if (nextLine !== undefined) {
			if (
				Heading.testH1UnderlineRegex(nextLine) ||
				Heading.testH2UnderlineRegex(nextLine)
			) {
				return true
			}
		}
	}

	/**
	 * Heading Tokenizer Constructor
	 *
	 * @param {string} line current line to tokenize
	 * @param {string| undefined} nextLine next line for tokenization
	 *
	 * @returns {Heading}
	 */
	constructor(line, nextLine) {
		this.#line = line
		this.#nextLine = nextLine
		this.setUType()
	}

	/**
	 * Checks if the Heading is of Underline type
	 */
	setUType() {
		if (this.#nextLine !== undefined) {
			if (!Heading.testRegex(this.#line)) {
				if (Heading.testH1UnderlineRegex(this.#nextLine)) {
					this.#uType = true
					this.#level = 1
				}
				else if (Heading.testH2UnderlineRegex(this.#nextLine)) {
					this.#uType = true
					this.#level = 2
				}
			}
		}
		if (!this.#uType) {
			this.#match = Heading.match(this.#line)?.groups
		}
	}

	/**
	 * tokenizes the line for Heading token
	 *
	 * @returns {{level: number, value: string, raw: string, uType: boolean}}
	 */
	tokenize() {
		if (!this.#uType) {
			return {
				level: this.#match.level.length,
				value: this.#match.value.trimEnd(),
				raw: this.#line,
				uType: false
			}
		} else {
			return {
				level: this.#level,
				value: this.#line.trimEnd(),
				raw: `${this.#line}\n${this.#nextLine}`,
				uType: true
			}
		}
	}

	/**
	 * returns HTML for a Heading token
	 *
	 * @param {Object} lexer Heading lex
	 *
	 * @returns {string}
	 */
	static parse(lexer) {
		return `<h${lexer.level}>${Parser.parseContent(lexer)}</h${lexer.level}>
`
	}
}
