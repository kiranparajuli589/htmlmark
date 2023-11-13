import Lexer from "../../../lib/lexer/index.js"


describe("codeblock", () => {
	it("should parse the codeblock", () => {
		const lines = [
			"```js",
			"const a = 1",
			"```"
		]
		const lexer = new Lexer(lines)
		const tokens = lexer.run()
		expect(tokens).toMatchSnapshot()
	})
	it("should parse the codeblock without the language", () => {
		const lines = [
			"```",
			"const a = 1",
			"```"
		]
		const lexer = new Lexer(lines)
		const tokens = lexer.run()
		expect(tokens).toMatchSnapshot()
	})
	it("should parse the codeblock with multiple lines", () => {
		const lines = [
			"```js",
			"const a = 1",
			"const b = 2",
			"```"
		]
		const lexer = new Lexer(lines)
		const tokens = lexer.run()
		expect(tokens).toMatchSnapshot()
	})
	it("should parse the codeblock with multiple lines and a newline", () => {
		const lines = [
			"```js",
			"const a = 1",
			"  const b = 2",
			"",
			"const c = 3",
			"```"
		]
		const lexer = new Lexer(lines)
		const tokens = lexer.run()
		expect(tokens).toMatchSnapshot()
	})
	it("should parse multiple consecutive codeblocks", () => {
		const lines = [
			"```js",
			"const a = 1",
			"```",
			"```js",
			"const b = 2",
			"```"
		]
		const lexer = new Lexer(lines)
		const tokens = lexer.run()
		expect(tokens).toMatchSnapshot()
	})
	it("should cope with multiple items", () => {
		const lines = [
			"```js",
			"const a = 1",
			"```",
			"some people are funny"
		]
		const lexer = new Lexer(lines)
		const tokens = lexer.run()
		expect(tokens).toMatchSnapshot()
	})
	it("should set incomplete codeblock as a code block", () => {
		const lines = [
			"some line",
			"    ```js",
			"    const a = 1",
			"    const b = 2",
			"here again" // broken indentation
		]
		const lexer = new Lexer(lines)
		const tokens = lexer.run()
		expect(tokens).toMatchSnapshot()
	})
	it("should detect mis-indented closing codeblock", () => {
		const lines = [
			"```js",
			"const a = 1",
			"const b = 2",
			"const c = 3",
			"    ```"
		]
		const lexer = new Lexer(lines)
		const tokens = lexer.run()
		expect(tokens).toMatchSnapshot()
	})
	it("should detect acceptable indent for closing codeblock", () => {
		const lines = [
			"```js",
			"const a = 1",
			"const b = 2",
			"const c = 3",
			"   ```"
		]
		const lexer = new Lexer(lines)
		const tokens = lexer.run()
		expect(tokens).toMatchSnapshot()
	})
	it("should not be broken with acceptable wrong indent", () => {
		const lines = [
			"   ```",
			"abcd",
			"   ```"
		]
		const lexer = new Lexer(lines)
		const tokens = lexer.run()
		expect(tokens).toMatchSnapshot()
	})
	it("should cope with empty body", () => {
		const lines = [
			"```js",
			"```"
		]
		const lexer = new Lexer(lines)
		const tokens = lexer.run()
		expect(tokens).toMatchSnapshot()
	})
	it("should be set just with indentation bigger or equals to 4 at top", () => {
		const lines = [
			"    one",
			"          two",
			"    three",
			"four"
		]
		const lexer = new Lexer(lines)
		const tokens = lexer.run()
		expect(tokens).toMatchSnapshot()
	})
	it("should be set just with indentation bigger or equals to 4 below newline", () => {
		const lines = [
			"zero one two",
			"",
			"    one",
			"          two",
			"    three",
			"four"
		]
		const lexer = new Lexer(lines)
		const tokens = lexer.run()
		expect(tokens).toMatchSnapshot()
	})
	it("should be set just with indentation bigger or equals to 4 but consecutive with other tokens", () => {
		const lines = [
			"zero one two",
			"    one",
			"          two",
			"    three",
			"four"
		]
		const lexer = new Lexer(lines)
		const tokens = lexer.run()
		expect(tokens).toMatchSnapshot()
	})
	it("should be work just fine within a list item", () => {
		const testString = `
4.  What is the exact rule for determining when list items get
\twrapped in \`<p>\` tags?  Can a list be partially "loose" and partially
\t"tight"?  What should we do with a list like this?

\t\t\`\`\` markdown
\t\t1. one

\t\t2. two
\t\t3. three
\t\t\`\`\`
`
		const lines = testString.split("\n")
		const lexer = new Lexer(lines)
		const tokens = lexer.run()
		expect(tokens).toMatchSnapshot()
	})
	it("should remove the link refs inside codeblock but do not change the usage", () => {
		const lines = `\`\`\` markdown
[foo]: /url1
[foo]: /url2

[foo][]
\`\`\``
		const lexer = new Lexer(lines.split("\n"))
		const tokens = lexer.run()
		expect(tokens).toMatchSnapshot()
	})
})
