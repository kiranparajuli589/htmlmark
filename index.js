import { File } from "./lib/util/file.js"
import { fileURLToPath } from "url"
import { MarkdownParser } from "./lib/index.js"


const mdp = new MarkdownParser()

const __filename = fileURLToPath(import.meta.url)
const __dirname = File.pathDirname(__filename)
const htmlContent = mdp.parseFile(File.pathJoin(__dirname, "tests/fixtures/large_markdown.md"))
File.write("./outputs/markdown.html", htmlContent)
