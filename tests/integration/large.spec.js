import { CLI } from "../../lib/cli"
import { File } from "../../lib/util/file.js"


describe("Large MD To HTML", () => {
	it.each([
		// eslint-disable-next-line no-undef
		File.pathJoin(__dirname, "..", "fixtures/large_markdown.md")
	])("should parse the large markdown file content to html", (path) => {
		const html = CLI.hF(path)
		expect(html).toMatchSnapshot()
	})
})
