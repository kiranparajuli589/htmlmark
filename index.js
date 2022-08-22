import { File } from "./lib/util/file.js"
import { fileURLToPath } from "url"
import { MDP } from "./lib/index.js"


const __filename = fileURLToPath(import.meta.url)
const __dirname = File.pathDirname(__filename)
const htmlContent = MDP.hF(File.pathJoin(__dirname, "tests/fixtures/large_markdown.md"))
File.write("./outputs/markdown.html", htmlContent)
