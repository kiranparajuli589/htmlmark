import { join, dirname } from "path"
import { readFileSync, writeFileSync, lstatSync, existsSync } from "fs"


export const File = {
  pathDirname: dirname,
  pathJoin: join,
  exists: (path) => {
    return existsSync(path)
  },
  isDir: (path) => {
    return lstatSync(path).isDirectory()
  },
  write: (path, content) => {
    writeFileSync(path, content)
  },
  read: (path) => {
    if (!File.exists(path)) {
      throw new Error(`File does not exist at '${path}'`)
    }
    if (File.isDir(path)) {
      throw new Error(`Path: ${path} is a directory`)
    }
    return readFileSync(path, "utf8")
  },
}
