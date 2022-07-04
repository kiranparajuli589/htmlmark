const fs = require("fs")

const file = {
  exists: (path) => {
    return fs.existsSync(path)
  },
  isDir: (path) => {
    return fs.lstatSync(path).isDirectory()
  },
  read: (path) => {
    if (!file.exists(path)) {
      throw new Error(`File does not exist at '${path}'`)
    }
    if (file.isDir(path)) {
      throw new Error(`Path: ${path} is a directory`)
    }
    return fs.readFileSync(path, "utf8")
  },
}

module.exports = file