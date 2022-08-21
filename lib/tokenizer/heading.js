import { REGEX } from "../regex/index.js"
import { Parser } from "../parser/index.js"


export class Heading {
	#line
	#nextLine
	#level
	#uType = false
	#match


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

	static testRegex(text) {
		REGEX.HEADING.lastIndex = 0
		return REGEX.HEADING.test(text)
	}

	static testH1UnderlineRegex(text) {
		REGEX.HEADING1_UNDERLINE.lastIndex = 0
		return REGEX.HEADING1_UNDERLINE.test(text)
	}

	static testH2UnderlineRegex(text) {
		REGEX.HEADING2_UNDERLINE.lastIndex = 0
		return REGEX.HEADING2_UNDERLINE.test(text)
	}

	/**
	 * @param {string} text
	 *
	 * @returns {RegExpExecArray}
	 */
	static match(text) {
		REGEX.HEADING.lastIndex = 0
		return REGEX.HEADING.exec(text)
	}

	constructor(line, nextLine) {
		this.#line = line
		this.#nextLine = nextLine
		this.setUType()
	}

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

	static parse(lexer) {
		return `<h${lexer.level}>${Parser.parseContent(lexer)}</h${lexer.level}>
`
	}
}
