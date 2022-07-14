# Markdown Parser

## ⚠️ Under HIGH DEVELOPMENT ⚠️

A very lightweight markdown parser powered by Regex

## Key points
- no use of external dependencies
- lexer: to produce markdown tokens
- parser: to produce the HTML code

## Roadmap

### Comment
✔️ included in the lexer data but not in the parsed HTML output

### Heading
| level | bold | italic | strike | underline | link | code | indent |
| ------ | ---- | ------ | ----- | -------- | ---- | ---- | ---- |
| ✔️ | ✔️| ✔️| ✔️| ️ | ✔️ | ✔️ | ❌ |

### List Item (ordered/unordered)
| level | bold | italic | strike | underline | link | code | indent |
| ------ | ---- | ------ | ----- | -------- | ---- | ---- | ---- |
| ❌ | ✔️| ✔️| ✔️| ️ | ✔️ | ✔️ | ❌ |

### Checkbox
| check status | level | bold | italic | strike | underline | link | code | indent |
| ------ | ------ | ---- | ------ | ----- | -------- | ---- | ---- | ---- |
| ✔️ | ❌ | ✔️| ✔️| ✔️| ️ | ✔️ | ✔️ | ❌ |

### Image
| src | alt | title | height | width | align | indent |
| ---- | ---- | ---- | ---- | ---- | ---- | ---- |
| ✔️ | ✔️ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Quote
| depth | bold | italic | strike | underline | link | code | indent |
| ------ | ---- | ------ | ----- | -------- | ---- | ---- | ---- |
| ✔️ | ✔️| ✔️| ✔️| ❌ | ✔️ | ✔️ | ✔️ |

### Paragraph
| bold | italic | strike | underline | link | code | indent |
| ---- | ------ | ----- | -------- | ---- | ---- | ---- |
| ✔️| ✔️| ✔️| ✔️ | ✔️ | ✔️ | ❌ |

### Table
| indent | cell count | tokenizing | parsing |
|---|---|---|---|
| ✔ | ✔ | ✔️ | ✔️ |

### Horizontal line
✔️

> ❌: not implemented yet
>
> ✔️: implemented
