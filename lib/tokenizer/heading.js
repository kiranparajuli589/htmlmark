import REGEX from "../regex/index.js"
import { HrLine, Paragraph } from "./index.js"
import { TOKENS, Utils } from "../util/index.js"

/**
 * Heading Tokenizer
 */
class Heading {
	#line
	#nextLine
	#level
	#match
	#setext = false

	static tokenName = TOKENS.HEADING

	/**
	 * Checks if the given text matches the Heading regex
	 *
	 * @param {string} text
	 * @returns {boolean}
	 */
	static testRegex(text) {
		return Utils.testRegex(text, REGEX.HEADING.ITEM)
	}

	/**
	 * Checks if the given text is of Heading 1 underline type
	 *
	 * @param {string} text
	 * @returns {boolean}
	 */
	static testH1UnderlineRegex(text) {
		return Utils.testRegex(text, REGEX.HEADING.UNDERLINE_1)
	}

	/**
	 * Checks if the given text is of Heading 2 underline type
	 *
	 * @param {string} text
	 *
	 * @returns {boolean}
	 */
	static testH2UnderlineRegex(text) {
		return Utils.testRegex(text, REGEX.HEADING.UNDERLINE_2)
	}

	/**
	 * Returns the regex groups match for the Heading token
	 *
	 * Following groups are returned:
	 * 1. level - number of #s in the Heading
	 * 2. fenceVal - If fenced Heading, the value of the fenced Heading
	 * 3. val - the value of the normal Heading (without fence)
	 *
	 * @param {string} text
	 *
	 * @returns {RegExpExecArray}
	 */
	static match(text) {
		return Utils.execRegex(text, REGEX.HEADING.ITEM)
	}

	/**
	 * Checks if the given text is of Heading type
	 *
	 * @returns {boolean}
	 */
	static test({ line, nextLine }) {
		if (Heading.testRegex(line)) return true
		if (nextLine !== undefined && !HrLine.test({ line })) {
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
		this.#findType()
	}

	/**
	 * Checks if the Heading is of Setext or ATX type
	 *
	 * Sets the #setext property to true if it is of Underline type
	 * Sets the #level property to the level of the Heading
	 *
	 * @returns void
	 */
	#findType() {
		if (this.#nextLine !== undefined) {
			if (!Heading.testRegex(this.#line)) {
				if (Heading.testH1UnderlineRegex(this.#nextLine)) {
					this.#setext = true
					this.#level = 1
				}
				else if (Heading.testH2UnderlineRegex(this.#nextLine)) {
					this.#setext = true
					this.#level = 2
				}
			}
		}
		if (!this.#setext) {
			this.#match = Heading.match(this.#line)?.groups
			this.#match.value = this.#match.fenceVal || this.#match.val
			delete this.#match.fenceVal
			delete this.#match.val
		}
	}

	/**
	 * tokenizes the line for Heading token
	 *
	 * @returns {{level: number, value: string, raw: string, setext: boolean}}
	 */
	tokenize() {
		if (!this.#setext) {
			return {
				level: this.#match.level.length,
				value: this.#match.value.trimEnd(),
				raw: this.#line,
				setext: false
			}
		} else {
			return {
				level: this.#level,
				value: this.#line.trimEnd(),
				raw: `${this.#line}\n${this.#nextLine}`,
				setext: true
			}
		}
	}

	/**
	 * Runs the HTML parsing for the Heading token
	 *
	 * @param {Object} lexer the Heading lex
	 *
	 * @returns {string} the Heading HTML
	 */
	static parse(lexer) {
		return `<h${lexer.level}>${Paragraph.parse(lexer)}</h${lexer.level}>
`
	}
}

export default Heading
