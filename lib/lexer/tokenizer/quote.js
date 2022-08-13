import { Lexer } from "../index.js"
import { Commons } from "./commons.js"
import { REGEX } from "../../regex/index.js"
import { TOKENS } from "../../util/tokens.js"


export class Quote {
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
		REGEX.EMPTY_QUOTE.lastIndex = 0
		if (REGEX.EMPTY_QUOTE.test(text.trim())) return text.match(/>/g).length
		const firstNonQuote = text.search(/[^>\s\t]/)
		const quotePart = text.substring(0, firstNonQuote)
		return quotePart.match(/>/g).length
	}

	static getValue(text, depth) {
		text = text.trimStart()
		const cursor = this.GetNthIndex(text, depth)
		return text.substring(cursor + 1)
	}

	static findEndCursor(lines, cursor, indent) {
		let nextLine = lines[cursor]
		let nextLineIndent, nextLineMatch

		do {
			nextLine = lines[++cursor]
			REGEX.QUOTE.lastIndex = 0
			nextLineMatch = (nextLine !== undefined) ? REGEX.QUOTE.test(nextLine) : null
			if (!nextLineMatch) {
				REGEX.EMPTY_QUOTE.lastIndex = 0
				nextLineMatch = (nextLine !== undefined) ? REGEX.EMPTY_QUOTE.test(nextLine) : null
			}
			nextLineIndent = (nextLineMatch) ? Commons.getIndent(nextLine) : null
		} while (
			nextLine !== undefined &&
			nextLineMatch &&
			nextLineIndent === indent
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
		body.forEach(item => {
			const lastItemInQBody = sBody.at(-1) || false
			const currDepth = this.getDepth(item)
			REGEX.EMPTY_QUOTE.lastIndex = 0
			if (REGEX.EMPTY_QUOTE.test(item)) {
				sBody.push({
					type: TOKENS.QUOTE_SEPARATOR,
					value: item,
					raw: item,
					depth: currDepth
				})
				return
			}
			if (
				lastItemInQBody &&
				lastItemInQBody.type === TOKENS.QUOTE &&
        currDepth <= lastItemInQBody.depth
			) {
				lastItemInQBody.value.push(this.getValue(item, currDepth))
				lastItemInQBody.raw += `\n${item}`
			} else {
				sBody.push({
					type: TOKENS.QUOTE,
					depth: currDepth,
					value: [this.getValue(item, currDepth)],
					raw: item
				})
			}
		})
		return sBody
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

	static deepTokenize(nestedBody, cDepth) {
		const rBody = []
		nestedBody.forEach(item => {
			if (item.type === TOKENS.QUOTE_SEPARATOR) return
			const l = new Lexer(item.value)

			if (item.depth === cDepth) {
				rBody.push(l.run())
			} else {
				rBody.push({
					type: TOKENS.QUOTE,
					depth: item.depth - cDepth,
					value: l.run()
				})
			}
		})
		return rBody
	}

	static nestBody(shrunkBody, commonDepth) {
		const result = []

		let lastResult, lastPush, nextShrunkItem

		shrunkBody.forEach((item, index) => {
			lastResult = result.at(-1) || false

			// grab next shrunk item
			nextShrunkItem = shrunkBody[index + 1] || false

			// lastItem and current item has common depth, just put it to the result value
			// and update the last push
			if (lastResult && item.depth === commonDepth) {
				lastResult.value.push(item.value)
				lastResult.raw += `\n${item.raw}`
				return
			}

			// if we have lastPush and it's a hit
			// and the curr item is a quote separator with common depth
			// then we've to move to the upper level to the lastResult
			if (
				lastPush &&
				lastPush.hit &&
				item.type === TOKENS.QUOTE_SEPARATOR &&
				item.depth === commonDepth
			) {
				lastPush = false
				lastResult.value.push("")
				lastResult.raw += "\n"
				return
			}



			// if we have the lastPush available
			// and, curr item is a quote separator
			if (lastPush && item.type === TOKENS.QUOTE_SEPARATOR) {
				// if the depth of lastPUsh is greater or equal to curr depth
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
				return
			}

			// if we have the last push and now the curr. item is of quote type
			// then if again, the curr depth is greater than the lastPush depth
			// then push it to the lastPush, update lastPush as it's value
			// LAST_PUSH_UPDATE_ALERT::only if next shrunk item is not a quote separator of the depth same as the current depth
			if (
				lastPush &&
				lastPush.type === TOKENS.QUOTE &&
				item.type === TOKENS.QUOTE &&
				item.depth >= lastPush.depth
			) {
				lastPush.value.push({
					...item,
					relativeDepth: item.depth - lastPush.depth
				})
				lastPush.raw += `\n${item.raw}`
				// update the last push
				if (
					nextShrunkItem &&
					nextShrunkItem.type === TOKENS.QUOTE_SEPARATOR &&
					nextShrunkItem.depth === commonDepth
				) {
					// at this point, there is no need to update the lastPush
				} else {
					lastPush = lastPush.value.at(-1)
				}
				return
			}

			// Now we're maybe done with the lastPush calculation
			// if the code reaches this point, then the lastPush is not available
			// so, we check for the lastResult

			// If we have the lastResult
			// and the curr item is a quote separator with the curr depth is equal to the common depth
			// then just push an empty string to the lastResult value array (no lastPush update necessary)
			if (
				lastResult &&
				lastResult.type === TOKENS.QUOTE &&
				item.type === TOKENS.QUOTE_SEPARATOR &&
				item.depth === commonDepth
			) {
				lastResult.value.push("")
				lastResult.raw += `\n${item.raw}`
				return
			}

			// otherwise, we look for quote type of shrunk item
			// if the curr item is a quote type and the curr depth is greater than the lastResult depth
			// then push it as a new quote inside the lastResult value
			// now this new entry will be set as the lastPush for coming iterations
			// LAST_PUSH_UPDATE_ALERT::only if next shrunk item is not a quote separator of the depth same as the current depth
			if (
				lastResult &&
				lastResult.type === TOKENS.QUOTE &&
				item.type === TOKENS.QUOTE &&
				item.depth >= lastResult.depth
			) {
				lastResult.value.push({
					...item,
					relativeDepth: item.depth - lastResult.depth
				})
				lastResult.raw += `\n${item.raw}`
				if (
					nextShrunkItem &&
					nextShrunkItem.type === TOKENS.QUOTE_SEPARATOR &&
					nextShrunkItem.depth === commonDepth
				) {
					// at this point, there is no need to update the lastPush
				} else {
					lastPush = lastResult.value.at(-1)
				}
			} else {
				// otherwise, if curr depth is greater than the lastResult depth
				// then push it as a new quote with the common depth
				// and add this current item as the value of this brand-new quote
				if (item.depth > commonDepth) {
					result.push({
						type: TOKENS.QUOTE,
						depth: commonDepth,
						raw: item.raw,
						value: [
							{
								...item,
								relativeDepth: item.depth - commonDepth,
								hit: true
							}
						]
					})
					// uff, the same check here again.
					// we've to manage a function for this.
					if (
						nextShrunkItem &&
						nextShrunkItem.type === TOKENS.QUOTE_SEPARATOR &&
						nextShrunkItem.depth === commonDepth
					) {
						// at this point, there is no need to update the lastPush
					} else {
						// lastPush = lastResult.value.at(-1)
						lastPush = result.at(-1).value.at(-1)
					}
				} else {
					// otherwise, push the curr item to the result array
					// magic begins from here
					result.push(item)
				}
			}
		})
		return result
	}

	static tokenize(lines, cursor, indent) {
		const endCursor = this.findEndCursor(lines, cursor, indent)

		const body = lines.slice(cursor, endCursor + 1)

		const shrunkBody = this.shrinkBody(body)
		const commonDepth = this.getCommonDepth(shrunkBody)
		const nestedBody = this.nestBody(shrunkBody, commonDepth)

		const qBody = this.deepTokenize(nestedBody, commonDepth)

		return {
			depth: commonDepth,
			body: [],
			cursor: endCursor
		}
	}
}
