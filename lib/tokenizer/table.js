import { REGEX } from "../regex/index.js"
import { TOKENS, Indent, Utils } from "../util/index.js"
import { Paragraph } from "./index.js"

/**
 * Table Tokenizer
 */
export class Table {
	#lines
	#start
	#cursor
	#indent
	#cellCount
	#rows = []
	#lex
	#linkRefs
	#withHeading

	static tokenName = TOKENS.TABLE

	/**
	 * Checks if the given text matches the Table Row regex
	 *
	 * @param {String} text - Text to check
	 *
	 * @returns {boolean}
	 */
	static #testRow(text) {
		return Utils.testRegex(text, REGEX.TABLE.ROW)
			&& !(
				Utils.testRegex(text, REGEX.TABLE.DASH_LINE) ||
				Utils.testRegex(text, REGEX.TABLE.COLON_LINE) ||
				Utils.testRegex(text, REGEX.TABLE.S_DASH_LINE) ||
				Utils.testRegex(text, REGEX.TABLE.S_COLON_LINE)
			)
	}

	/**
	 * Returns the number of cells in a row
	 *
	 * @param {string} text - Line to check
	 *
	 * @returns {number}
	 */
	static #getCellCount(text) {
		return (text.match(REGEX.TABLE.CELL) || []).length
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
	static #isHBSep(text, count, indent) {
		return Indent.get(text) === indent &&
			(
				Utils.testRegex(text, REGEX.TABLE.DASH_LINE) ||
				Utils.testRegex(text, REGEX.TABLE.COLON_LINE) ||
				Utils.testRegex(text, REGEX.TABLE.S_DASH_LINE) ||
				Utils.testRegex(text, REGEX.TABLE.S_COLON_LINE)
			) &&
			Table.#getCellCount(text) === count
	}

	/**
	 * Checks if the given line is a row of the table
	 *
	 * @param {string} text - Line to check
	 * @param {Number} count - Number of cells in the row
	 * @param {Number} indent - Indentation of the line
	 *
	 * @returns {boolean}
	 */
	static #isRow(text, count, indent) {
		return Indent.get(text) === indent &&
			Table.#testRow(text) &&
			Table.#getCellCount(text) === count &&
			!Table.#isHBSep(text, count, indent)
	}

	/**
	 * Tokenizes a cell of the table
	 *
	 * @param {String} row - Row to tokenize
	 * @param {Array} linkRefs
	 *
	 * @returns {{raw: String, value: String}[]}
	 */
	static #tokenizeCell(row, linkRefs) {
		const strippedRow = row.trim().slice(1, -1)
		const rawCells = strippedRow.split(REGEX.TABLE.CELL)

		const cells = []

		rawCells.forEach(cell => {
			if (cell === "|") return
			cells.push({
				raw: cell,
				tokens: Paragraph.tokenize(cell.trim(), linkRefs)
			})
		})

		return cells
	}

	/**
	 * Checks if the lines from the given cursor contains a table
	 *
	 * @returns {boolean}
	 */
	static test({ lines, cursor, indent }) {
		const lineToParse = lines[cursor]

		if (!Table.#testRow(lineToParse)) return false

		const cellCount = this.#getCellCount(lineToParse)
		let nextLine = lines[cursor + 1]
		let nextNextLine = lines[cursor + 2]

		if (nextLine !== undefined) {
			nextLine = nextLine.trimEnd()
			nextNextLine = nextNextLine?.trimEnd()

			if (
				(
					nextNextLine
					&& Table.#isHBSep(nextLine, cellCount, indent)
					&& Table.#isRow(nextNextLine, cellCount, indent)
				)
				|| Table.#isRow(nextLine, cellCount, indent)
			) {
				return true
			}
		}
		return false
	}

	/**
	 * Runs checks to find the actual end of the table
	 */
	#findEnd() {
		// now the line at the cursor is the first line of the table
		// first we determine if the second line is a table heading/body separator or not
		// if it is, then we know that the table has a heading
		// if it is not, then we know that the table does not have a heading

		this.#cursor += 1
		if (Table.#isHBSep(this.#lines[this.#cursor], this.#cellCount, this.#indent)) {
			this.#cursor += 2
			this.#withHeading = true
		}

		while (
			this.#lines[this.#cursor] !== undefined &&
			Table.#isRow(this.#lines[this.#cursor], this.#cellCount, this.#indent)
		) {
			this.#cursor++
		}
		this.#lex["withHeading"] = this.#withHeading
	}

	/**
	 * Table Tokenizer Constructor
	 *
	 * @param {String[]} lines
	 * @param {Number} cursor
	 * @param {Number} indent
	 * @param {Array} linkRefs
	 *
	 * @returns {Table}
	 */
	constructor(lines, cursor, indent, linkRefs) {
		this.#lines = lines
		this.#cursor = cursor
		this.#start = cursor
		this.#indent = indent
		this.#linkRefs = linkRefs
		this.#cellCount = Table.#getCellCount(this.#lines[this.#cursor])
		this.#lex = { type: TOKENS.TABLE, indent: this.#indent, rows: [] }
		this.#withHeading = false
	}

	/**
	 * Set the rows of the table to the #rows array
	 */
	#setRows() {
		const headingLine = this.#lines[this.#start]

		if (this.#withHeading) {
			this.#rows = (this.#cursor === this.#start + 3)
				? [headingLine, this.#lines[this.#start + 2]]
				: [...[headingLine], ...this.#lines.slice(this.#start + 2, this.#cursor)]
		} else {
			this.#rows = this.#lines.slice(this.#start, this.#cursor)
		}
	}

	/**
	 * Tokenizes cells for each table rows
	 */
	#performDeepLex() {
		this.#rows.forEach(row => {
			this.#lex.rows.push(Table.#tokenizeCell(row, this.#linkRefs))
		})
	}

	/**
	 * Tokenizes the lines for the Table token
	 *
	 * @returns {{cursor: number, lexer: {indent, type: string, rows: *[]}}}
	 */
	tokenize() {
		this.#findEnd()

		this.#setRows()

		this.#performDeepLex()

		return { lexer: this.#lex, cursor: this.#cursor - 1 }
	}

	/**
	 * Runs the HTML parsing for the Table token
	 *
	 * @param {Object} lexer - the Table lexer
	 *
	 * @returns {string} - the Table HTML
	 */
	static parse(lexer) {
		let tHeadingHtml, tBody
		if (lexer.withHeading) {
			const tHeading = lexer.rows[0]
			tHeadingHtml = `<th>${tHeading.map(t => Paragraph.parse(t)).join("</th><th>")}</th>`
			tBody = lexer.rows.slice(1)
		} else {
			tBody = lexer.rows
		}
		const tBodyHtml = tBody.map(row => `<tr><td>${row.map(cell => Paragraph.parse(cell)).join("</td><td>")}</td></tr>`).join("")
		return `<table>${tHeadingHtml ? `
  <thead><tr>
    ${tHeadingHtml}
  </tr></thead>` : ""}
  <tbody>
    ${tBodyHtml}
  </tbody>
</table>
`
	}
}
