import { MDP } from "../../mdp.js"


const mdp = new MDP()


describe("Quote Parsing", () => {
	it("should parse multiline quote with the same depth and indent", () => {
		const lines = [
			"> > > zero f",
			"> > one f",
			">>>",
			"> one",
			"> # two",
			"> > three",
			"> > > four",
			"> > > > d-five",
			"> > # five",
			"> > ## six",
			"> > > > seven",
			"simple para"
		]
		const html = mdp.h(lines)
		expect(html).toMatchSnapshot()
	})
	it("should detect the circular quote", () => {
		const lines = [
			"> one",
			"> > two",
			"> > > three",
			"> > > > four",
			"> > > > > five",
			"> >>>",
			"> >>> four",
			"> >>",
			"> >> three",
			"> >",
			"> > two",
			">",
			"> one"
		]
		const html = mdp.h(lines)
		expect(html).toMatchSnapshot()
	})
	it.each([
		"> quote **one** with *two*",
		"  > quote `four` with ~~five~~",
		"> quote [link-title](link-url) with *two*"
	])("should deep tokenize quote with zero depth", (line) => {
		const html = mdp.h([line])
		expect(html).toMatchSnapshot()
	})
	it.each([
		"> > quote **one** with *two*",
		"  > > > quote `four` with ~~five~~",
		"> > > > quote [link-title](link-url) with *two*"
	])("should deep tokenize quote with multiple depth", (line) => {
		const html = mdp.h([line])
		expect(html).toMatchSnapshot()
	})
	it("should parse the quote with list inside", () => {
		const lines = [
			"> - one",
			"> - two"
		]
		const html = mdp.h(lines)
		expect(html).toMatchSnapshot()
	})
	it("should find the list and codeblock inside", () => {
		const lines = [
			"> ## This is a header.",
			">",
			"> 1.   This is the first list item.",
			"> 2.   This is the second list item.",
			">",
			"> Here's some example code:",
			">",
			">    return shell_exec(\"echo $input | $markdown_script\");"
		]
		const html = mdp.h(lines)
		expect(html).toMatchSnapshot()
	})
	it("greedy newline", () => {
		const lines = [
			">> one",
			">>",
			">>",
			">> here"
		]
		const html = mdp.h(lines)
		expect(html).toMatchSnapshot()
	})
	it("greedy newline in nested form", () => {
		const lines = [
			"",
			"> This is the first level of quoting.",
			">",
			"> > This is nested blockquote.",
			">",
			"> Back to the first level.",
			""
		]
		const html = mdp.h(lines)
		expect(html).toMatchSnapshot()
	})
})
