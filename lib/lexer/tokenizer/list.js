import { REGEX } from "../../regex/index.js"
import { Commons } from "./commons.js"
import { Lexer } from "../index.js"


export class List {
	static getItemTokens (text) {
		text = text.trimEnd()
		REGEX.LIST.ITEM.lastIndex = 0
		const match = REGEX.LIST.ITEM.exec(text)
		if (match) {
			if (
				match.groups.check !== undefined &&
        typeof match.groups.check === "string"
			) {
				match.groups.isChecked = match.groups.check === "x"
				delete match.groups.check
			}
			// deep lexify the value of list item
			const l = new Lexer([match.groups.value])
			return {
				...match.groups,
				value: l.run()
			}
		}
		throw new Error(`Text: ${text} is not of type list-item`)
	}
	static getItemType(text) {
		const isCheckItem = text.match(REGEX.LIST.CHECKBOX)
		const ordered = !!text.match(REGEX.LIST.ORDERED)
		// find the position of next space in trimmed text
		let identifier = null
		if (!ordered) {
			const nextSpace = text.trim().indexOf(" ")
			identifier = text.trim().substring(0, nextSpace)
		}
		return {
			isCheckList: !!isCheckItem,
			ordered,
			identifier
		}
	}
	static tokenize(lines, cursor, indent) {
		const body = []

		let nextLine = lines[cursor]
		let nextLineTokens = this.getItemTokens(nextLine)
		let nextLineIndent, nextLineLType, nextLineMatch

		const listType = this.getItemType(nextLine)

		do {
			if (nextLineTokens.check === undefined) delete nextLineTokens.check
			if (nextLineTokens.count === undefined) delete nextLineTokens.count
			body.push({
				tokens: nextLineTokens,
				raw: nextLine
			})
			cursor++
			nextLine = lines[cursor]
			if (nextLine) {
				nextLineMatch = !! nextLine.trimEnd().match(REGEX.LIST.ITEM)
				nextLineTokens = (nextLineMatch) ? this.getItemTokens(nextLine) : null
				nextLineLType = (nextLineMatch) ? this.getItemType(nextLine) : null
				nextLineIndent = (nextLineMatch) ? Commons.getIndent(nextLine) : null
			}
		} while(
			nextLine &&
      nextLineMatch &&
      nextLineIndent === indent &&
      nextLineLType.isCheckList === listType.isCheckList &&
      nextLineLType.identifier === listType.identifier &&
      nextLineLType.ordered === listType.ordered
		)
		return {
			body,
			cursor: cursor - 1,
			type: listType
		}
	}
}
