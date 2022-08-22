import { Lexer } from "../../../lib/lexer/index.js"
import { TOKENS } from "../../../lib/util/tokens.js"


describe("table", () => {
	describe("is not a table", () => {
		it("only header", () => {
			const lexer = new Lexer([
				"| column 1 | column 2 |"
			])
			const tokens = lexer.run()
			expect(tokens).toMatchSnapshot()
		})
		it("only header and separator", () => {
			const lexer = new Lexer([
				"| column 1 | column 2 |",
				"|---|---|"
			])
			const tokens = lexer.run()
			expect(tokens).toMatchSnapshot()
		})
		it("false separator", () => {
			const lexer = new Lexer([
				"| column 1 | column 2 |",
				"| --- |--|",
				"| row 1 c1 | row 1 c2 |"
			])
			const tokens = lexer.run()
			expect(tokens).toMatchSnapshot()
		})
		it("not consistent cell count", () => {
			const lines = [
				"| column 1 | column 2 |",
				"| --- |",
				"| row 1 c1 | row 1 c2 |"
			]
			const lexer = new Lexer(lines)
			const tokens = lexer.run()
			expect(tokens.length).toBe(1)
			expect(tokens[0].type).toBe(TOKENS.PARAGRAPH)
		})
		it("other tokens in between 1", () => {
			const lexer = new Lexer([
				"| column 1 | column 2 |",
				"",
				"|---|---|",
				"| row 1 c1 | row 1 c2 |"
			])
			expect(lexer.run()).toMatchSnapshot()
		})
		it("other tokens in between 2", () => {
			const lexer = new Lexer([
				"| column 1 | column 2 |",
				"|---|---|",
				"",
				"| row 1 c1 | row 1 c2 |"
			])
			expect(lexer.run()).toMatchSnapshot()
		})
		it("other tokens in between 3", () => {
			const lexer = new Lexer([
				"| column 1 | column 2 |",
				"|---|---|",
				"| row 1 c1 | row 1 c2 |",
				"",
				"| row 2 c1 | row 2 c2 |"
			])
			expect(lexer.run()).toMatchSnapshot()
		})
	})
	describe("indentation", () => {
		it("different indent header -> separator", () => {
			const lexer = new Lexer([
				"| column 1 | column 2 |",
				"    |---|---|",
				"| row 1 c1 | row 1 c2 |"
			])
			expect(lexer.run()).toMatchSnapshot()
		})

		it("different indent header, separator -> body row", () => {
			const lexer = new Lexer([
				"    | column 1 | column 2 |",
				"    |---|---|",
				"| row 1 c1 | row 1 c2 |"
			])
			expect(lexer.run()).toMatchSnapshot()
		})

		it("the indented table", () => {
			const lexer = new Lexer([
				"  | column 1 | column 2 |",
				"  |---|---|",
				"  | row 1 c1 | row 1 c2 |"
			])
			expect(lexer.run()).toMatchSnapshot()
		})

		it("indent should break the table 1", () => {
			const lexer = new Lexer([
				"| column 1 | column 2 |",
				"|---|---|",
				"| row 1 c1 | row 1 c2 |",
				"    | row 2 c1 | row 2 c2 |"
			])
			expect(lexer.run()).toMatchSnapshot()
		})
		it("indent should break the table 2", () => {
			const lexer = new Lexer([
				"| column 1 | column 2 |",
				"|---|---|",
				"| row 1 c1 | row 1 c2 |",
				"    | column 1 | column 2 |",
				"    |---|---|",
				"    | row 1 c1 | row 1 c2 |"
			])
			expect(lexer.run()).toMatchSnapshot()
		})
	})
	describe("cell count", () => {
		it("cell count should break the table 1", () => {
			const lexer = new Lexer([
				"| column 1 | column 2 |",
				"|---|---|",
				"| row 1 c1 | row 1 c2 |",
				"| row 2 c1 |"
			])
			expect(lexer.run()).toMatchSnapshot()
		})
		it("cell count should break the table 2", () => {
			const lexer = new Lexer([
				"| column 1 | column 2 |",
				"|---|---|",
				"| row 1 c1 | row 1 c2 |",
				"| column 1 |",
				"|---|",
				"| row 1 c1 |"
			])
			expect(lexer.run()).toMatchSnapshot()
		})
	})
	describe("heading body separator", () => {
		it.each([
			"|-------|-------|",
			"|:-------:|:---------:|",
			"| :-------: | :---------: |",
			"| ------- | --------- |"
		])("should parse a table with separator: '%s'", (line) => {
			const lexer = new Lexer([
				"| column 1 | column 2 |",
				line,
				"| row 1 c1 | row 1 c2 |",
				"| row 2 c1 | row 2 c2 |"
			])
			expect(lexer.run()).toMatchSnapshot()
		})
		it.each([
			"|-|-|",
			"|:|:|",
			"| :|: |",
			"|-| |",
			"|-|:|",
			"|-|: |",
			"|:|-|",
			"| :|-|"
		])("should not parse as table with invalid separator: '%s'", (line) => {
			const lexer = new Lexer([
				"| column 1 | column 2 |",
				line,
				"| row 1 c1 | row 1 c2 |"
			])
			const lexed = lexer.run()
			expect(lexed.length).toBe(1)
			expect(lexed.at(0).type).toBe(TOKENS.PARAGRAPH)
		})
	})
})
