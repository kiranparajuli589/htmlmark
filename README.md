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
|-------|------|--------|--------|-----------|------|------|--------|
| ✔️  ️ | ✔️   | ✔️     | ✔️     | ✔️ ️      | ✔️   | ✔️   | ✔️     |

### List Item (ordered/unordered/checkbox)
| level | bold | italic | strike | underline | link | code | indent |
|-------|------|--------|--------|-----------|------|------|--------|
| ❌     | ✔️   | ✔️     | ✔️     | ✔️️       | ✔️   | ✔️   | ✔️     |

### Image
| src | alt | title | height | width | align | indent |
|-----|-----|-------|--------|-------|-------|--------|
| ✔️  | ✔️  | ❌     | ❌      | ❌     | ❌     | ❌      |  ❌ |

### Quote
| depth | bold | italic | strike | underline | link | code | indent |
|-------|------|--------|--------|-----------|------|------|--------|
| ✔️    | ✔️   | ✔️     | ✔️     | ✔️        | ✔️️  | ✔️   | ✔️     |

### Paragraph
| bold | italic | strike | underline | link | code | indent |
|------|--------|--------|-----------|------|------|--------|
| ✔️   | ✔️     | ✔️     | ✔️        | ✔️   | ✔️   | ✔️     |

### Table
| indent | cell count | tokenizing | parsing |
|--------|------------|------------|---------|
| ✔️     | ✔️         | ✔️         | ✔️      |

### Horizontal line
✔️

### Bold
- [x] Italics
- [x] Link
- [x] Code
- [x] Strike Through
- [x] Underline

### Italics
- [ ] Bold
- [x] Link
- [x] Code
- [x] Strike Through
- [x] Underline

### Code
- [x] no deep tokenization

### Strike Through
- [x] Bold
- [x] Italics
- [x] Link
- [x] Code
- [x] Underline

### Underline

### Link
- [x] Bold
- [x] Italics

> ❌: not implemented yet
>
> ✔️: implemented


*italics **bold** italics* and **bold** here
