import { File } from "../util/file.js"
import { MarkdownParser } from "../index.js"


const args = process.argv.slice(2)

// filepath to markdown file or markdown string
const md = args[0]

const mdp = new MarkdownParser()

let parsed
if (File.exists(md)) {
	const content = File.read(md)
	parsed = mdp.parse(content)
} else {
	parsed = mdp.parse(md)
}

console.info(parsed)
