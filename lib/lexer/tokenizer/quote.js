import { Lexer } from "../index.js"
import { REGEX } from "../../regex/index.js"
import { TOKENS } from "../../util/tokens.js"
import { List } from "./list.js"
import { Commons } from "./commons.js"


export class Quote {
	static test(text) {
		REGEX.QUOTE.lastIndex = 0
		return REGEX.QUOTE.test(text)
	}

	static testEmpty(text) {
		REGEX.EMPTY_QUOTE.lastIndex = 0
		return REGEX.EMPTY_QUOTE.test(text)
	}

	static GetNthIndex(text, position, delimiter = ">") {
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

	static getDepth(text) {
		text = text.trimStart()
		if (text[0] !== ">") return 0
		if (Quote.testEmpty(text.trim())) return text.match(/>/g).length
		const firstNonQuote = text.search(/[^>\s\t]/)
		const quotePart = text.substring(0, firstNonQuote)
		return quotePart.match(/>/g).length
	}

	static getValue(text, depth) {
		text = text.trimStart()
		const cursor = this.GetNthIndex(text, depth)
		return text.substring(cursor + 1)
	}

	static findEndCursor(lines, cursor) {
		let nextLine = lines[cursor]
		let nextLineMatch
		// these items break the quote
		const breakArray = [REGEX.HEADING, REGEX.LIST.ITEM, REGEX.CODE_BLOCK]

		do {
			nextLine = lines[++cursor]
			for (let i = 0; i < breakArray.length; i++) {
				breakArray[i].lastIndex = 0
				if (breakArray[i].test(nextLine)) {
					nextLineMatch = true
					break
				}
			}
		} while (
			nextLine !== undefined &&
			!nextLineMatch &&
			!["", "\n"].includes(nextLine)
			// nextLineIndent === indent
		)
		return cursor - 1
	}

	/**
	 * remember depth for quotes if present inside
	 * merges consecutive quotes with the same or less depth
	 * merges consecutive non-quote lines
	 *
	 * @param {array} body
	 * @returns {*[]}
	 */
	static shrinkBody(body) {
		const sBody = []
		body.forEach((item) => {
			const lastItemInQBody = sBody.at(-1) || false
			const currDepth = this.getDepth(item)
			const currValue = this.getValue(item, currDepth)

			if (
				Quote.testEmpty(item)
			) {
				sBody.push({
					type: TOKENS.QUOTE_SEPARATOR,
					depth: currDepth,
					raw: item
				})
				return
			}


			if (lastItemInQBody) {
				if (
					!Quote.testEmpty(item) &&
					!Commons.testHeading(currValue) &&
					lastItemInQBody.type === TOKENS.QUOTE &&
					currDepth <= lastItemInQBody.depth
				) {
					lastItemInQBody.value.push(currValue)
					lastItemInQBody.raw += `\n${item}`
					return
				}

				if (
					!Quote.testEmpty(item) &&
					!Commons.testHeading(currValue) &&
					lastItemInQBody.type === TOKENS.QUOTE &&
					currDepth === lastItemInQBody.depth &&
					List.test(lastItemInQBody.value.at(-1)) &&
					List.test(item)
				) {
					lastItemInQBody.value.push(currValue)
					lastItemInQBody.raw += `\n${item}`
					return
				}
			}

			sBody.push({
				type: TOKENS.QUOTE,
				depth: currDepth,
				value: [currValue],
				raw: item
			})
		})

		// now merge the quote separators
		// if there are two or more consecutive separators with the same depth, merge them into one

		const shrunkBody = []
		let commonDepth = this.getCommonDepth(sBody)

		let counter = []

		sBody.forEach((item) => {
			if (
				item.type === TOKENS.QUOTE_SEPARATOR &&
				item.depth === commonDepth
			) {
				counter.push(item)
			} else {
				if (counter.length >= 1) {
					shrunkBody.push({
						type: TOKENS.QUOTE_SEPARATOR,
						depth: commonDepth,
						raw: counter.map(i => i.raw).join("\n")
					})
					counter = []
				}
				shrunkBody.push(item)
			}
		})


		return shrunkBody
	}

	static getCommonDepth(shrunkBody) {
		let cDepth
		shrunkBody.forEach(item => {
			if (item.depth) {
				if (cDepth === undefined) {
					cDepth = item.depth
				} else {
					cDepth = Math.min(cDepth, item.depth)
				}
			}
		})
		return cDepth
	}

	static nestedLastPushCheck(nextShrunkItem, commonDepth) {
		return (
			nextShrunkItem &&
			nextShrunkItem.type === TOKENS.QUOTE_SEPARATOR &&
			nextShrunkItem.depth === commonDepth
		)
	}

	static nestBody(shrunkBody, commonDepth) {
		const result = {
			type: TOKENS.QUOTE,
			depth: commonDepth,
			value: [],
			raw: ""
		}

		let lastPush, nextShrunkItem, lastResult

		shrunkBody.forEach((item, index) => {

			// grab next shrunk item
			nextShrunkItem = shrunkBody[index + 1] || false
			lastResult = result.value.at(-1) || false




			if (lastPush) {
				if (lastPush.depth > item.depth) {
					// now we should not push the item inside the lastPush value
					// but, instead we should push it inside the items from lastResult
					if (lastResult.depth >= item.depth) {
						console.debug(item)
					}
				}

				// if we have lastPush, and it's a hit
				// and the curr item is a quote separator with common depth
				// then we've to move to the upper level to the lastResult
				if (item.type === TOKENS.QUOTE_SEPARATOR) {
					if (item.depth === commonDepth) {
						lastPush = null
						result.value.push("")
						result.raw += "\n"
						return
					} else {
						// if the depth of lastPush is greater or equal to curr depth
						// push to the same last push, no lastPush update necessary
						if (lastPush.depth >= item.depth) {
							lastPush.value.push("")
						} else {
							// else push it as a new entry of a quote inside the lastPush
							// it will be set with empty content, so that the lexer will use it as a newline
							lastPush.value.push({
								type: TOKENS.QUOTE,
								depth: item.depth,
								relativeDepth: item.depth - lastPush.depth,
								value: [""],
								raw: item.raw
							})
							lastPush = lastPush.value.at(-1)
						}
						lastPush.raw += `\n${item.raw}`
						result.raw += `\n${item.raw}`
						return
					}
				} else {
					if (item.depth > lastPush.depth) {
						lastPush.value.push({
							...item,
							relativeDepth: item.depth - lastPush.depth
						})
						lastPush.raw += `\n${item.raw}`
						result.raw += `\n${item.raw}`

						if (!this.nestedLastPushCheck(nextShrunkItem, commonDepth)) {
							lastPush = lastPush.value.at(-1)
						}
						return
					}
				}
			}

			// Now we're maybe done with the lastPush calculation
			// if the code reaches this point, then the lastPush is not available




			// now every item coming upto here is of the depth greater than the common depth

			// if the item is of type quote separator
			if (item.type === TOKENS.QUOTE_SEPARATOR) {
				// we will think about it later
				if (item.depth === commonDepth) {
					result.value.push("")
					result.raw += `\n${item.raw}`
					return
				}
			} else {

				// current item has the common depth,
				// just put it to the result value
				if (
					item.depth === commonDepth
				) {
					if (item.type === TOKENS.QUOTE) {
						result.value = result.value.concat(item.value)
					}
					result.raw += `\n${item.raw}`
					return
				}


				// this is the item with type quote
				// and has depth greater than the common depth
				// so, we will push it to the result value
				// and update the lastPush
				result.value.push({
					...item,
					relativeDepth: item.depth - commonDepth
				})
				result.raw += `\n${item.raw}`

				if (!this.nestedLastPushCheck(nextShrunkItem, commonDepth)) {
					lastPush = result.value.at(-1)
				}
			}
		})
		return result
	}

	static deepTokenize(nestedBody) {
		let result = {
			type: TOKENS.QUOTE,
			depth: nestedBody.relativeDepth,
			tokens: [],
			raw: nestedBody.raw
		}
		let noObjArr = []
		let zippy = false

		nestedBody.value.forEach((item) => {
			// if it's an string, then just push it to the noObjArr
			if (typeof item === "string") {
				noObjArr.push(item)
			} else {
				// first, check for the noObjArray
				// if it's not empty, then lex it
				if (noObjArr.length > 0) {
					const l = new Lexer(noObjArr)
					result.tokens =
						result.tokens.concat(l.run())
					noObjArr = []
					zippy = true
				}
				// now, recursively deal with the quote type object
				// nestedBody.tokens.push(Quote.deepTokenize(item))
				result.tokens =
					result.tokens.concat(Quote.deepTokenize(item))
			}
		})
		if (!zippy) {
			if (noObjArr.length > 0) {
				const l = new Lexer(noObjArr)
				result.tokens = result.tokens.concat(l.run())
				noObjArr = []
				zippy = false
			}
		}
		return result
	}

	static tokenize(lines, cursor, indent) {
		const endCursor = this.findEndCursor(lines, cursor, indent)

		const body = lines.slice(cursor, endCursor + 1)

		const shrunkBody = this.shrinkBody(body)
		const commonDepth = this.getCommonDepth(shrunkBody)
		const nestedBody = this.nestBody(shrunkBody, commonDepth)

		const qBody = this.deepTokenize(nestedBody)

		return {
			... qBody,
			depth: commonDepth,
			cursor: endCursor
		}
	}
}
