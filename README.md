# Markdown Parser

![logo](/home/kiran/dev/md-parser/logo.png)

A very lightweight Markdown Parser powered by Regex

## 🚧 Under HIGH DEVELOPMENT 🚧

As of right now, this repository is still in its infancy.
Open source is something I'm passionate about, so I want to share what I'm doing early.
The readme will be updated once it is safe for use with more detailed documentation.
In the meantime, please feel free to share your thoughts, contact [me](https://kiranparajuli.com.np) or create a **PR** if you would like to contribute.


## 🔑 Key points
- no use of external dependencies
- lexer: to produce markdown tokens
- parser: to produce the HTML code

## 🌐 Demo

Checkout the features of the parser from this [Live Demo](https://kiranparajuli589.github.io/md-parser/ 'Live Demo').

## 🛣️ Roadmap

### 🪕 Paragraphs
1. **Heading:**
   - Levels: 1 to 6
   - Type
     - Underlined:

        For Heading 1, the underline of `=`

        For Heading 2, the underline of `-`

     - Hashed

        Number of the leading hashes determines the level of the heading.

        Can be in between of 1 to 6.

        Can be fenced with hashes.

        Otherwise, it will be treated as a paragraph.
2. **Code block:**
    - Language: Optional
    - Types:
        1. Can be inside a backtick block like <code>```</code>
        2. An indent of 4 can make the block a code

           For a codeblock inside a list
           it should be indented at least twice.
3. **List:**
    - Ordered: `{any digit}. Item 1`
    - Unordered: `-|+|* Item 1`
    - Checklist: `-|+|*|{digit}. [ ] Item 1` (Can be _ordered_ or _unordered_)
    - Can be Lazy
    - Items must have the same intent to be included in the same list
    - Allows other _paragraph items_ inside content (recursive lex and parsing)
4. **Quote:**
    - Levels: 0 to infinity
    - Lines must be the same indent to be included within the same quote
    - Allows other _paragraph items_ inside content (recursive lex and parsing)
    - Can be Lazy
5. **Image:**
    - Link: String (Required)
    - Alt text: String (Required)
    - Title: String (Optional)
    - Width: Number (Optional)
    - Height: Number (Optional)
    - Indentation: NOT IMPLEMENTED YET
6. **Comment:**
    - Lexer contains it
    - Parser also contains it
    - Example: `<!-- This is a comment -->`
7. **Line:**
    - Defined as: `---`
    - Consecutive lines are merged into one
8. **Table:**
    - Equal number of cell counts
    - Equal number of indentations
    - Cell content should allow emphasis
9. **Newline:**
    - Consecutive newlines are merged into one
10. **Paragraph:**
    - Anything else
    - Line Breaks:

       1. If a line ends with 2 or more than 2 spaces, then, a line break is inserted.
       2. Otherwise, the lines are merged into one.

### 🎺 Emphasis
Emphasis can be inside the content of any paragraph types. Even emphasis items can have emphasis inside 🤩.

1. **Bold:** wrapped inside `**` | `__` | odd number of `*` | `_`
2. **Italic:** wrapped inside `*` | `_` | even number of `*` | `_`
3. **Code:** wrapped inside backticks
4. **Strike:** wrapped inside `~~` | even number of `~`
5. **Underline:** wrapped inside `++` | even number of `+`
6. **Link:** wrapped as `[title](url 'title')` where `title` is optional
7. **Image:** wrapped as `![alt text](url 'title' width height)` where `title`, `width` & `height` are optional

### 🤔 Custom emphasis identifiers
SHOULD THIS BE IMPLEMENTED?

### 🛹 Escaping
1. So far `<`, `>`, `&`, `"` & `'` are escaped.
2. Everything is escaped inside of `code` and `codeblock`
3. Non HTML characters are escaped inside of other tokens

Ref: https://en.wikipedia.org/wiki/List_of_XML_and_HTML_character_entity_references

### 🤡 Unescaping

Escaped characters (`*`,`_`,`[`,`]`,`(`,`)`,`!`,`~`,`+`) are replaced with their unescaped counterparts.


### 👻 HTML Sanitization
**A BIG TODO**
