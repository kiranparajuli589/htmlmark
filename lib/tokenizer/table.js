import { REGEX } from "../regex/index.js"
import { TOKENS } from "../util/tokens.js"
import { Indent } from "../util/indent.js"
import { Parser } from "../parser/index.js"
import { Utils } from "../util/utils.js"
import { Paragraph } from "./paragraph.js"

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

	/**
	 * Checks if the given text matches the Table Row regex
	 * REGEX: /^\s*\|(?=(?:[^|]+\|)+$)|(?!^)(?<cell>[^|]+)\|/gy
	 *
	 * @param {String} text - Text to check
	 *
	 * @returns {boolean}
	 */
	static #testRow(text) {
		return Utils.testRegex(text, REGEX.TABLE.ROW)
	}

	/**
	 * Returns the number of cells in a row
	 *
	 * @param {string} text - Line to check
	 *
	 * @returns {number}
	 */
	static #getCellCount(text) {
		return (text.match(/(?<!\\)(\|)/g) || []).length
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
			Table.#getCellCount(text) === count
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
		const rawCells = strippedRow.split(/(?<!\\)(\|)/g)

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
	 * @param {Array} lines - Lines to check
	 * @param {Number} cursor - Cursor to start checking from
	 * @param {Number} indent - Indentation of the line
	 *
	 * @returns {boolean}
	 */
	static test(lines, cursor, indent) {
		const lineToParse = lines[cursor]

		if (!Table.#testRow(lineToParse)) return false

		const cellCount = this.#getCellCount(lineToParse)
		let nextLine = lines[cursor + 1]
		let nextNextLine = lines[cursor + 2]

		if (nextLine !== undefined && nextNextLine !== undefined) {
			nextLine = nextLine.trimEnd()
			nextNextLine = nextNextLine.trimEnd()

			if (
				Table.#isHBSep(nextLine, cellCount, indent) &&
				Table.#isRow(nextNextLine, cellCount, indent)
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
		// at this point we already know that 3 lines from cursor are of table type
		// so, we can check if there are more rows of the same table type
		this.#cursor += 3

		while (
			this.#lines[this.#cursor] !== undefined &&
			Table.#isRow(this.#lines[this.#cursor], this.#cellCount, this.#indent)
		) {
			this.#cursor++
		}
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
	}

	/**
	 * Set the rows of the table to the #rows array
	 */
	#setRows() {
		const headingLine = this.#lines[this.#start]

		this.#rows = (this.#cursor === this.#start + 3)
			? [headingLine, this.#lines[this.#start + 2]]
			: [...[headingLine], ...this.#lines.slice(this.#start + 2, this.#cursor)]
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
		const tHeading = lexer.rows[0]
		const tBody = lexer.rows.slice(1)
		const tHeadingHtml = `<th>${tHeading.map(t => Parser.parseContent(t)).join("</th><th>")}</th>`
		const tBodyHtml = tBody.map(row => `<tr><td>${row.map(cell => Parser.parseContent(cell)).join("</td><td>")}</td></tr>`).join("")
		return `<table>
  <thead>
    <tr>
      ${tHeadingHtml}
    </tr>
  </thead>
  <tbody>
    ${tBodyHtml}
  </tbody>
</table>
`
	}
}
