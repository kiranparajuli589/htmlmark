# Markdown Parser

## 🚧 Under HIGH DEVELOPMENT 🚧

A very lightweight Markdown Parser powered by Regex

## 🔑 Key points
- no use of external dependencies
- lexer: to produce markdown tokens
- parser: to produce the HTML code

## 🚵 Roadmap

### Paragraphs
1. **Heading:**
    - Levels: #{1, 6} Heading text
    - Indentation: NOT IMPLEMENTED YET
2. **Code block:**
    - Language: Optional
    - Must have equal indent for starting and closing backtick group (```)
    - Indentation: NOT IMPLEMENTED YET
3. **List:**
    - Ordered: {any digit}. Item 1
    - Unordered: - Item 1
    - Checklist: - [ ] Item 1
    - Lines must have the same intent to be included in the same list
    - Indentation: NOT IMPLEMENTED YET
4. **Quote:**
    - Levels: 0 to infinity
    - Lines must be the same indent to be included within the same quote
    - Indentation: NOT IMPLEMENTED YET
5. **Image:**
    - Link: Required
    - Alt text: Optional
    - Size: NOT IMPLEMENTED YET
    - Align: NOT IMPLEMENTED YET
    - Indentation: NOT IMPLEMENTED YET
6. **Comment:**
    - Lexer contains it
    - Parser ignores it
    - Example: `<!-- This is a comment -->`
7. **Line:**
    - Defined as: `---`
    - Consecutive lines are merged into one
8. **Newline:**
    - Consecutive newlines are merged into one
10. **Paragraph:**
    - Anything else
    - Indentation: NOT IMPLEMENTED YET

### Emphasis
Emphasis can be inside the content of any paragraph types. Even emphasis items can have emphasis inside 🤩.

1. **Bold:** wrapped inside `**`
2. **Italic:** wrapped inside `*`
3. **Strike:** wrapped inside `~~`
4. **Underline:** wrapped inside `++`
5. **Link:** wrapped as `[title](url)`
6. **Code:** wrapped inside backticks

### 😤 Limitations of the emphasis identifiers

1. Bold: cannot include `**` in the middle of the word.
2. Italics: cannot include `*` in the middle of the word.
3. Code: cannot include `` in the middle of the word.
4. Strike Through: cannot include `~~` in the middle of the word.
5. Underline: cannot include `++` in the middle of the word.
6. Link: cannot include `]` in the middle of the title.


### 🪄 How to avoid such limitations?
Markdown should allow inline HTML. So, hey what about using actual html tags for such emphasis requirements.

**PROS:**
- Tags are less likely to come in between the content
- Fast plus Accurate parsing

### 🤔 Custom emphasis identifiers
SHOULD THIS BE IMPLEMENTED?


### 👻 HTML Sanitization
**A BIG TODO**
