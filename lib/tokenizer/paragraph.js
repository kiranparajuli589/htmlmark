import { TOKENS } from "../util/tokens.js"
import { REGEX } from "../regex/index.js"
import { Utils } from "../util/utils.js"
import { Esc } from "../util/esc.js"


export class Paragraph {
	/**
	 *
	 * @param {String} str
	 * @param {Number} cursor
	 * @param {string} character
	 *
	 * @returns {number}
	 */
	static #findConsecutive(str, cursor, character) {
		let consecutive = 0
		for (let i=cursor; i<str.length; i++) {
			if (str[i] === character) {
				consecutive++
			} else {
				break
			}
		}
		return consecutive
	}

	/**
	 *
	 * @param lineToParse
	 * @param cursor
	 * @param identifier
	 * @param onlyExact
	 * @returns {{start: Number, ident: string, end: Number, fence: boolean}}
	 */
	static #isFenced(lineToParse, cursor, identifier, onlyExact=false) {
		// start from cursor + length of identifier
		const start = cursor + identifier.length

		const sanity = Paragraph.#fenceSanity(lineToParse, start, identifier[0])
		if (!sanity) return { start: -1, ident: "", end: -1, fence: false }

		const afterStartStr = lineToParse.slice(start)



		// if exact identifier behind then do not go for further checks
		const exactRegex = new RegExp("(?<![\\\\" +
			`${identifier[0]}` +
			"])\\" +
			`${identifier[0]}` +
			`{${identifier.length}}` +
			"(?!\\" +
			`${identifier[0]}` +
			")")

		const exactEnd = afterStartStr.search(exactRegex)

		if (exactEnd !== -1) {
			return {
				fence: true,
				ident: identifier,
				start,
				end: start + exactEnd
			}
		}

		if (!onlyExact) {
			for (let i=start; i >= cursor; i--) {
				// check str
				const tempIdentifier = lineToParse.substring(cursor, i)

				// generates regex like: /(?<!\\)\*{2}/
				// where * is the identifier
				const regex = new RegExp(
					`(?<![\\\\${tempIdentifier[0]}])` +
					"\\" + tempIdentifier[0] +
					"{" + tempIdentifier.length + "}"
				)
				let end = afterStartStr.search(regex)
				if (end !== -1) {
					return {
						fence: true,
						ident: tempIdentifier,
						start,
						end: start + end
					}
				}
			}
		}

		return {
			fence: false,
			ident: "",
			start: -1,
			end: -1
		}
	}

	static #fenceSanity(str, start, identifierChar) {
		// if start is greater than the length of the line, return false
		if (start > str.length) return false

		// if no identifier beside the start, immediately return false
		const afterIdentifier = str.substring(start)
		return afterIdentifier.includes(identifierChar)
	}

	/**
	 *
	 * @param str
	 * @param cursor
	 * @param identifier
	 * @returns {{ident: string, start: number, end: number, fence: boolean}}
	 */
	static #isEvenFenced(str, cursor, identifier) {
		let start



		start = cursor + identifier.length

		const sanity = Paragraph.#fenceSanity(str, start, identifier[0])
		if (!sanity) return { start: -1, ident: "", end: -1, fence: false }

		const afterStartStr = str.slice(start)
		for (let i=start; i >= cursor; i--) {
			// check str
			const tempIdentifier = str.substring(cursor, i)
			if (tempIdentifier.length % 2 !== 0) {
				continue
			}

			// generates regex like: /(?<!\\)\*{2}/
			// where * is the identifier
			const regex = new RegExp(
				"(?<!\\\\)\\" + tempIdentifier[0] +
				"{" + tempIdentifier.length + "}"
			)
			let end = afterStartStr.search(regex)
			if (end !== -1) {
				return {
					fence: true,
					ident: tempIdentifier,
					start,
					end: start + end
				}
			}
		}

		return {
			fence: false,
			ident: "",
			start: -1,
			end: -1
		}
	}


	/**
	 * Link: title, href, tooltip
	 * - If match not found then falsy value is returned
	 * - Otherwise, groups and end are returned
	 *
	 * @param {String} lineToParse
	 * @param {Number} cursor
	 * @returns {{found: boolean, groups: null, end: number}|{found: boolean, groups: {[p: string]: string}, end: *}}
	 */
	static #findLink(lineToParse, cursor) {
		const check = lineToParse.substring(cursor)
		if (Utils.testRegex(check, REGEX.PARAGRAPH.LINK)) {
			const match = Utils.execRegex(check, REGEX.PARAGRAPH.LINK)
			return {
				found: true,
				groups: match.groups,
				end: cursor + match[0].length - 1
			}
		} return { found: false, groups: null, end: -1 }
	}

	static #findLinkRef(lineToParse, cursor) {
		const check = lineToParse.substring(cursor)
		let withText = false
		let match

		if (Utils.testRegex(check, REGEX.PARAGRAPH.REF_LINK)) {
			// check if link ref with text
			if (Utils.testRegex(check, REGEX.LINK_REF.WITH_TEXT)) {
				withText = true
				match = Utils.execRegex(check, REGEX.LINK_REF.WITH_TEXT)
			} else {
				match = Utils.execRegex(check, REGEX.LINK_REF.WITHOUT_TEXT)
			}

			return {
				found: true,
				withText,
				groups: match.groups,
				end: cursor + match[0].length - 1
			}
		} return { found: false, groups: null, end: -1 }
	}


	static #findImage(lineToParse, cursor) {
		const check = lineToParse.substring(cursor)
		if (Utils.testRegex(check, REGEX.PARAGRAPH.IMAGE)) {
			const match = Utils.execRegex(check, REGEX.PARAGRAPH.IMAGE)
			return {
				found: true,
				groups: match.groups,
				end: cursor + match[0].length - 1
			}
		} return { found: false, groups: null, end: -1 }
	}

	/**
	 * Tokenize emphasis using the identifiers
	 *
	 * 1. Bold: **|__ fence (even)
	 * 2. Italics: *|_ fence (odd)
	 * 3. Code: ` fence (exact)
	 * 4. Underline: ++ fence (even)
	 * 5. Strike: -- fence (even)
	 * 6. Links: [text](url "title")
	 * 					"title" is optional
	 * 7. Image: ![text](url "title" 50 50)
   * 					"title" 50 50 are optional
	 *
	 *
	 * @param {String} lineToParse
	 * @param {Array} linkRefs
	 *
	 * @returns {*[]}
	 */
	static #findEmphasis(lineToParse, linkRefs) {
		const tokens = []
		let identifier
		for (let cursor=0; cursor<lineToParse.length; cursor++) {
			const currChar = lineToParse[cursor]
			const prevChar = lineToParse[cursor-1] || null
			const nextChar = lineToParse[cursor+1] || null

			let escape = false

			if (prevChar && prevChar === "\\") {
				escape = true
			}

			if (!escape && (currChar === "*" || currChar === "_")) {
				// find consecutive * or _ and add to identifier
				const consecutive = Paragraph.#findConsecutive(lineToParse, cursor, currChar)
				identifier = currChar.repeat(consecutive)
				const { fence, ident, start, end } = Paragraph.#isFenced(lineToParse, cursor, identifier)


				if (fence) {

					if (start > cursor + ident.length) {

						// grab the text before the fence
						const text = lineToParse.substring(cursor, start-1)
						const lastToken = tokens[tokens.length - 1]
						if (lastToken && lastToken.type === TOKENS.TEXT) {
							lastToken.value += Esc.nonTags(text)
							lastToken.raw += text
						} else {
							tokens.push({
								type: TOKENS.TEXT,
								raw: text,
								value: Esc.nonTags(text)
							})
						}
					}

					const v = lineToParse.slice(start, end)
					tokens.push({
						type: (ident.length % 2 === 0)
							? TOKENS.BOLD
							: TOKENS.ITALIC,
						raw: `${ident}${v}${ident}`,
						tokens: Paragraph.#findEmphasis(v, linkRefs)
					})
					cursor = end + ident.length - 1
					continue
				}
			}
			else if (!escape && currChar === "`") {
				// find consecutive *
				const consecutive = Paragraph.#findConsecutive(lineToParse, cursor, "`")
				identifier = "`".repeat(consecutive)
				const { fence, ident, start, end } = Paragraph.#isFenced(lineToParse, cursor, identifier, true)
				if (fence) {
					const v = lineToParse.slice(start, end)
					if (v.length > 0) {
						tokens.push({
							type: TOKENS.CODE,
							raw: `${ident}${v}${ident}`,
							tokens: Paragraph.#findEmphasis(v, linkRefs)
						})
						cursor = end + ident.length - 1
						continue
					}
				}
			}
			else if (!escape && ["~", "+"].includes(currChar)) {
				if (nextChar && nextChar === currChar) {
					const consecutive = Paragraph.#findConsecutive(lineToParse, cursor, currChar)
					identifier = currChar.repeat(consecutive)
					const { fence, ident, start, end } = Paragraph.#isEvenFenced(lineToParse, cursor, identifier)
					if (fence) {
						// grab the text before the fence

						if (start > cursor + ident.length) {
							const text = lineToParse.substring(cursor, start-ident.length)
							const lastToken = tokens[tokens.length - 1]
							if (lastToken && lastToken.type === TOKENS.TEXT) {
								lastToken.value += Esc.nonTags(text)
								lastToken.raw += text
							} else {
								tokens.push({
									type: TOKENS.TEXT,
									raw: text,
									value: Esc.nonTags(text)
								})
							}
						}
						const v = lineToParse.slice(start, end)
						tokens.push({
							type: (currChar === "+") ? TOKENS.UNDERLINE: TOKENS.STRIKE_THROUGH,
							raw: `${ident}${v}${ident}`,
							tokens: Paragraph.#findEmphasis(v, linkRefs)
						})
						cursor = end + ident.length - 1
						continue
					}
				}
			}
			else if (!escape && currChar === "[") {
				// link parsing
				// check if the following text matches [text](url "title")
				const linkMatch = Paragraph.#findLink(lineToParse, cursor)
				if (linkMatch.found) {
					tokens.push({
						type: TOKENS.LINK,
						raw: lineToParse.slice(cursor, linkMatch.end + 1),
						tokens: {
							title: {
								raw: linkMatch.groups.text,
								tokens: Paragraph.#findEmphasis(linkMatch.groups.text, linkRefs)
							},
							href: linkMatch.groups.href,
							tooltip: linkMatch.groups.title
						}
					})
					cursor = linkMatch.end
					continue
				}

				// link reference parsing
				// check if the following text matches [text]
				if (linkRefs.length > 0) {
					const linkRefMatch = Paragraph.#findLinkRef(lineToParse, cursor)
					if (linkRefMatch.found) {

						// if the found reference is in the list of references, add it to the tokens
						const ref = linkRefs.find(r => r.text === linkRefMatch.groups.ref)

						if (ref) {
							const rawTitle = (linkRefMatch.withText) ? linkRefMatch.groups.text : ref.text

							tokens.push({
								type: TOKENS.LINK,
								raw: lineToParse.slice(cursor, linkRefMatch.end + 1),
								tokens: {
									title: {
										raw: rawTitle,
										tokens: Paragraph.#findEmphasis(rawTitle, linkRefs)
									},
									href: ref.href,
									tooltip: ref.title
								}
							})
							cursor = linkRefMatch.end
							continue
						}
					}
				}
			}
			else if (!escape && currChar === "!") {
				// image parsing
				// check if the following text matches ![text](url "title" 50 50)
				const imageMatch = Paragraph.#findImage(lineToParse, cursor)
				if (imageMatch.found) {
					tokens.push({
						type: TOKENS.IMAGE,
						raw: lineToParse.slice(cursor, imageMatch.end + 1),
						tokens: imageMatch.groups
					})
					cursor = imageMatch.end
					continue
				}
			}

			const lastToken = tokens[tokens.length - 1]
			if (lastToken && lastToken.type === TOKENS.TEXT) {
				lastToken.value += currChar
				lastToken.raw += currChar

				// if escaped char is found, unescape it
				if (Utils.testRegex(lastToken.value, REGEX.ESCAPED)) {
					lastToken.value = lastToken.value.replaceAll(REGEX.ESCAPED, "$1")
				}

			} else {
				tokens.push({
					type: TOKENS.TEXT,
					raw: currChar,
					value: currChar
				})
			}

		}
		return tokens
	}

	/**
	 *
	 * @param {String} lineToParse
	 * @param {Array} linkRefs
	 * @returns {*[]}
	 */
	static tokenize(lineToParse, linkRefs) {
		return Paragraph.#findEmphasis(lineToParse, linkRefs)
	}
}
