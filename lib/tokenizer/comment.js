import { REGEX } from "../regex/index.js"
import { Utils } from "../util/utils.js"


export class Comment {
	/**
	 * @param {string} text
	 *
	 * @returns {boolean}
	 */
	static test(text) {
		return Utils.testRegex(text, REGEX.COMMENT)
	}
	/**
	 * @param {string} text
	 *
	 * @returns {RegExpExecArray}
	 */
	static match(text) {
		return Utils.execRegex(text.trim(), REGEX.COMMENT)
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
		return `<!-- ${lexer.value}-->
`
	}
}
