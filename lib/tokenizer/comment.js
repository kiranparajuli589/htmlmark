import { REGEX } from "../regex/index.js"
import { Utils } from "../util/utils.js"
import { TOKENS } from "../util/tokens.js"


export class Comment {
	static tokenName = TOKENS.COMMENT
	/**
	 * @returns {boolean}
	 */
	static test({ line }) {
		return Utils.testRegex(line, REGEX.COMMENT)
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
