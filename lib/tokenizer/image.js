import { REGEX } from "../regex/index.js"


export class Image {
	/**
	 * @param {string} text
	 *
	 * @returns {boolean}
	 */
	static test(text) {
		REGEX.IMAGE.lastIndex = 0
		return REGEX.IMAGE.test(text)
	}

	/**
	 * @param {string} text
	 *
	 * @returns {RegExpExecArray}
	 */
	static match(text) {
		REGEX.IMAGE.lastIndex = 0
		return REGEX.IMAGE.exec(text.trim())
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
		return `<img src='${lexer.url}' alt='${lexer.alt}'>`
	}
}
