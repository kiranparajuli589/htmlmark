# Markdown Parser

## ⚠️ Under HIGH DEVELOPMENT ⚠️

A very lightweight Markdown Parser powered by Regex

## Key points
- no use of external dependencies
- lexer: to produce markdown tokens
- parser: to produce the HTML code

## Roadmap

### Paragraphs
1. Heading:
    - Levels: #{1, 6} Heading text
2. Code block:
    - Language: Optional
    - Indentation: must be equal for starting and closing ```
3. List:
    - Ordered: {any digit}. Item 1
    - Unordered: - Item 1
    - Checklist: - [ ] Item 1
    - Indentation: must be the same to be included in the same list
4. Quote:
    - Levels: 0 to infinity
    - Indentation: must be the same to be included in the same quote
5. Image:
    - Link: Required
    - Alt text: Optional
    - Size: NOT IMPLEMENTED YET
    - Align: NOT IMPLEMENTED YET
    - Indentation: NOT IMPLEMENTED YET
6. Comment
    - Lexer contains it
    - Parser ignores it
    - Ex: <!-- This is a comment -->
7. Line
    - Defined by: `---`
    - consecutive lines are merged into one
8. Newline
    - consecutive newlines are merged into one
10. Paragraph
    - anything else

### Emphasis
Emphasis can be inside the content of any paragraph types.

1. Bold: **bold**
2. Italic: *italic*
3. Strike: ~~strike~~
4. Underline: ++underline++
5. Link: `[link](https://example.com)`
6. Code: wrapped inside backticks

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

### Custom emphasis identifiers 🤔
SHOULD THIS BE IMPLEMENTED?


### HTML Sanitization 👻
**A BIG TODO**
