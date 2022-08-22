import { Lexer } from "../../../lib/lexer/index.js"
import { TOKENS } from "../../../lib/util/tokens.js"


describe("newline", () => {
	it.each([
		[""],
		["\n"],
		["", "\n"]

	])("should not include the top empty lines", (lines) => {
		const lexer = new Lexer(lines)
		const tokens = lexer.run()
		expect(tokens).toEqual([])
	})
	it.each(["", "\n"])("should include the empty line after some content", (eLine) => {
		const lines = [
			"some plain text",
			eLine
		]
		const lexer = new Lexer(lines)
		const tokens = lexer.run()
		expect(tokens.length).toBe(2)
		expect(tokens[1].type).toBe(TOKENS.NEW_LINE)
	})
	it("should combine multiple consequent new lines to a single one", () => {
		const lines = [
			"some plain text",
			"\n",
			"",
			"some more plain text"
		]
		const lexer = new Lexer(lines)
		const tokens = lexer.run()
		expect(tokens.length).toBe(3)
		expect(tokens[1].type).toBe(TOKENS.NEW_LINE)
	})
})
