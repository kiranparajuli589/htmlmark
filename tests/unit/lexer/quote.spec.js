import Lexer from "../../../lib/lexer/index.js"


describe("quote", () => {
	it("should chill with big quote head", () => {
		const lines = [
			"> > > three hit",
			"> > two hit",
			">",
			">",
			"> > two",
			"> > # h-two",
			"> > > three",
			"> > > > four",
			"some"
		]
		const lexer = new Lexer(lines)
		const tokens = lexer.run()
		expect(tokens).toMatchSnapshot()
	})
	it("should lex multiline quote with the circular depth", () => {
		const lines = [
			"> one",
			"> > two",
			"> > > three",
			"> > > > four",
			"> > >",
			">>> r_three",
			"> >",
			"> > r_two",
			">",
			"> r_one"
		]
		const lexer = new Lexer(lines)
		const tokens = lexer.run()
		expect(tokens).toMatchSnapshot()
	})
	it.each([
		{ quote: "> quote 1", expectedDepth: 1 },
		{ quote: "> > quote 2", expectedDepth: 2 },
		{ quote: "> > > quote 3", expectedDepth: 3 },
		{ quote: "> > > > quote 4", expectedDepth: 4 },
		{ quote: "> > > > > quote 5", expectedDepth: 5 }
	])("should detect the quote depth", ({ quote, expectedDepth }) => {
		const lexer = new Lexer([quote])
		const tokenizedContent = lexer.run()
		expect(tokenizedContent[0].depth).toEqual(expectedDepth)
	})
	it.each([
		"> quote **one** with *two*",
		"  > quote `four` with ~~five~~",
		"> quote [link-title](link-url) with *two*",
		"> > quote **one** with *two*",
		"",
		" > > > quote `four` with ~~five~~",
		"> > > > quote [link-title](link-url) with *two*"
	])("should deep tokenize quote '%s'", (line) => {
		const lexer = new Lexer([line])
		const tokenizedContent = lexer.run()
		expect(tokenizedContent).toMatchSnapshot()
	})
	it("should allow laziness for plain paragraph", () => {
		const lines = [
			"> one quote",
			"> two quote",
			"three quote"
		]
		const lexer = new Lexer(lines)
		const tokenizedContent = lexer.run()
		expect(tokenizedContent).toMatchSnapshot()
	})
	it("should split with new lines in between", () => {
		const lines = [
			"> one quote",
			"",
			"> two quote",
			"three quote"
		]
		const lexer = new Lexer(lines)
		const tokenizedContent = lexer.run()
		expect(tokenizedContent).toMatchSnapshot()
	})
	it("should split with heading in between", () => {
		const lines = [
			"> one quote",
			"> two quote",
			"# three quote"
		]
		const lexer = new Lexer(lines)
		const tokenizedContent = lexer.run()
		expect(tokenizedContent).toMatchSnapshot()
	})
	it("should leave separators", () => {
		const lines = [
			"> one",
			"> # two",
			">",
			">",
			">",
			"> three"
		]
		const lexer = new Lexer(lines)
		const tokenizedContent = lexer.run()
		expect(tokenizedContent).toMatchSnapshot()
	})
	it.each([
		{ lines: [
			"> one",
			"> # two",
			"> three"
		] },
		{ lines: [
			"> # one",
			"> two",
			"> three"
		] }
	])("should not be lazy with heading", ({ lines }) => {
		const lexer = new Lexer(lines)
		const tokenizedContent = lexer.run()
		expect(tokenizedContent).toMatchSnapshot()
	})
	describe("list inside", () => {
		it("should identify list inside the quote", () => {
			const lines = [
				"> - one",
				"> - two"
			]
			const lexer = new Lexer(lines)
			const tokenizedContent = lexer.run()
			expect(tokenizedContent).toMatchSnapshot()
		})
		it("should identify list inside with single separator in between", () => {
			const lines = [
				"> - one",
				">",
				"> - two"
			]
			const lexer = new Lexer(lines)
			const tokenizedContent = lexer.run()
			expect(tokenizedContent).toMatchSnapshot()
		})
		it("should identify list inside with multiple separator in between", () => {
			const lines = [
				"> - one",
				">",
				">",
				"> - two"
			]
			const lexer = new Lexer(lines)
			const tokenizedContent = lexer.run()
			expect(tokenizedContent).toMatchSnapshot()
		})
		it("should include a braced codeblock inside", () => {
			const lines = [
				"> normal text",
				"> ```",
				"> code goes here",
				"> ```",
				"> normal text again"
			]
			const lexer = new Lexer(lines)
			const tokenizedContent = lexer.run()
			expect(tokenizedContent).toMatchSnapshot()
		})
	})
})
