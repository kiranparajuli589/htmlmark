import {MDP} from "../../mdp.js"


const mdp = new MDP()


describe("List Parsing", () => {
	it("should tokenize a valid ordered list", () => {
		const lines = [
			"1. item **1**",
			"1. item [link](link-url)",
			"1. item 3 `code item`"
		]
		const html = mdp.h(lines)
		expect(html).toMatchSnapshot()
	})
	it("should tokenize a valid un-ordered list", () => {
		const lines = [
			"- item **1**",
			"- item [link](link-url)",
			"- item 3 `code item`"
		]
		const html = mdp.h(lines)
		expect(html).toMatchSnapshot()
	})
	it("should detect list indent", () => {
		const lines = [
			"  - item **1**",
			"  - item [link](link-url)",
			"  - item 3 `code item`"
		]
		const html = mdp.h(lines)
		expect(html).toMatchSnapshot()
	})
	it("indent should break the list", () => {
		const lines = [
			"- item **1**",
			"- item [link](link-url)",
			"    - item 3 `code item`",
			"        - item 4",
			"    - item 3 `code item`"
		]
		const html = mdp.h(lines)
		expect(html).toMatchSnapshot()
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
		const html = mdp.h(lines)
		expect(html).toMatchSnapshot()
	})
	it("should parse the indented codeblock inside", () => {
		const lines = [
			"To put a code block within a list item, the code block needs",
			"to be indented *twice* -- 8 spaces or two tabs:",
			"*   A list item with a code block:",
			"",
			"        <code goes here>",
			"        <code goes here>",
			"        <code goes here>",
			"",
			"### Code Blocks"
		]
		const html = mdp.h(lines)
		expect(html).toMatchSnapshot()
	})
	it("should allow empty list item", () => {
		const lines = [
			"- one",
			"-",
			"- two"
		]
		const html = mdp.h(lines)
		expect(html).toMatchSnapshot()
	})
	it.each([
		{ lines: [
			"- one",
			"-",
			"- two"
		] },
		{ lines: [
			"-",
			"- one",
			"- two"
		] },
		{ lines: [
			"- one",
			"- two",
			"-"
		] }
	])("should parse a list with an empty list item", ({ lines }) => {
		const html = mdp.h(lines)
		expect(html).toMatchSnapshot()
	})
	it("should parse a spaced list", () => {
		const lines = [
			"",
			"- here we go with a list item",
			"",
			"- another list item is here",
			"",
			"- next list item is on the fly"
		]
		const html = mdp.h(lines)
		expect(html).toMatchSnapshot()
	})
})
