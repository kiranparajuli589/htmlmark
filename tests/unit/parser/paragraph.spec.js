import { MDP } from "../../../lib/mdp.js"

const mdp = new MDP()


describe("Paragraph Parsing", () => {
	it.each([
		"some normal and **bold with * gem** but pure *italics* is alos there baby now ~~coming~~hola amigos~~strike~~ wooo lala what about blazing *********here baby ~~~~~~~~~baby `baby```",
		"a paragraph of <u>words</u> `first code` normal text here `code body` *first italics* here me crying *italic body* here me crying **first bolds** some normal again **bold body** [Kiran Parajuli](https://kiranparajuli.com.np) ~~strikes body~~ here some",
		"now with __underlined text__ within some ___underlined_text___",
		"a **bold and *italics* text**",
		"no \\* mans \\* land",
		"a **bold** text",
		"an *italics* text",
		"a ****bold**** text",
		"an ***italics*** text",
		"an *italics and **bold** text* here",
		"an *italics with\\* asterisk* inside",
		"lets check for `a code` inside and code ``with multiple`` ticks",
		"but will it `find a **bold *and* italics** inside` the code",
		"checkout this _cool italics_ here",
		"now **stars _in_ the** wonderland",
		"how are ~~~strikes _in_ the~~~ _wonderland_",
		"i ~~~am now~~~ unhappy",
		"a ~~~~strike~~~~~~~ here",
		"new ~~~strike~~ with beauty",
		"pool of a ~~~~~~~~strike~~~~~~~",
		"a clean [link](http://localhost 'tooltip') is here",
		"beautiful ![image](link 'one' 50 60) is here now.",
		"beautiful ![image](link 'one' 50) is here now.",
		"beautiful ![image](link 'one') is here now.",
		"beautiful ![image](link) is here now.",
		"a link [with **bold** text](https://seeme) lets see",
		"an empty [link] reference is here",
		"but a link [kiran](https://kiran.me 'hero') with tooltip is very amazing"
	])("should be deep tokenized: %s", (line) => {
		const lines = [line]
		const lexerData = mdp.h(lines)
		expect(lexerData).toMatchSnapshot()
	})
	it("should have greedy newlines", () => {
		const lines = [
			"",
			"This is the first level of quoting.",
			"",
			"This is nested blockquote.",
			"",
			"Back to the first level."
		]
		const lexerData = mdp.h(lines)
		expect(lexerData).toMatchSnapshot()
	})
	it("should merge consecutive paragraph not separated by other tokens", () => {
		const lines = [
			"abc `def` *ghi",
			"jkl* mno **pqr*** stu"
		]
		const lexerData = mdp.h(lines)
		expect(lexerData).toMatchSnapshot()
	})
	it("should be separated with other tokens", () => {
		const lines = [
			"abc",
			"# one `two` three",
			"def"
		]
		const lexerData = mdp.h(lines)
		expect(lexerData).toMatchSnapshot()
	})
	it("a valid link reference", () => {
		const lines = [
			"this is [google] link",
			"[google]: https://google.com"
		]
		const lexerData = mdp.h(lines)
		expect(lexerData).toMatchSnapshot()
	})
	it("a valid link reference with text", () => {
		const lines = [
			"this is [toggle][google] link",
			"[google]: https://google.com"
		]
		const lexerData = mdp.h(lines)
		expect(lexerData).toMatchSnapshot()
	})
	it("should ignore the escaped special characters", () => {
		const lines = [
			"this is \\[google] link",
			"",
			// eslint-disable-next-line no-useless-escape
			"this is a normal \\* asterisk \\* here again"
		]
		const lexerData = mdp.h(lines)
		expect(lexerData).toMatchSnapshot()
	})
	describe("escape", () => {
		it("should escape inside code", () => {
			const lines = [
				"one `two<` three"
			]
			const lexerData = mdp.h(lines)
			expect(lexerData).toMatchSnapshot()
		})
	})
	describe("line breaks", () => {
		it("should break the line if end with two or spaces", () => {
			const lines = [
				"one two three   ",
				"four five six"
			]
			const lexerData = mdp.h(lines)
			expect(lexerData).toMatchSnapshot()
		})
		it("should not break the line if end with less than two spaces", () => {
			const lines = [
				"one two three ",
				"four five six"
			]
			const lexerData = mdp.h(lines)
			expect(lexerData).toMatchSnapshot()
		})
	})
	describe("html", () => {
		it("should detect html in the paragraph", () => {
			const lines = [
				"[abc](def) ",
				"this is a link <a href='https://google.com'>google</a> here",
				"",
				"this is a <u>underlined</u> text here",
				""
			]
			const lexerData = mdp.h(lines)
			expect(lexerData).toMatchSnapshot()
		})
		it("should detect html with attributes", () => {
			const lines = `
Markdown: Syntax
================

<ul id="ProjectSubmenu">
    <li><a href="/projects/markdown/" title="Markdown Project Page">Main</a></li>
    <li><a href="/projects/markdown/basics" title="Markdown Basics">Basics</a></li>
    <li><a class="selected" title="Markdown Syntax Documentation">Syntax</a></li>
    <li><a href="/projects/markdown/license" title="Pricing and License Information">License</a></li>
    <li><a href="/projects/markdown/dingus" title="Online Markdown Web Form">Dingus</a></li>
</ul>
			`
			const lexerData = mdp.h(lines.split("\n"))
			expect(lexerData).toMatchSnapshot()
		})
	})
})
