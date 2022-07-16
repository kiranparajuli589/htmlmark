const regex = new RegExp(
  "`(?<code>[^`]+)`|" +
  "\\*(?<italic>[^*]+)\\*|" +
  "\\*\\*(?<bold>(?:(?!\\*\\*).)+)\\*\\*|" +
  "~~(?<strike>(?:(?!~~).)+)~~|" +
  "\\[(?<linkTitle>.+)]\\((?<linkHref>.+)\\)|" +
  "(?<normal>[^`[*~]+)|" +
  "(?<tara>[*~]{3,})|" +
  "(?<siTara>[`[]+)",
  "g"
)

const str = "quote [link-title](link-url) with *two*"


console.log(matches)
