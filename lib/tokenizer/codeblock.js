import { REGEX } from "../regex/index.js"
import { Indent } from "../util/indent.js"
import { Parser } from "../parser/index.js"


export class CodeBlock {
	static getTheEnd(lines, cursor, indent) {
		let cursorPosition = cursor

		let nextLine, nextLineIndent, nextLineMatch, isNextLineClosingOne

		do {
			nextLine = lines[++cursorPosition]
			nextLineIndent = (nextLine) ? Indent.get(nextLine) : null

			if (nextLine !== undefined) {
				nextLineMatch = nextLine.trim() === "```"
				if (
					nextLineMatch &&
          indent + 4 > nextLineIndent &&
          nextLineIndent >= indent
				) {
					isNextLineClosingOne = true
				} else {
					nextLineMatch = false
				}
			}
		} while (
			nextLine !== undefined &&
      !nextLineMatch &&
      (nextLine === "" || nextLineIndent >= indent) &&
      !isNextLineClosingOne
		)

		if (isNextLineClosingOne) {
			return cursorPosition
		}

		if (cursorPosition - cursor <= 1) return false

		return cursorPosition
	}
	static test(lines, cursor, indent) {
		REGEX.CODE_BLOCK.lastIndex = 0
		if (REGEX.CODE_BLOCK.test(lines[cursor])) {
			return this.getTheEnd(lines, cursor, indent) !== false
		} return false
	}
	static tokenize(lines, cursor, indent) {
		const language = lines[cursor].trim().substring(3)
		const footCursor = this.getTheEnd(lines, cursor, indent)

		const body = lines.slice(cursor + 1, footCursor)
			.map(line => line.slice(indent))
			.join("\n")

		return {
			language,
			body,
			cursor: footCursor
		}
	}

	/**
	 * returns HTML for code block
	 *
	 * @param {Object} lexer
	 *
	 * @returns {string}
	 */
	static parse(lexer) {
		let skeleton = `
<pre><code%class>%s</code></pre>`
		if (lexer.language) {
			skeleton = skeleton.replace("%class", ` class='language-${lexer.language}'`)
		} else {
			skeleton = skeleton.replace("%class", "")
		}
		return skeleton.replace("%s", Parser.parseContent(lexer))
	}
}
