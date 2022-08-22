import { Lexer } from "../../../lib/lexer/index.js"


describe("paragraph", () => {
	it.each([
		"some normal and **bold with * gem** but pure *italics* is alos there baby now ~~coming~~hola amigons~~strike~~ wooo lala what about blazing *********here baby ~~~~~~~~~baby `baby```[[[[[[[[[[[[[[[l]]]]int](href)[link](href)``````````",
		"a paragraph of <u>words</u> `first code` normal text here `code body` *first italics* here me crying *italic body* here me crying **first bolds** some normal again **bold body** [Kiran Parajuli](https://kiranparajuli.com.np) ~~strikes body~~ here some",
		"now with __underlined text__ within some ___underl_ined_text___"
	])("should be deep tokenized", (line) => {
		const lines = [line]
		const lexer = new Lexer(lines)
		const lexerData = lexer.run()
		expect(lexerData).toMatchSnapshot()
	})
	it("should merge consecutive paragraph not separated by other tokens", () => {
		const lines = [
			"  abc",
			"  def"
		]
		const lexer = new Lexer(lines)
		const lexerData = lexer.run()
		expect(lexerData).toMatchSnapshot()
	})
	it("should be separated with other tokens", () => {
		const lines = [
			"abc",
			"# one",
			"def"
		]
		const lexer = new Lexer(lines)
		const lexerData = lexer.run()
		expect(lexerData).toMatchSnapshot()
	})
})
