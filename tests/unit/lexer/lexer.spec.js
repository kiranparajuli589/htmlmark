import { Lexer } from "../../../lib/lexer/index.js"
import { TOKENS } from "../../../lib/util/tokens.js"
import { commonTokensList } from "../../fixtures/commTokens.js"


describe("lexer", () => {
	describe("hr line", () => {
		it("should parse the hr line", () => {
			const lines = [
				"---"
			]
			const lexer = new Lexer(lines)
			const tokens = lexer.run()
			expect(tokens[0].type).toBe(TOKENS.HR_LINE)
		})
		it("should merge multiple consecutive hr lines into one", () => {
			const lines = [
				"---",
				"---"
			]
			const lexer = new Lexer(lines)
			const tokens = lexer.run()
			expect(tokens.length).toBe(1)
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
})