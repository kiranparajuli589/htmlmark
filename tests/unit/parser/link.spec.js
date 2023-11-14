import { MDP } from "../../mdp.js"


const mdp = new MDP()


describe("link", () => {
	it("should parse a link", () => {
		const lines = [
			"[Kiran Parajuli](https://kiranparajuli.com.np)"
		]
		const html = mdp.h(lines)
		expect(html).toMatchSnapshot()
	})
	it("should parse a link with text", () => {
		const lines = [
			"[Kiran Parajuli](https://kiranparajuli.com.np) is a good"
		]
		const html = mdp.h(lines)
		expect(html).toMatchSnapshot()
	})
	it("should parse a link with title", () => {
		const lines = [
			"test **bold *and* bold** with *italics* and a [Kiran Parajuli](https://kiranparajuli.com.np 'K Pictures')",
			"",
			"here *is a **beautiful** piece of* art",
			"",
			"**Basic case.**  If a string of lines *Ls* constitute a sequence of blocks *Bs*, then the result of prepending a [block quote marker] to the beginning of each line in *Ls* is a [block quote](#block-quotes) containing *Bs*."
		]
		const html = mdp.h(lines)
		expect(html).toMatchSnapshot()
	})
})
