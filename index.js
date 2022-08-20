import MDP from "./lib/index.js"
import { File } from "./lib/util/file.js"
import { fileURLToPath } from "url"


const __filename = fileURLToPath(import.meta.url)
const __dirname = File.pathDirname(__filename)
const htmlContent = MDP.h(File.pathJoin(__dirname, "tests/fixtures/large_markdown.md"))
File.write("./outputs/markdown.html", htmlContent)
