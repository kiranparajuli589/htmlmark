import { Lexer } from "../index.js"
import { REGEX } from "../../regex/index.js"
import { Commons } from "./commons.js"
import { List } from "./list.js"


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

	static getCommonDepthV2(body) {
		let cDepth
		body.forEach((item) => {
			const currDepth = Quote.getDepth(item)
			if (cDepth === undefined) {
				cDepth = currDepth
			} else {
				cDepth = Math.min(cDepth, currDepth)
			}
		}
		)
		return cDepth
	}

	static trimBody(body, commonDepth) {
		const tBody = []
		body.forEach((item) => {
			tBody.push(Quote.getValue(item, commonDepth).trim())
		})
		return tBody
	}

	static shrinkBody(body) {
		const sBody = []
		body.forEach((item, index) => {

			const lastItem = (index > 0) ? body.at(index-1) : null
			const lastItemDepth = (lastItem)
				? Quote.getDepth(lastItem)
				: null
			const lastItemValue = (lastItem)
				? Quote.getValue(lastItem, lastItemDepth)
				: null

			const currDepth = Quote.getDepth(item)
			const currValue = Quote.getValue(item, currDepth)

			if (
				lastItem !== null &&
				!Quote.testEmpty(item) &&
				!Commons.testHeading(currValue) &&
				!Commons.testHeading(lastItemValue) &&
				!List.test(currValue) &&
				!List.test(lastItemValue) &&
				lastItemDepth >= currDepth &&
				!Quote.testEmpty(lastItem)
			) {
				const lastValue = sBody.pop()
				sBody.push(`${lastValue.trimEnd()} ${currValue.trim()}`)
			} else {
				sBody.push(item)
			}
		})
		return sBody
	}

	static tokenize(lines, cursor, indent) {
		const endCursor = this.findEndCursor(lines, cursor, indent)

		const body = lines.slice(cursor, endCursor + 1)

		const shrunkBody = Quote.shrinkBody(body)

		const commonDepth = this.getCommonDepthV2(shrunkBody)

		const trimmedBody = Quote.trimBody(shrunkBody, commonDepth)

		const lexMyQTrim = new Lexer(trimmedBody)
		const tokens = lexMyQTrim.run()

		return {
			tokens,
			depth: commonDepth,
			cursor: endCursor,
			raw: body.join("\n")
		}
	}
}
