import { REGEX } from "../regex/index.js"
import { Lexer } from "../lexer/index.js"
import { Indent } from "../util/indent.js"
import { Parser } from "../parser/index.js"
import { Newline } from "./newline.js"
import { TOKENS } from "../util/tokens.js"
import { Utils } from "../util/utils.js"
import { Heading } from "./heading.js"
import { Quote } from "./quote.js"

/**
 * List Tokenizer
 */
export class List {
	#lines
	#cursor
	#indent
	#body = []
	#end
	#shrunkBody = []
	#lex
	#match
	#isEmpty
	#meta = {
		checklist: false,
		ordered: false,
		identifier: null
	}

	static testEmpty(text) {
		return Utils.testRegex(text, REGEX.LIST.EMPTY)
	}

	static testItem(text) {
		return Utils.testRegex(text, REGEX.LIST.ITEM)
	}

	static test(text) {
		if (List.testEmpty(text)) { return true }
		return List.testItem(text)
	}


	static matchEmpty(text) {
		return Utils.execRegex(text, REGEX.LIST.EMPTY)
	}

	static matchItem(text) {
		return Utils.execRegex(text, REGEX.LIST.ITEM)
	}

	static match(text, isEmpty = false) {
		if (isEmpty) {
			return List.matchEmpty(text)
		}
		return List.matchItem(text)
	}

	constructor(lines, cursor, indent) {
		this.#lines = lines
		this.#cursor = cursor
		this.#indent = indent
		this.#isEmpty = List.testEmpty(lines[cursor])
		this.#processMeta()

	}

	/**
	 * Finds the end of the list item
	 * Updates the cursor value
	 */
	#findEnd() {
		if (this.#isEmpty) {
			this.#end = this.#cursor + 1
			return
		}

		let cursor = this.#cursor
		let nextLine, nextLineIndent, nextNextLine
		let breakMatch = false


		do {
			nextLine = this.#lines[++cursor]

			nextLineIndent = Indent.get(nextLine)
			// check for two or more consecutive new lines
			// if we find that, then we know we are at the end of the list item
			nextNextLine = this.#lines[cursor + 1]
			if (
				Newline.test(nextLine)
			) {
				if (
					nextNextLine &&
					Newline.test(nextNextLine)
				) {
					breakMatch = true
				} else if (
					Indent.get(nextNextLine) <= this.#indent
				) {
					breakMatch = true
				}
			}
		} while (
			nextLine !== undefined &&
			!breakMatch &&
			!(
				(
					List.test(nextLine) ||
					Heading.test(nextLine, nextNextLine) ||
					Quote.test(nextLine)
				) &&
				nextLineIndent <= this.#indent
			)
		)
		this.#end = cursor
	}

	/**
	 * Processes the list item meta
	 *
	 * The following meta are calculated:
	 * 1. ordered: boolean - if the list item is ordered
	 * 2. identifier: string - the identifier for the list item
	 * 3. check: boolean - if the list item is a checklist item
	 */
	#processMeta() {
		this.#match = List.match(this.#lines[this.#cursor], this.#isEmpty).groups

		this.#meta.checklist = this.#match.check !== undefined

		this.#meta.ordered = !!this.#match.count

		if (this.#match.mark) this.#meta.identifier = this.#match.mark
	}

	/**
	 * Sets the raw body of the list item
	 */
	#setBody() {
		this.#body = this.#lines.slice(this.#cursor, this.#end)
	}

	/**
	 * Shrinks raw body for the list item
	 */
	#shrinkBody() {
		for (let index = 0; index < this.#body.length; index++) {
			const line = this.#body[index]
			if (index === 0) {
				if (this.#isEmpty) {
					this.#shrunkBody.push("")
				} else {
					this.#shrunkBody.push(this.#match.value)
				}
			} else {
				this.#shrunkBody.push(line)
			}
		}
	}

	/**
	 * Tokenizes the provided lines for the List Item token
	 *
	 * @returns {{cursor: number, meta: {ordered: boolean, identifier: null, checklist: boolean}, body: {count: null, checked: (boolean|null), raw: string, tokens: *, type: string}}}
	 */
	tokenize() {
		this.#findEnd()

		this.#setBody()

		this.#shrinkBody()

		this.#lex = new Lexer(this.#shrunkBody, TOKENS.LIST_ITEM)

		return {
			cursor: this.#end - 1,
			meta: this.#meta,
			body: {
				type: TOKENS.LIST_ITEM,
				tokens: this.#lex.run(),
				count: this.#match.count || null,
				checked: (this.#meta.checklist) ? this.#match.check === "x" : null,
				raw: this.#body.join("\n")
			}
		}
	}

	/**
	 * Runs HTML parsing for the List token
	 *
	 * @param {Object} lexer - the List lexer
	 *
	 * @returns {string} - the List HTML
	 */
	static parse(lexer) {
		const listTag = (lexer.meta.ordered) ? "ol" : "ul"
		let listBodyHtml = []
		lexer.items.forEach(listItem => {
			let listItemHtml = `
<li>%s</li>`
			const lParser = new Parser(listItem.tokens, TOKENS.LIST)
			if (lexer.meta.checklist) {
				const isChecked = (listItem.checked) ? " checked" : ""
				listItemHtml = listItemHtml. replace(
					"%s",
					"<input type='checkbox'" +
						isChecked +
						">" +
						lParser.run()
				)
			} else {
				listItemHtml = listItemHtml.replace(
					"%s",
					new Parser(listItem.tokens, TOKENS.LIST).run()
				)
			}
			listBodyHtml.push(listItemHtml)
		})
		return `<${listTag}>${listBodyHtml.join("")}
</${listTag}>
`
	}

	/**
	 * Runs check if the last and current lexer is of same list type
	 *
	 * Things under check are:
	 * 1. type of the lexers
	 * 2. indentation
	 * 3. is of type checklist
	 * 4. ordered or unordered
	 * 5. identifier of the list item
	 *
	 * @param {Object} lastLexerItem
	 * @param {Object} currentLexer
	 * @param {number} indent
	 *
	 * @returns {boolean}
	 */
	static isLastLexerTheSameList(lastLexerItem, currentLexer, indent) {
		return (
			lastLexerItem &&
			lastLexerItem.type === TOKENS.LIST &&
			lastLexerItem.indent === indent &&
			lastLexerItem.meta.checklist === currentLexer.meta.checklist &&
			lastLexerItem.meta.ordered === currentLexer.meta.ordered &&
			lastLexerItem.meta.identifier === currentLexer.meta.identifier
		)
	}
}
