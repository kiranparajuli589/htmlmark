import { MDP } from "../../../lib"


describe("Heading Parsing", () => {
	it("should parse a fenced Heading", () => {
		const lines = [
			"# Heading #####",
			"# Heading###"
		]
		const html = MDP.h(lines)
		expect(html).toMatchSnapshot()
	})
})
