import { MDP } from "../../../lib/index.js"


describe("Table Parsing", () => {
	describe("is not a table", () => {
		it("only header", () => {
			const html = MDP.h([
				"| column 1 | column 2 |"
			])
			expect(html).toMatchSnapshot()
		})
		it("only header and separator", () => {
			const html = MDP.h([
				"| column 1 | column 2 |",
				"|---|---|"
			])
			expect(html).toMatchSnapshot()
		})
		it("false separator", () => {
			const html = MDP.h([
				"| column 1 | column 2 |",
				"| - | - |",
				"| row 1 c1 | row 1 c2 |"
			])
			expect(html).toMatchSnapshot()
		})
		it("not consistent cell count", () => {
			const lines = [
				"| column 1 | column 2 |",
				"| --- |",
				"| row 1 c1 | row 1 c2 |"
			]
			const html = MDP.h(lines)
			expect(html).toMatchSnapshot()
		})
		it("other tokens in between 1", () => {
			const html = MDP.h([
				"| column 1 | column 2 |",
				"",
				"|---|---|",
				"| row 1 c1 | row 1 c2 |"
			])
			expect(html).toMatchSnapshot()
		})
		it("other tokens in between 2", () => {
			const html = MDP.h([
				"| column 1 | column 2 |",
				"|---|---|",
				"",
				"| row 1 c1 | row 1 c2 |"
			])
			expect(html).toMatchSnapshot()
		})
		it("other tokens in between 3", () => {
			const html = MDP.h([
				"| column 1 | column 2 |",
				"|---|---|",
				"| row 1 c1 | row 1 c2 |",
				"",
				"| row 2 c1 | row 2 c2 |"
			])
			expect(html).toMatchSnapshot()
		})
	})
	describe("table indent", () => {
		it("different indent header -> separator", () => {
			const html = MDP.h([
				"| column 1 | column 2 |",
				"    |---|---|",
				"| row 1 c1 | row 1 c2 |"
			])
			expect(html).toMatchSnapshot()
		})

		it("different indent header, separator -> body row", () => {
			const html = MDP.h([
				"    | column 1 | column 2 |",
				"    |---|---|",
				"| row 1 c1 | row 1 c2 |"
			])
			expect(html).toMatchSnapshot()
		})

		it("the indented table", () => {
			const html = MDP.h([
				"  | column 1 | column 2 |",
				"  |---|---|",
				"  | row 1 c1 | row 1 c2 |"
			])
			expect(html).toMatchSnapshot()
		})

		it("acceptable indent should not break the table 1", () => {
			const html = MDP.h([
				"  | column 1 | column 2 |",
				"  |---|---|",
				"  | row 1 c1 | row 1 c2 |",
				"| row 2 c1 | row 2 c2 |"
			])
			expect(html).toMatchSnapshot()
		})
		it("indent should break the table 2", () => {
			const html = MDP.h([
				"| column 1 | column 2 |",
				"|---|---|",
				"| row 1 c1 | row 1 c2 |",
				"    | column 1 | column 2 |",
				"    |---|---|",
				"    | row 1 c1 | row 1 c2 |"
			])
			expect(html).toMatchSnapshot()
		})
	})

	describe("table cell count", () => {
		it("cell count should break the table 1", () => {
			const html = MDP.h([
				"| column 1 | column 2 |",
				"|---|---|",
				"| row 1 c1 | row 1 c2 |",
				"| row 2 c1 |"
			])
			expect(html).toMatchSnapshot()
		})
		it("cell count should break the table 2", () => {
			const html = MDP.h([
				"| column 1 | column 2 |",
				"|---|---|",
				"| row 1 c1 | row 1 c2 |",
				"| column 1 |",
				"|---|",
				"| row 1 c1 |"
			])
			expect(html).toMatchSnapshot()
		})
	})
	describe("table heading-body separator", () => {
		it.each([
			"|-------|-------|",
			"|:-------:|:---------:|"
		])("should parse a table", (line) => {
			const html = MDP.h([
				"| column 1 | column 2 |",
				line,
				"| row 1 c1 | row 1 c2 |",
				"| row 2 c1 | row 2 c2 |"
			])
			expect(html).toMatchSnapshot()
		})
	})
})