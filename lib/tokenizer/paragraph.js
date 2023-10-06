import { TOKENS } from "../util/tokens.js"
import { REGEX } from "../regex/index.js"
import { Utils } from "../util/utils.js"
import { Esc } from "../util/esc.js"


export class Paragraph {
	static tokenName = TOKENS.PARAGRAPH
	/**
	 * Returns a fence object
	 *
	 * @param {Boolean} fence - true if fence, false otherwise
	 * @param {String} ident - identifier, defaults to ""
	 * @param {Number} start - start index, defaults to -1
	 * @param {Number} end - end index, defaults to -1
	 *
	 * @returns {{ident: string, start: number, end: number, fence: boolean}}
	 */
	static fenceObj(fence = false, ident = "", start = -1, end = -1) {
		return {
			fence, ident, start, end
		}
	}

	/**
	 * Determines if the identifier can have a complete fence
	 *
	 * Checks:
	 * 1. If start is greater than the length of the string
	 * 2. If string after start contains the identifier character
	 *
	 * @param str
	 * @param start
	 * @param identifierChar
	 * @returns {boolean}
	 */
	static #fenceSanity(str, start, identifierChar) {
		// if start is greater than the length of the line, immediately return false
		if (start > str.length) return false

		// if no identifier beside the start, immediately return false
		const afterIdentifier = str.substring(start)
		return afterIdentifier.includes(identifierChar)
	}

	/**
	 * Determines if the provided string is fenced from the cursor position
	 *
	 * @param {String} lineToParse - line to parse
	 * @param {Number} cursor - starting position
	 * @param {String} identifier - fence identifier
	 * @param {Boolean} onlyExact - only exact match
	 * @param {Boolean} evenFence - even fence
	 *
	 * @returns {{start: Number, ident: string, end: Number, fence: boolean}}
	 */
	static #isFenced(lineToParse, cursor, identifier, onlyExact=false, evenFence = false) {
		// start from cursor + length of identifier
		const start = cursor + identifier.length

		const sanity = Paragraph.#fenceSanity(lineToParse, start, identifier[0])
		if (!sanity) return Paragraph.fenceObj()

		const afterStartStr = lineToParse.slice(start)

		if ((evenFence && identifier.length % 2 === 0)||!evenFence) {
			// if exact identifier behind then do not go for further checks
			const exactEnd = Utils.isExactMatch(afterStartStr, identifier)

			if (exactEnd !== -1) {
				return this.fenceObj(true, identifier, start, start + exactEnd)
			}
		}

		if (!onlyExact) {
			for (let i=start; i >= cursor; i--) {


				const tempIdentifier = lineToParse.substring(cursor, i)

				if (evenFence) {
					if (tempIdentifier.length % 2 !== 0) {
						continue
					}
				}

				const end = Utils.isLooseMatch(afterStartStr, tempIdentifier)

				if (end !== -1) {
					return Paragraph.fenceObj(true, tempIdentifier, start, start + end)
				}
			}
		}

		return Paragraph.fenceObj()
	}


	/**
	 * Link: title, href, tooltip
	 *
	 * If match not found then falsy value is returned
	 * Otherwise, groups and end are returned
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

	static #findHtml(lineToParse, cursor) {
		const check = lineToParse.substring(cursor)
		if (Utils.testRegex(check, REGEX.PARAGRAPH.HTML)) {
			const match = Utils.execRegex(check, REGEX.PARAGRAPH.HTML)
			return {
				found: true,
				groups: match.groups,
				end: cursor + match[0].length - 1
			}
		} return { found: false, groups: null, end: -1 }
	}

	/**
	 * Finds link reference in the provided line
	 *
	 * If match not found then falsy value is returned
	 * Otherwise, groups, withText (bool) and end are returned
	 *
	 * @param {String} lineToParse
	 * @param {Number} cursor
	 * @returns {{found: boolean, groups: null, end: number}|{found: boolean, groups: {[p: string]: string}, end: number, withText: boolean}}
	 */
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


	/**
	 * Finds image in the provided line
	 *
	 * If match not found then falsy value is returned
	 * Otherwise, groups and end are returned
	 *
	 * @param {String} lineToParse
	 * @param {Number} cursor
	 *
	 * @returns {{found: boolean, groups: {[p: string]: string}, end: number}|{found: boolean, groups: null, end: number}}
	 */
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
		let identifier
		const tokens = []

		function runCheckForTextBeforeStart(start, cursor, ident) {
			const lastToken = tokens[tokens.length - 1]
			if (start > cursor + ident.length) {
				const text = lineToParse.substring(cursor, start - ident.length)
				if (lastToken && lastToken.type === TOKENS.TEXT) {
					lastToken.raw += text
					lastToken.value += text
				} else {
					tokens.push({
						type: TOKENS.TEXT,
						raw: text,
						value: text
					})
				}
			}
		}

		for (let cursor=0; cursor<lineToParse.length; cursor++) {
			const currChar = lineToParse[cursor]
			const prevChar = lineToParse[cursor-1] || null
			const nextChar = lineToParse[cursor+1] || null
			const lastToken = tokens[tokens.length - 1]

			let escape = false

			if (prevChar && prevChar === "\\") escape = true

			if (!escape && (currChar === "*" || currChar === "_")) {
				identifier = Utils.findConsecutive(lineToParse, cursor, currChar)

				const { fence, ident, start, end } = Paragraph.#isFenced(lineToParse, cursor, identifier)

				if (fence) {
					// grab the text before the fence
					runCheckForTextBeforeStart(start, cursor, ident)

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
				identifier = Utils.findConsecutive(lineToParse, cursor, "`")

				const { fence, ident, start, end } = Paragraph.#isFenced(lineToParse, cursor, identifier, true)

				if (fence) {
					const value = lineToParse.slice(start, end)
					if (value.length > 0) {
						tokens.push({
							type: TOKENS.CODE,
							raw: `${ident}${value}${ident}`,
							// TIP: no need to waste time escaping it again
							// because, the code token value is already escaped here
							value: value.trim()
						})
						cursor = end + ident.length - 1
						continue
					}
				}
			}
			else if (!escape && ["~", "+"].includes(currChar)) {
				// underline and strike
				if (nextChar && nextChar === currChar) {
					identifier = Utils.findConsecutive(lineToParse, cursor, currChar)

					const { fence, ident, start, end } = Paragraph.#isFenced(lineToParse, cursor, identifier, false, true)

					if (fence) {
						runCheckForTextBeforeStart(start, cursor, ident)

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
				// link
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

				// link reference
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
				// TODO: image reference
			}
			else if (!escape && currChar === "<") {
				const htmlMatch = Paragraph.#findHtml(lineToParse, cursor)
				if (htmlMatch.found) {
					tokens.push({
						type: TOKENS.HTML,
						raw: lineToParse.slice(cursor, htmlMatch.end + 1),
						tokens: {
							tag: htmlMatch.groups?.tag || htmlMatch.groups?.endTag,
							attributes: htmlMatch.groups.attrs?.trim(),
							isEndTag: !! htmlMatch.groups?.endTag
						}
					})
					cursor = htmlMatch.end
					continue
				}
			}

			// otherwise a normal text
			if (lastToken && lastToken.type === TOKENS.TEXT) {
				lastToken.raw += currChar
				lastToken.value += currChar
			} else {
				// a normal text
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
	 * Paragraph Tokenization
	 * Tokenizes a line of text into emphasis tokens
	 *
	 * @param {String} lineToParse
	 * @param {Array} linkRefs
	 *
	 * @returns {*[]}
	 */
	static tokenize(lineToParse, linkRefs) {
		return Paragraph.#findEmphasis(lineToParse, linkRefs)
	}

	static parse(lexer, fromToken = "") {
		let parsed = ""
		lexer.tokens.forEach(token => {
			if (token.type === TOKENS.BOLD) {
				parsed += `<strong>${Paragraph.parse(token)}</strong>`
			} else if (token.type === TOKENS.ITALIC) {
				parsed += `<em>${Paragraph.parse(token)}</em>`
			} else if (token.type === TOKENS.CODE) {
				parsed += `<code>${Esc.everything(token.value)}</code>`
			}else if (token.type === TOKENS.STRIKE_THROUGH) {
				parsed += `<s>${Paragraph.parse(token)}</s>`
			} else if (token.type === TOKENS.LINK) {
				const linkTokens = token.tokens
				let linkTag = `<a href="${linkTokens.href}"` +
						(linkTokens.tooltip ? ` title="${linkTokens.tooltip}"` : "") +
						">" +
						Paragraph.parse(linkTokens.title) +
						"</a>"

				parsed += linkTag
			} else if (token.type === TOKENS.UNDERLINE) {
				parsed += `<u>${Paragraph.parse(token)}</u>`
			} else if (token.type === TOKENS.IMAGE) {
				const imgTokens = token.tokens
				let imgTag = `<img src="${imgTokens.href}"` +
						(imgTokens.alt !== undefined ? ` alt="${imgTokens.alt}"` : "") +
						(imgTokens.title !== undefined ? ` title="${imgTokens.title}"` : "") +
						(imgTokens.width !== undefined ? ` width="${imgTokens.width}"` : "") +
						(imgTokens.height !== undefined ? ` height="${imgTokens.height}"` : "") +
						">"
				parsed += imgTag
			} else if (token.type === TOKENS.HTML) {
				parsed += token.raw
			} else {
				const escaped = Esc.nonTags(token.value)
				const unescaped = Esc.unEscape(escaped)
				parsed += unescaped
			}
		})
		return parsed
	}
}
