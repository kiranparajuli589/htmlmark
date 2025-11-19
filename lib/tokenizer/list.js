import REGEX from "../regex/index.js"
import Lexer from "../lexer/index.js"
import Parser from "../parser/index.js"
import { Newline, Heading, Quote } from "./index.js"
import { Indent, TOKENS, Utils } from "../util/index.js"

/**
 * List Tokenizer
 */
class List {
	#lines
	#cursor
	#indent
	#body = []
	#end
	#shrunkBody = []
	#lex
	#match
	#isEmpty
	#indentObj
	#config
	#meta = {
		checklist: false,
		ordered: false,
		identifier: null
	}

	static tokenName = TOKENS.LIST

	static testEmpty(text) {
		return Utils.testRegex(text, REGEX.LIST.EMPTY)
	}

	static testItem(text) {
		return Utils.testRegex(text, REGEX.LIST.ITEM)
	}

	static test({ line }) {
		if (List.testEmpty(line)) { return true }
		return List.testItem(line)
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

	constructor(lines, cursor, indent, config) {
		this.#lines = lines
		this.#cursor = cursor
		this.#indent = indent
		this.#isEmpty = List.testEmpty(lines[cursor])
		this.#config = Utils.prepareConfig(config)
		this.#indentObj = new Indent(this.#config.indent, this.#config.tabSize)
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

			nextLineIndent = this.#indentObj.get(nextLine)
			// check for two or more consecutive new lines
			// if we find that, then we know we are at the end of the list item
			nextNextLine = this.#lines[cursor + 1]
			if (
				Newline.test({ line: nextLine })
			) {
				if (
					nextNextLine &&
					Newline.test({ line: nextNextLine })
				) {
					breakMatch = true
				} else if (
					this.#indentObj.get(nextNextLine) <= this.#indent
				) {
					breakMatch = true
				}
			}
		} while (
			nextLine !== undefined &&
			!breakMatch &&
			!(
				(
					(List.test({ line: nextLine }) && this.#shouldEndOnList(nextLine, nextLineIndent)) ||
					Heading.test({ line: nextLine, nextLine: nextNextLine }) ||
					Quote.test({ line: nextLine })
				) &&
				nextLineIndent <= this.#indent
			)
		)
		this.#end = cursor
	}

	/**
	 * Determines if encountering a list at the same indent should end the current list item
	 * Returns true if the list is the same type (both ordered or both unordered)
	 * Returns false if the list is a different type (should be nested)
	 */
	#shouldEndOnList(line, indent) {
		if (indent < this.#indent) {
			// List at lesser indent always ends current item
			return true
		}
		if (indent > this.#indent) {
			// List at greater indent should be nested, don't end
			return false
		}
		// Same indent: check if same type
		const nextMatch = List.match(line, List.testEmpty(line))
		if (!nextMatch) {
			return true
		}
		const nextOrdered = !!nextMatch.groups.count
		// End current item only if same type (both ordered or both unordered)
		return this.#meta.ordered === nextOrdered
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
		this.#shrunkBody = [...this.#body]
		if (this.#isEmpty) {
			this.#shrunkBody[0] = ""
		} else {
			this.#shrunkBody[0] = this.#match.value
		}
	}

	/**
	 * Tokenizes the provided lines for the List Item token
	 *
	 * @returns {{cursor: number,  meta: {ordered: boolean, identifier: null, checklist: boolean}, lexer: {count: null, checked: (boolean|null), raw: string, tokens: *, type: string}}}
	 */
	tokenize() {
		this.#findEnd()

		this.#setBody()

		this.#shrinkBody()

		this.#lex = new Lexer(
			this.#shrunkBody,
			{
				from: TOKENS.LIST_ITEM,
				config: this.#config
			}
		)

		return {
			cursor: this.#end - 1,
			meta: this.#meta,
			lexer: {
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
			let listItemHtml = "<li>%s</li>"
			// Check if list item contains a nested list
			const hasNestedList = listItem.tokens.some(token => token.type === TOKENS.LIST)
			// Use TOKENS.LIST_ITEM as fromToken if there's a nested list, so paragraphs get wrapped in <p> tags
			const fromToken = hasNestedList ? TOKENS.LIST_ITEM : TOKENS.LIST
			const lParser = new Parser(listItem.tokens, { from: fromToken })
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
					lParser.run()
				)
			}
			listBodyHtml.push(listItemHtml)
		})
		return `<${listTag}>
  ${listBodyHtml.join("\n  ")}
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
	 * @param {Object} baseLexer
	 * @param {Object} lexerToCompare
	 * @param {number} indent
	 *
	 * @returns {boolean}
	 */
	static compareIfTwoListLexerAreOfSameType(baseLexer, lexerToCompare, indent) {
		return (
			baseLexer &&
			baseLexer.type === TOKENS.LIST &&
			baseLexer.indent === indent &&
			baseLexer.meta.checklist === lexerToCompare.meta.checklist &&
			baseLexer.meta.ordered === lexerToCompare.meta.ordered &&
			baseLexer.meta.identifier === lexerToCompare.meta.identifier
		)
	}
}

export default List
