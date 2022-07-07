const fs = require("fs")

const File = {
  exists: (path) => {
    return fs.existsSync(path)
  },
  isDir: (path) => {
    return fs.lstatSync(path).isDirectory()
  },
  write: (path, content) => {
    fs.writeFileSync(path, content)
  },
  read: (path) => {
    if (!File.exists(path)) {
      throw new Error(`File does not exist at '${path}'`)
    }
    if (File.isDir(path)) {
      throw new Error(`Path: ${path} is a directory`)
    }
    return fs.readFileSync(path, "utf8")
  },
}

module.exports = File
