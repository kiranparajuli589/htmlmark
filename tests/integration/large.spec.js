import { File } from "../../lib/util/file.js"
import { MDP } from "../../lib/index.js"


describe("Large MD To HTML", () => {
	it.each([
		// eslint-disable-next-line no-undef
		File.pathJoin(__dirname, "..", "fixtures/large_markdown.md")
	])("should parse the large markdown file content to html", (path) => {
		const html = MDP.hF(path)
		expect(html).toMatchSnapshot()
	})
})
