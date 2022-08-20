import { Lexer } from "../lexer/index.js"
import { REGEX } from "../regex/index.js"
import { List } from "./list.js"
import { Heading } from "./heading.js"
import { Parser } from "../parser/index.js"
import { Newline } from "./newline.js"


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
		// +1 for the >
		text = text.substring(cursor + 1)
		// if first char is a space, then get rid of it
		return text.startsWith(" ") ? text.substring(1) : text
	}

	static findEnd(lines, cursor) {
		let nextLine = lines[cursor]
		let nextLineMatch
		// these items break the quote
		const breakTokens = [REGEX.HEADING, REGEX.LIST.ITEM, REGEX.CODE_BLOCK]

		do {
			nextLine = lines[++cursor]
			if (nextLine !== undefined) {
				nextLineMatch = nextLine.trim().startsWith(">")
			} else nextLineMatch = false
		} while (
			nextLineMatch
			// nextLineIndent === indent
		)

		// here we have formal end of the quote
		// keeping beside the laziness
		// if the last item of the quote is a quote separator
		// then no laziness is allowed
		const lastLineOfQuote = lines[cursor - 1]
		if (Quote.testEmpty(lastLineOfQuote)) {
			return cursor - 1
		}

		cursor -= 1

		// check for laziness
		let endLazy = false
		do {
			nextLine = lines[++cursor]
			if (nextLine !== undefined) {
				if (Newline.test(nextLine)) {
					endLazy = true
				}
				for (let r=0; r<breakTokens.length; r++) {
					breakTokens[r].lastIndex = 0
					if (breakTokens[r].test(nextLine)) {
						endLazy = true
						break
					}
				}
			}
		} while (nextLine !== undefined && !endLazy)

		return cursor - 1
	}

	static getCommonDepthV2(body) {
		let commonDepth
		body.forEach((item) => {
			const currDepth = Quote.getDepth(item)
			if (commonDepth === undefined) {
				commonDepth = currDepth
			} else {
				commonDepth = Math.min(commonDepth, currDepth)
			}
		}
		)
		return commonDepth
	}

	static trimBody(body, commonDepth) {
		const trimmed = []
		body.forEach((item) => {
			if (Quote.test(item) || Quote.testEmpty(item)) {
				trimmed.push(Quote.getValue(item, commonDepth).trimEnd())
			} else {
				// the lazy items can be non-quote so no need to get quote value
				trimmed.push(item.trimEnd())
			}
		})
		return trimmed
	}

	static shrinkBody(body) {
		const shrunk = []
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
				!Heading.test(currValue) &&
				!Heading.test(lastItemValue) &&
				!List.testItem(currValue) &&
				!List.testItem(lastItemValue) &&
				lastItemDepth >= currDepth &&
				!Quote.testEmpty(lastItem)
			) {
				const lastValue = shrunk.pop()
				shrunk.push(`${lastValue.trimEnd()} ${currValue.trimEnd()}`)
			} else {
				shrunk.push(item)
			}
		})
		return shrunk
	}

	static tokenize(lines, cursor, indent) {
		const end = this.findEnd(lines, cursor, indent)

		const body = lines.slice(cursor, end + 1)

		const shrunkBody = Quote.shrinkBody(body)

		const commonDepth = this.getCommonDepthV2(shrunkBody)

		const trimmedBody = Quote.trimBody(shrunkBody, commonDepth)

		const lex = new Lexer(trimmedBody)

		return {
			tokens: lex.run(),
			depth: commonDepth,
			cursor: end,
			raw: body.join("\n")
		}
	}

	static #wrapInside(depth, content) {
		let qHtml = "%s"
		for (let j=0; j<depth; j++) {
			qHtml = qHtml.replace("%s", `
<blockquote>%s</blockquote>`)
		}
		return qHtml.replace("%s", `${content}
`)
	}

	static parse(lexer) {
		const qParts = []
		lexer.tokens.forEach(qTokens => {
			let babyParser
			babyParser = new Parser([qTokens])
			qParts.push(babyParser.run())
		})
		return Quote.#wrapInside(
			lexer.depth,
			qParts.join("")
		)
	}
}
