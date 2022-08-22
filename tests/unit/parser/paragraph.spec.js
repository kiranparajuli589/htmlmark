import { MDP } from "../../../lib/index.js"


describe("Paragraph Parsing", () => {
	it.each([
		"some normal and **bold with * gem** but pure *italics* is alos there baby now ~~coming~~hola amigons~~strike~~ wooo lala what about blazing *********here baby ~~~~~~~~~baby `baby```[[[[[[[[[[[[[[[l]]]]int](href)[link](href)``````````",
		"a paragraph of <u>words</u> `first code` normal text here `code body` *first italics* here me crying *italic body* here me crying **first bolds** some normal again **bold body** [Kiran Parajuli](https://kiranparajuli.com.np) ~~strikes body~~ here some",
		"now with __underlined text__ within some ___underl_ined_text___",
		"should include html tags inside for <code>code</code> <u>underline</u> <bold>bold</bold> <em>em</em>"
	])("should be deep tokenized", (line) => {
		const lines = [line]
		const lexerData = MDP.h(lines)
		expect(lexerData).toMatchSnapshot()
	})
})
