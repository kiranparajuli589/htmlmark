import {MDP} from "../../mdp.js"


const mdp = new MDP()


describe("Table Parsing", () => {
	describe("is not a table", () => {
		it("only header", () => {
			const html = mdp.h([
				"| column 1 | column 2 |"
			])
			expect(html).toMatchSnapshot()
		})
		it("only header and separator", () => {
			const html = mdp.h([
				"| column 1 | column 2 |",
				"|---|---|"
			])
			expect(html).toMatchSnapshot()
		})
		it("false separator", () => {
			const html = mdp.h([
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
			const html = mdp.h(lines)
			expect(html).toMatchSnapshot()
		})
		it("other tokens in between 1", () => {
			const html = mdp.h([
				"| column 1 | column 2 |",
				"",
				"|---|---|",
				"| row 1 c1 | row 1 c2 |"
			])
			expect(html).toMatchSnapshot()
		})
		it("other tokens in between 2", () => {
			const html = mdp.h([
				"| column 1 | column 2 |",
				"|---|---|",
				"",
				"| row 1 c1 | row 1 c2 |"
			])
			expect(html).toMatchSnapshot()
		})
		it("other tokens in between 3", () => {
			const html = mdp.h([
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
			const html = mdp.h([
				"| column 1 | column 2 |",
				"    |---|---|",
				"| row 1 c1 | row 1 c2 |"
			])
			expect(html).toMatchSnapshot()
		})

		it("different indent header, separator -> body row", () => {
			const html = mdp.h([
				"    | column 1 | column 2 |",
				"    |---|---|",
				"| row 1 c1 | row 1 c2 |"
			])
			expect(html).toMatchSnapshot()
		})

		it("the indented table", () => {
			const html = mdp.h([
				"  | column 1 | column 2 |",
				"  |---|---|",
				"  | row 1 c1 | row 1 c2 |"
			])
			expect(html).toMatchSnapshot()
		})

		it("acceptable indent should not break the table 1", () => {
			const html = mdp.h([
				"  | column 1 | column 2 |",
				"  |---|---|",
				"  | row 1 c1 | row 1 c2 |",
				"| row 2 c1 | row 2 c2 |"
			])
			expect(html).toMatchSnapshot()
		})
		it("indent should break the table 2", () => {
			const html = mdp.h([
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
			const html = mdp.h([
				"| column 1 | column 2 |",
				"|---|---|",
				"| row 1 c1 | row 1 c2 |",
				"| row 2 c1 |"
			])
			expect(html).toMatchSnapshot()
		})
		it("cell count should break the table 2", () => {
			const html = mdp.h([
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
			const html = mdp.h([
				"| column 1 | column 2 |",
				line,
				"| row 1 c1 | row 1 c2 |",
				"| row 2 c1 | row 2 c2 |"
			])
			expect(html).toMatchSnapshot()
		})
	})
	describe("pipe escaping", () => {
		it("should escape the pipe char inside table heading and or cell", () => {
			const lines = [
				"| one | two\\|three |",
				"| -- | -- |",
				"| one | two\\|five |"
			]
			const html = mdp.h(lines)
			expect(html).toMatchSnapshot()
		})
	})
})
