import { REGEX } from "../regex/index.js"


export class Comment {
	/**
	 * @param {string} text
	 *
	 * @returns {boolean}
	 */
	static test(text) {
		REGEX.COMMENT.lastIndex = 0
		return REGEX.COMMENT.test(text)
	}
	/**
	 * @param {string} text
	 *
	 * @returns {RegExpExecArray}
	 */
	static match(text) {
		REGEX.COMMENT.lastIndex = 0
		return REGEX.COMMENT.exec(text.trim())
	}

	/**
	 * @param {string} text
	 *
	 * @returns {{[p: string]: string}}
	 */
	static tokenize(text) {
		return Comment.match(text).groups
	}

	/**
	 * returns HTML for comment
	 *
	 * @param {{value: string}} lexer
	 *
	 * @returns {string}
	 */
	static parse(lexer) {
		return `
<!-- ${lexer.value}-->`
	}
}
