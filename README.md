# Markdown Parser

## ⚠️ Under HIGH DEVELOPMENT ⚠️

A very lightweight Markdown Parser powered by Regex

## Key points
- no use of external dependencies
- lexer: to produce markdown tokens
- parser: to produce the HTML code

## Roadmap

## Paragraphs
### Comment
✔️ included in the lexer data but not in the parsed HTML output

### Heading
| level | bold | italic | strike | underline | link | code | indent |
|-------|------|--------|--------|-----------|------|------|--------|
| ✔️  ️ | ✔️   | ✔️     | ✔️     | ✔️ ️      | ✔️   | ✔️   | ❌      |

### List Item (ordered/unordered/checkbox)
| level | bold | italic | strike | underline | link | code | indent |
|-------|------|--------|--------|-----------|------|------|--------|
| ❌     | ✔️   | ✔️     | ✔️     | ✔️️       | ✔️   | ✔️   | ❌      |

### Image
| src | alt | title | height | width | align | indent |
|-----|-----|-------|--------|-------|-------|--------|
| ✔️  | ✔️  | ❌     | ❌      | ❌     | ❌     | ❌      |  ❌ |

### Quote
| depth | bold | italic | strike | underline | link | code | indent |
|-------|------|--------|--------|-----------|------|------|--------|
| ✔️    | ✔️   | ✔️     | ✔️     | ✔️        | ✔️️  | ✔️   | ❌      |

### Paragraph
| bold | italic | strike | underline | link | code | indent |
|------|--------|--------|-----------|------|------|--------|
| ✔️   | ✔️     | ✔️     | ✔️        | ✔️   | ✔️   | ❌️     |

### Table
| indent | cell count | tokenizing | parsing |
|--------|------------|------------|---------|
| ❌️     | ✔️         | ✔️         | ✔️      |

### Horizontal line
✔️

## Emphasis
### Bold
Supported inside: Italics, Link, Code, Strike Through, Underline
Identifier: **

### Italics
Deep: Bold, Link, Code, Strike Through, Underline
Identifier: *

### Code
no deep tokenization
Identifier: `

### Strike Through
Deep: Bold, Italics, Link, Code, Underline
Identifier: ~~

### Underline
Deep: Bold, Italics, Link, Code, Strike Through
Identifier: ++

### Link
Has a title and a link part.
Identifier: `[x](y)`
Title can have deep tokenization.
TDeep: Bold, Italics, Code, Strike Through, Underline


### Limitations of the emphasis identifiers 😤

1. Bold: cannot include `**` in the middle of the word.
2. Italics: cannot include `*` in the middle of the word.
3. Code: cannot include `` in the middle of the word.
4. Strike Through: cannot include `~~` in the middle of the word.
5. Underline: cannot include `++` in the middle of the word.
6. Link: cannot include `]` in the middle of the title.


### How to avoid such limitations? 🪄
Markdown should allow inline HTML. So, hey what about using actual html tags for such emphasis requirements.

Pros:
- tags are less likely to come in between the paragraph text.
- fast parsing
- accurate parsing

### Custom emphasis identifiers
SHOULD THIS BE IMPLEMENTED 🤔 IF NOT, WHY? IF YES, HOW?
