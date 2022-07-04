const fs = require("fs")
const { tokenize, deepTokenizer } = require("./lib/tokenizer/outerTokenizer")


// read content markdown at ./markdown.md
const content = fs.readFileSync("./markdown.md", "utf8")

// read every line from the content
const lines = content.split("\n")

const tokenizedContent = tokenize(lines)

const deepTokenizedContent = deepTokenizer(tokenizedContent)

// write parsed content to the output.json
fs.rmSync("./output.json")
fs.writeFileSync("./output.json", JSON.stringify(deepTokenizedContent, undefined, 2))