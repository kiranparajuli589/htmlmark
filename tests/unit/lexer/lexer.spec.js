import Lexer from "../../../lib/lexer/index.js"
import TOKENS from "../../../lib/util/tokens.js"
import { commonTokensList } from "../../fixtures/commTokens.js"


describe("lexer", () => {
	describe("hr line", () => {
		it.each([
			"---",
			"***"
		])("should parse the hr line: %s", (line) => {
			const lines = [
				line
			]
			const lexer = new Lexer(lines)
			const tokens = lexer.run()
			expect(tokens[0].type).toBe(TOKENS.HR_LINE)
		})
	})
	describe("common tokens", () => {
		it.each(commonTokensList)("should parse the common tokens: '%s'", (line) => {
			const lines = [line]
			const lexer = new Lexer(lines)
			const tokens = lexer.run()
			expect(tokens).toMatchSnapshot()
		})
		it.each(commonTokensList)("should parse the common tokens with indentation", (line) => {
			const indent = " ".repeat(4)
			const lines = [indent + line]
			const lexer = new Lexer(lines)
			const tokens = lexer.run()
			expect(tokens[0].indent).toBe(4)
		})
		it("should allow underlined heading", () => {
			const lines = [
				"Heading 1",
				"======",
				"Heading 2",
				"------",
				"Normal text"
			]
			const lexer = new Lexer(lines)
			const tokens = lexer.run()
			expect(tokens).toMatchSnapshot()
		})
	})
	describe("link variables", () => {
		it("should allow the link variables", () => {
			const lines = [
				"[google]: https://www.google.com/",
				"",
				"If you want to search for something on the web, [google] is a nice place.",
				"",
				"You can also use [google] to host some stuff and make a great app!"
			]
			const lexer = new Lexer(lines)
			const tokenizedContent = lexer.run()
			expect(tokenizedContent).toMatchSnapshot()
		})
	})
})
