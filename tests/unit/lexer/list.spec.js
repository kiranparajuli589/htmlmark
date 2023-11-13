import Lexer from "../../../lib/lexer/index.js"


describe("list", () => {
	it("should tokenize a valid ordered list", () => {
		const lines = [
			"1. item **1**",
			"1. item [link](link-url)",
			"1. item 3 `code item`"
		]
		const lexer = new Lexer(lines)
		const tokens = lexer.run()
		expect(tokens).toMatchSnapshot()
	})
	it("should tokenize a valid un-ordered list", () => {
		const lines = [
			"- item **1**",
			"- item [link](link-url)",
			"- item 3 `code item`"
		]
		const lexer = new Lexer(lines)
		const tokens = lexer.run()
		expect(tokens).toMatchSnapshot()
	})
	it("should manage the list indent", () => {
		const lines = [
			"  - item **1**",
			"  - item [link](link-url)",
			"  - item 3 `code item`"
		]
		const lexer = new Lexer(lines)
		const tokenizedContent = lexer.run()
		expect(tokenizedContent[0].indent).toEqual(0)
	})
	it("less than 4 indent should not break the list", () => {
		const lines = [
			"  - item **1**",
			"  - item [link](link-url)",
			"- item 3 `code item`",
			"- item 4"
		]
		const lexer = new Lexer(lines)
		const tokenizedContent = lexer.run()
		expect(tokenizedContent).toMatchSnapshot()
	})
	it("should tokenize the nested list", () => {
		const lines = [
			"- item **1**",
			"- item [link](link-url)",
			"    - item 3 `code item`",
			"        - item 4",
			"    - item 5 ~~strike~~"
		]

		const lexer = new Lexer(lines)
		const tokenizedContent = lexer.run()
		expect(tokenizedContent).toMatchSnapshot()
	})
	it("should tokenize list combination", () => {
		const lines = [
			"- one",
			"- two",
			"1. one",
			"2. two",
			"- [ ] c empty",
			"- [x] c checked",
			"1. [ ] c empty",
			"1. [x] c checked"
		]
		const lexer = new Lexer(lines)
		const tokens = lexer.run()
		expect(tokens).toMatchSnapshot()
	})
	it("should allow lazy lexing", () => {
		const lines = [
			"- [x] list *item* one",
			"omg this is merged with the above line"
		]
		const lexer = new Lexer(lines)
		const tokens = lexer.run()
		expect(tokens).toMatchSnapshot()
	})
	it("should allow lazy unless there is two line separator", () => {
		const lines = [
			"- one",
			"            two",
			"three",
			"",
			"	   ```",
			"	   here",
			"	   four",
			"	   ```",
			"",
			"- two",
			"- three"
		]
		const lexer = new Lexer(lines)
		const tokens = lexer.run()
		expect(tokens).toMatchSnapshot()
	})
	it("Should allow indented codeblock inside", () => {
		const lines = [
			"To put a code block within a list item, the code block needs",
			"to be indented *twice* -- 8 spaces or two tabs:",
			"*   A list item with a code block:",
			"",
			"        <code goes here>",
			"",
			"### Code Blocks"
		]
		const lexer = new Lexer(lines)
		const tokens = lexer.run()
		expect(tokens).toMatchSnapshot()
	})
	it.each([
		{ l: [
			"- one",
			"-",
			"- two"
		] },
		{ l: [
			"-",
			"- one",
			"- two"
		] },
		{ l: [
			"- one",
			"- two",
			"-"
		] }
	])("should tokenize an empty list item", ({ l }) => {
		const lexer = new Lexer(l)
		const tokens = lexer.run()
		expect(tokens).toMatchSnapshot()
	})
	it("should tokenize a list with variable spaces beforehand", () => {
		const lines = `
  - item **1**
  - one
- two
- three
`
		const lexer = new Lexer(lines.split("\n"))
		const tokens = lexer.run()
		expect(tokens).toMatchSnapshot()
	})
	it("should cope with tabbed indentations", () => {
		const lines = `3.  Is a blank line needed before an indented code block?
\t\t(\`Markdown.pl\` requires it, but this is not mentioned in the
\t\tdocumentation, and some implementations do not require it.)

\t\t\`\`\` markdown
\t\tparagraph
\t\t\t\tcode?
\t\t\`\`\`

5.  Can list markers be indented?  Can ordered list markers be right-aligned?

\t\t\`\`\` markdown
\t\t 8. item 1
\t\t 9. item 2
\t\t10. item 2a
\t\t\`\`\`

This is a paragraph.
`
		const lexer = new Lexer(lines.split("\n"))
		const tokens = lexer.run()
		expect(tokens).toMatchSnapshot()
	})
})
