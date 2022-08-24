import { REGEX } from "../regex/index.js"
import { Utils } from "../util/utils.js"
import { Esc } from "../util/esc.js"


export class Image {
	/**
	 * @param {string} text
	 *
	 * @returns {boolean}
	 */
	static test(text) {
		return Utils.testRegex(text, REGEX.IMAGE)
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
		const matches = Image.match(text).groups
		return {
			...matches,
			alt: Esc.nonTags(matches.alt)
		}
	}

	/**
	 * returns HTML for image
	 * @param {{url: string, alt: string}} lexer
	 * @returns {string}
	 */
	static parse(lexer) {
		return `<img src='${lexer.url}' alt='${lexer.alt}'>`
	}
}
