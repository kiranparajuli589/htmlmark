import { REGEX } from "../regex/index.js"
import { Parser } from "../parser/index.js"


export class Heading {
	/**
	 * @param {string} text
	 *
	 * @returns {boolean}
	 */
	static test(text) {
		REGEX.HEADING.lastIndex = 0
		return REGEX.HEADING.test(text)
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

	/**
	 * @param {string} text
	 *
	 * @returns {{level: number, value: string}}
	 */
	static tokenize(text) {
		const hMatch = Heading.match(text)
		return {
			level: hMatch.groups.level.length,
			value: hMatch.groups.value
		}
	}

	static parse(lexer) {
		return `
<h${lexer.level}>${Parser.parseContent(lexer)}</h${lexer.level}>`
	}
}
