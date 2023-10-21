import { REGEX } from "../regex/index.js"
import { Utils } from "../util/utils.js"
import { Esc } from "../util/esc.js"
import { TOKENS } from "../util/tokens.js"


export class Image {
	static tokenName = TOKENS.IMAGE

	/**
	 * @returns {boolean}
	 */
	static test({ line }) {
		return Utils.testRegex(line, REGEX.IMAGE)
	}

	/**
	 * @param {string} text
	 *
	 * @returns {RegExpExecArray}
	 */
	static match(text) {
		return Utils.execRegex(text.trim(), REGEX.IMAGE)
	}

	/**
	 * @param {string} text
	 *
	 * @returns {{[p: string]: string}}
	 */
	static tokenize(text) {
		return Image.match(text).groups
	}

	/**
	 * returns HTML for image
	 * @param {{url: string, alt: string}} lexer
	 * @returns {string}
	 */
	static parse(lexer) {
		return `<img src='${lexer.url}' alt='${Esc.nonTags(lexer.alt)}'>`
	}
}
