import { CLI } from "../../lib/cli"
import { File } from "../../lib/util/file.js"


describe("Small MD To HTML", () => {
	it.each([
		// eslint-disable-next-line no-undef
		File.pathJoin(__dirname, "..", "fixtures/markdown.md")
	])("should parse the small markdown file content to html", (path) => {
		const html = CLI.hF(path)
		expect(html).toMatchSnapshot()
	})
})
