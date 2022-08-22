import { File } from "../../lib/util/file.js"
import { MDP } from "../../lib/index.js"


describe("Small MD To HTML", () => {
	it.each([
		// eslint-disable-next-line no-undef
		File.pathJoin(__dirname, "..", "fixtures/markdown.md")
	])("should parse the small markdown file content to html", (path) => {
		const html = MDP.hF(path)
		expect(html).toMatchSnapshot()
	})
})
