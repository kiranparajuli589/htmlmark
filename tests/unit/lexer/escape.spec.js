import { MDP } from "../../mdp.js"


const mdp = new MDP()

describe("escape", () => {
	it("should escape >, <, &, ', \" characters", () => {
		const lines = [
			">",
			"<",
			"&",
			"'",
			"\"",
			"<>&'\""
		]
		expect(mdp.h(lines)).toMatchSnapshot()
	})
	it("should escape inside block elements", () => {
		const lines = [
			"# <>&'\""
		]
		expect(mdp.h(lines)).toMatchSnapshot()
	})
	it("should not escape unescaped characters", () => {
		const lines = [
			"\\# not a heading",
			"\\> not a blockquote",
			"\\* not a list",
			"\\` not code `",
			"\\_ not italic_",
			"\\*\\* not bold**",
			"\\~ not strikethrough~",
			"\\[some](http://example.com) not a link",
			"\\![some](http://example.com) not an image",
			"\\| not a table |"
		]
		expect(mdp.h(lines)).toMatchSnapshot()
	})
})
