import { REGEX } from "../regex/index.js"
import { Lexer } from "../lexer/index.js"
import { Indent } from "../util/indent.js"
import { Parser } from "../parser/index.js"
import { Newline } from "./newline.js"
import { TOKENS } from "../util/tokens.js"


export class List {
	#lines
	#cursor
	#indent
	#body = []
	#end
	#shrunkBody = []
	#lex
	#match
	#meta = {
		check: false,
		ordered: false,
		identifier: null
	}

	static testItem(text) {
		REGEX.LIST.ITEM.lastIndex = 0
		return REGEX.LIST.ITEM.test(text)
	}

	static testCheckbox(text) {
		REGEX.LIST.CHECKBOX.lastIndex = 0
		return REGEX.LIST.CHECKBOX.test(text)
	}

	static testUnOrdered(text) {
		REGEX.LIST.UNORDERED.lastIndex = 0
		return REGEX.LIST.UNORDERED.test(text)
	}

	static testOrdered(text) {
		REGEX.LIST.ORDERED.lastIndex = 0
		return REGEX.LIST.ORDERED.test(text)
	}

	static match(text) {
		REGEX.LIST.ITEM.lastIndex = 0
		return REGEX.LIST.ITEM.exec(text.trimEnd())
	}

	constructor(lines, cursor, indent) {
		this.#lines = lines
		this.#cursor = cursor
		this.#indent = indent
	}

	#findEnd() {
		let cursor = this.#cursor
		let nextLine, nextNextLine, nextLineIndent
		let breakMatch = false


		do {
			nextLine = this.#lines[++cursor]
			nextLineIndent = Indent.get(nextLine)
			// check for two or more consecutive new lines
			// if we find that, then we know we are at the end of the list item
			nextNextLine = this.#lines[cursor + 1]
			if (
				Newline.test(nextLine) &&
				nextNextLine &&
				Newline.test(nextNextLine)
			) {
				breakMatch = true
			}
		} while (
			nextLine !== undefined &&
			!breakMatch &&
			!(
				List.testItem(nextLine) &&
				nextLineIndent <= this.#indent
			)
		)
		this.#end = cursor
	}

	#processMeta (text) {
		this.#match = List.match(text).groups
		if (this.#match.check !== undefined) {
			this.#meta.check = true
		}

		this.#meta.ordered = !!this.#match.count

		if (this.#match.mark) this.#meta.identifier = this.#match.mark
	}

	#setBody() {
		this.#body = this.#lines.slice(this.#cursor, this.#end)
	}

	#shrinkBody() {
		for (let index = 0; index < this.#body.length; index++) {
			const line = this.#body[index]
			if (index === 0) {
				// calculate the meta for the list
				// information is only available on the first line
				this.#processMeta(line)

				this.#shrunkBody.push(this.#match.value)
			} else {
				this.#shrunkBody.push(line)
			}
		}
	}

	tokenize() {

		this.#findEnd()

		this.#setBody()

		this.#shrinkBody()

		this.#lex = new Lexer(this.#shrunkBody, true)

		return {
			cursor: this.#end - 1,
			meta: this.#meta,
			body: {
				type: TOKENS.LIST_ITEM,
				tokens: this.#lex.run(),
				count: this.#match.count || null,
				checked: this.#match.checked || null
			}
		}
	}

	static parse(lexer) {
		const listTag = (lexer.meta.ordered) ? "ol" : "ul"
		let listBodyHtml = []
		lexer.items.forEach(listItem => {
			let listItemHtml = `
<li>%s</li>`
			const pp = new Parser(listItem.tokens)
			if (lexer.meta.check) {
				const isChecked = (listItem.checked) ? " checked" : ""
				listItemHtml = listItemHtml. replace(
					"%s",
					"<input type='checkbox'" +
						isChecked +
						">" +
						pp.run()
				)
			} else {
				listItemHtml = listItemHtml.replace(
					"%s",
					new Parser(listItem.tokens).run()
				)
			}
			listBodyHtml.push(listItemHtml)
		})
		return `
<${listTag}>${listBodyHtml.join("")}
</${listTag}>`
	}
}
