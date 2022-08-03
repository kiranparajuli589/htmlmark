import { Commons } from "./commons.js"
import { REGEX } from "../../regex/index.js"
import { TOKENS } from "../../util/tokens.js"


export class Table {
	static getCellCount(text) {
		return text.split("|").length - 2
	}
	/**
   * table heading - body separator line
   * @param {string} text
   * @param {number} count
   * @param {number} indent
   * @returns {boolean}
   */
	static isHBSeparator(text, count, indent) {
		REGEX.TABLE.DASH_LINE.lastIndex = 0
		REGEX.TABLE.COLON_LINE.lastIndex = 0
		REGEX.TABLE.S_COLON_LINE.lastIndex = 0
		REGEX.TABLE.S_DASH_LINE.lastIndex = 0
		return Commons.getIndent(text) === indent &&
			(
				REGEX.TABLE.DASH_LINE.test(text) ||
				REGEX.TABLE.COLON_LINE.test(text) ||
				REGEX.TABLE.S_DASH_LINE.test(text) ||
				REGEX.TABLE.S_COLON_LINE.test(text)
			) &&
			this.getCellCount(text) === count
	}
	static isRow(text, count, indent) {
		REGEX.TABLE.ROW.lastIndex = 0
		return Commons.getIndent(text) === indent &&
        REGEX.TABLE.ROW.test(text) &&
        this.getCellCount(text) === count
	}
	static typeTest(lines, cursor, indent) {
		const lineToParse = lines[cursor]
		REGEX.TABLE.ROW.lastIndex = 0
		if (!REGEX.TABLE.ROW.test(lineToParse)) return false
		const cellCount = this.getCellCount(lineToParse)

		let nextLine = lines[cursor + 1]
		let nextNextLine = lines[cursor + 2]

		if (nextLine !== undefined && nextNextLine !== undefined) {
			nextLine = nextLine.trimEnd()
			nextNextLine = nextNextLine.trimEnd()

			const isHBSeparatorPresent = this.isHBSeparator(nextLine, cellCount, indent)

			if (
				isHBSeparatorPresent &&
        this.isRow(nextNextLine, cellCount, indent)
			) {
				return true
			}
		}
		return false
	}
	static tokenizeCell(row) {
		const strippedRow = row.trim().slice(1, -1)
		const rawCells = strippedRow.split("|")
		const cells = []
		rawCells.forEach(cell => {
			cells.push({
				raw: cell,
				value: cell.trim()
			})
		})

		return cells
	}
	static tokenize(lines, cursor, indent) {
		// at this point we already know that 3 lines from cursor are of table type
		// so, we can check if there are more rows of the same table type
		let bodyRowCount = cursor + 3

		// take reference from the heading line
		// todo: take this from the table check
		const headingLine = lines[cursor]
		const cellCount = this.getCellCount(lines[cursor])

		while(
			lines[bodyRowCount] !== undefined &&
      this.isRow(lines[bodyRowCount], cellCount, indent)
		) {
			bodyRowCount++
		}

		const rows = (bodyRowCount === cursor + 3)
			? [headingLine, lines[cursor+2]]
			: [...[headingLine], ...lines.slice(cursor + 2, bodyRowCount)]
		const tLexer = {
			type: TOKENS.TABLE,
			indent,
			rows: []
		}
		rows.forEach(row => {
			tLexer.rows.push(this.tokenizeCell(row))
		})
		return {
			lexer: tLexer,
			cursor: bodyRowCount - 1
		}
	}
}
