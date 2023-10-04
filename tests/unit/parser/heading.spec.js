import { MDP } from "../../mdp.js"


const mdp = new MDP()


describe("Heading Parsing", () => {
	it("should parse a fenced Heading", () => {
		const lines = [
			"# Heading #####",
			"# Heading###"
		]
		const html = mdp.h(lines)
		expect(html).toMatchSnapshot()
	})
})
