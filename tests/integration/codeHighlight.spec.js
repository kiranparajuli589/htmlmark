import HtmlMark from "../../lib/index.js"
import hljs from "highlight.js"


const mdp = new HtmlMark({
	highlightFn: (code, lang) => {
		if (lang && hljs.getLanguage(lang)) {
			return hljs.highlight(code, { language: lang }).value
		} else {
			return hljs.highlightAuto(code).value
		}
	}
})

describe("code highlight support", () => {
	test("should highlight code blocks", () => {
		const str = `
\`\`\`javascript
const a = 1
\`\`\`
`
		expect(mdp.parse(str)).toMatchSnapshot()
	})
})
