import {MDP} from "../../mdp.js"


const mdp = new MDP()


describe("CodeBlock Parsing", () => {
	it("should parse the codeblock", () => {
		const lines = [
			"```js",
			"const a = 1",
			"```"
		]
		const html = mdp.h(lines)
		expect(html).toMatchSnapshot()
	})
	it("should parse the codeblock without the language", () => {
		const lines = [
			"```",
			"const a = 1",
			"```"
		]
		const html = mdp.h(lines)
		expect(html).toMatchSnapshot()
	})
	it("should parse the codeblock with multiple lines", () => {
		const lines = [
			"```js",
			"const a = 1",
			"const b = 2",
			"```"
		]
		const html = mdp.h(lines)
		expect(html).toMatchSnapshot()
	})
	it("should parse the codeblock with multiple lines and a newline", () => {
		const lines = [
			"```js",
			"const a = 1",
			"const b = 2",
			"",
			"const c = 3",
			"```"
		]
		const html = mdp.h(lines)
		expect(html).toMatchSnapshot()
	})
	it("should parse multiple consequetive codeblocks", () => {
		const lines = [
			"```js",
			"const a = 1",
			"```",
			"```js",
			"const b = 2",
			"```"
		]
		const html = mdp.h(lines)
		expect(html).toMatchSnapshot()
	})
	it("should cope with multiple items", () => {
		const lines = [
			"```js",
			"const a = 1",
			"```",
			"some people are funny"
		]
		const html = mdp.h(lines)
		expect(html).toMatchSnapshot()
	})
	it("should parse indent codeblock", () => {
		const lines = [
			"This is a normal paragraph:",
			"",
			"    This is a code block.",
			"",
			"Here is an example of AppleScript:",
			"",
			"    tell application \"Foo\"",
			"    beep",
			"    end tell",
			"",
			"A code block continues until it reaches a line that is not indented",
			"(or the end of the article)."
		]
		const html = mdp.h(lines)
		expect(html).toMatchSnapshot()
	})
})
