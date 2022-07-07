const path = require("path")
const { write } = require("./lib/util/file")
const { toHtml } = require("./lib")

// eslint-disable-next-line no-undef
const htmlContent = toHtml(path.join(__dirname, "./tests/fixtures/markdown.md"))
write("./outputs/markdown.html", htmlContent)
