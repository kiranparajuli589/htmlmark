import { REGEX } from "../regex/index.js"
import { TOKENS } from "../util/tokens.js"
import { Indent } from "../util/indent.js"
import { Parser } from "../parser/index.js"


export class Table {
	static getCellCount(text) {
		return text.split("|").length - 2
	}
	/**
   * check if line is a table 'heading - body' separator
	 *
   * @param {string} text
   * @param {number} count
   * @param {number} indent
	 *
   * @returns {boolean}
   */
	static isHBSep(text, count, indent) {
		REGEX.TABLE.DASH_LINE.lastIndex = 0
		REGEX.TABLE.COLON_LINE.lastIndex = 0
		REGEX.TABLE.S_COLON_LINE.lastIndex = 0
		REGEX.TABLE.S_DASH_LINE.lastIndex = 0
		return Indent.get(text) === indent &&
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
		return Indent.get(text) === indent &&
        REGEX.TABLE.ROW.test(text) &&
        this.getCellCount(text) === count
	}
	static test(lines, cursor, indent) {
		const lineToParse = lines[cursor]
		REGEX.TABLE.ROW.lastIndex = 0
		if (!REGEX.TABLE.ROW.test(lineToParse)) return false
		const cellCount = this.getCellCount(lineToParse)

		let nextLine = lines[cursor + 1]
		let nextNextLine = lines[cursor + 2]

		if (nextLine !== undefined && nextNextLine !== undefined) {
			nextLine = nextLine.trimEnd()
			nextNextLine = nextNextLine.trimEnd()

			const isHBSeparatorPresent = this.isHBSep(nextLine, cellCount, indent)

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

		const lex = { type: TOKENS.TABLE, indent, rows: [] }
		rows.forEach(row => {
			lex.rows.push(this.tokenizeCell(row))
		})

		return { lexer: lex, cursor: bodyRowCount - 1 }
	}
	static parse(lexer) {
		const tHeading = lexer.rows[0]
		const tBody = lexer.rows.slice(1)
		const tHeadingHtml = `<th>${tHeading.map(t => Parser.parseContent(t)).join("</th><th>")}</th>`
		const tBodyHtml = tBody.map(row => `<tr><td>${row.map(cell => Parser.parseContent(cell)).join("</td><td>")}</td></tr>`).join("")
		return `
<table>
  <thead>
    <tr>
    	${tHeadingHtml}
		</tr>
  </thead>
  <tbody>
    ${tBodyHtml}
  </tbody>
</table>`
	}
}
