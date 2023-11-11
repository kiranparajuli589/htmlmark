/**
 * Utilities Store for the Parser
 */
class Utils {
	/**
	 * Checks if the given text matches the given regex
	 *
	 * @param {string} text
	 * @param {RegExp} regex
	 *
	 * @returns {boolean}
	 */
	static testRegex(text, regex) {
		regex.lastIndex = 0
		return !!regex.test(text)
	}

	/**
	 * Returns the regex matches for the given text
	 *
	 * @param {string} text
	 * @param {RegExp} regex
	 * @returns {RegExpExecArray}
	 */
	static execRegex(text, regex) {
		regex.lastIndex = 0
		return regex.exec(text)
	}

	/**
	 * Match the given text against the given regex
	 *
	 * @param {string} text
	 * @param {RegExp} regex
	 *
	 * @returns {*[]}
	 */
	static matchRegex(text, regex) {
		let m
		const matches = []

		while ((m = regex.exec(text)) !== null) {
			if (m.index === regex.lastIndex) {
				regex.lastIndex++
			}

			const rGroups = Object.keys(m.groups)

			m.forEach((match, groupIndex) => {
				if (match && groupIndex !== 0) {
					matches.push({
						type: rGroups[groupIndex - 1],
						value: match
					})
				}
			})
		}
		return matches
	}

	/**
	 * Groups the given array of objects by the given key
	 *
	 * @param {Object[]} array - Array of objects to group
	 * @param {string} key - Key to group by
	 *
	 * @returns {Object[]} - Grouped array of objects
	 */
	static groupBy(array, key) {
		const grouped = []
		array.forEach((item, index) => {
			if (index === 0) {
				grouped.push(item)
			} else {
				const last = grouped[grouped.length - 1]
				if (last[key] === item[key]) {
					last.value += item.value
				} else {
					grouped.push(item)
				}
			}
		})
		return grouped
	}

	/**
	 *
	 * @param {string} text
	 * @param {RegExp} regex
	 * @returns {{type: string, value: string}[]}
	 */
	static matchRG(text, regex) {
		const matches = Utils.matchRegex(text, regex)

		return Utils.groupBy(matches, "type")
	}

	/**
	 * Returns the index of the nth occurrence of the given character in the given text
	 * If the nth occurrence is not found, -1 is returned
	 *
	 * @param {string} text - Text to search in
	 * @param {number} position - Position of the nth occurrence
	 * @param {string} delimiter - Character to search for
	 *
	 * @returns {number}
	 */
	static getNthIndex(text, position, delimiter = ">") {
		let count = 0
		for (let i = 0; i < text.length; i++) {
			if (text[i] === delimiter) {
				count++
				if (count === position) {
					return i
				}
			}
		}
		return -1
	}
	/**
	 * Finds number of consecutive characters in a string from a given index
	 *
	 * @param {String} str - String to search
	 * @param {Number} cursor - Index to start from
	 * @param {string} char - Character to search for
	 *
	 * @returns {String}
	 */
	static findConsecutive(str, cursor, char) {
		let consecutive = 0
		for (let i=cursor; i<str.length; i++) {
			if (str[i] === char) {
				consecutive++
			} else {
				break
			}
		}
		return char.repeat(consecutive)
	}
	/**
	 * Checks if the provided string contains an exact match for the provided identifier
	 *
	 * Generates regex like: /(?<![\\*])\*{2}(?!\*)/ for "**" as identifier
	 *
	 * Returns the index of the found identifier, or -1 if not found
	 *
	 * @param {String} str
	 * @param {String} identifier
	 *
	 * @returns {Number}
	 */
	static isExactMatch(str, identifier) {
		const count = identifier.length
		const iChar = identifier[0]

		const exactRegex = new RegExp("(?<![\\\\" +
			`${iChar}` +
			"])\\" +
			`${iChar}` +
			`{${count}}` +
			"(?!\\" +
			`${iChar}` +
			")")

		return str.search(exactRegex)
	}

	/**
	 * Checks if the provided string contains an loose match for the provided identifier
	 *
	 * Generates regex like: /(?<!\\)\*{2}/ where * is the identifier
	 *
	 * Returns the index of the found identifier, or -1 if not found
	 *
	 * @param {String} str
	 * @param {String} identifier
	 *
	 * @returns {Number}
	 */
	static isLooseMatch(str, identifier) {
		const iChar = identifier[0]
		const count = identifier.length

		const regex = new RegExp(
			`(?<![\\\\${iChar}])` +
			`\\${iChar}` +
			`{${count}}`
		)
		return str.search(regex)
	}
}


export default Utils
