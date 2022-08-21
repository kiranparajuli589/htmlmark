/**
 * checks if number is in the given range
 * @param {number} a
 * @param {number} b
 * @returns {boolean}
 */
Number.prototype.inRange = function (a, b) {
	return this >= a && this <= b
}


/**
 * Markdown Indentation
 */
export class Indent {
	/**
	 * returns the indentation count of the given text
	 *
	 * @param {string} text
	 *
	 * @returns {number}
	 */
	static raw(text) {
		if (["", "\n", undefined].includes(text)) return 0
		let count = 0
		while (text[count] === " " || text[count] === "\t") {
			count++
		}
		return count
	}

	/**
	 * calculates the indentation of the given value
	 *
	 * @param {number} rawIndent
	 *
	 * @returns {number}
	 */
	static calc(rawIndent) {
		return Math.floor(rawIndent / 4) * 4
	}

	/**
	 * returns the calculated indentation of the given text
	 *
	 * @param {string} text
	 *
	 * @returns {number}
	 */
	static get(text) {
		return this.calc(this.raw(text))
	}

	/**
	 * returns if in the range of the given indentation
	 *
	 * @param {number} test the indentation to test
	 * @param {number} indent the indentation to test against
	 *
	 * @returns {boolean}
	 */
	static inRange(test, indent) {
		return test.inRange(
			(indent-4 < 0) ? 0 : indent-4,
			indent+4
		)
	}
}