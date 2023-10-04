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
			"here *is a **beautiful** piece of* art"
		]
		const html = mdp.h(lines)
		expect(html).toMatchSnapshot()
	})
})
