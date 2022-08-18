import { REGEX } from "../../regex/index.js"


export class Commons {
	static testImage(text) {
		REGEX.IMAGE.lastIndex = 0
		return REGEX.IMAGE.test(text)
	}
	static testComment(text) {
		REGEX.COMMENT.lastIndex = 0
		return REGEX.COMMENT.test(text)
	}
	static testHrLine(text) {
		REGEX.HR_LINE.lastIndex = 0
		return REGEX.HR_LINE.test(text)
	}

	static testHeading(text) {
		REGEX.HEADING.lastIndex = 0
		return REGEX.HEADING.test(text)
	}

	static getIndent(text) {
		if (["", "\n", undefined].includes(text)) return 0
		let i = 0
		while (text[i] === " " || text[i] === "\t") {
			i++
		}
		return i
	}
	static tokenizeHeading(text) {
		REGEX.HEADING.lastIndex = 0
		const hMatch = REGEX.HEADING.exec(text.trim())
		if (hMatch) {
			return {
				level: hMatch.groups.level.length,
				value: hMatch.groups.value
			}
		}
		throw new Error(`Text: ${text} is not of type heading`)
	}
	/**
   * @param {string} text
   * @returns {object}
   * @throws {Error}
   */
	static tokenizeComment(text) {
		REGEX.COMMENT.lastIndex = 0
		const cMatch = REGEX.COMMENT.exec(text.trim())
		if (cMatch) {
			return cMatch.groups
		}
		throw new Error(`Text: ${text} is not of type comment`)
	}
	static tokenizeImage(text) {
		REGEX.IMAGE.lastIndex = 0
		const iMatch = REGEX.IMAGE.exec(text.trim())
		if (iMatch) {
			return iMatch.groups
		}
		throw new Error(`Text: ${text} is not of type image`)
	}
}
