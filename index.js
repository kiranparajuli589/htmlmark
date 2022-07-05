const path = require("path")
const { write } = require("./lib/file")
const { renderer } = require("./lib/index")

// eslint-disable-next-line no-undef
const htmlContent = renderer(path.join(__dirname, "./tests/fixtures/markdown.md"))
write("./outputs/markdown.html", htmlContent)
