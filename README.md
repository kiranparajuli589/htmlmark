# Markdown Parser
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

## 🛣️ Roadmap

### 🪕 Paragraphs
1. **Heading:**
    - Levels: `#{1, 6} Heading text`
    - Indentation: NOT IMPLEMENTED YET
2. **Code block:**
    - Language: Optional
    - Must have equal indent for starting and closing backtick group (<code>```</code>)
    - Indentation: NOT IMPLEMENTED YET
3. **List:**
    - Ordered: `{any digit}. Item 1`
    - Unordered: `-|+|* Item 1`
    - Checklist: `-|+|*|{digit}. [ ] Item 1` (Can be _ordered_ or _unordered_)
    - Can be Lazy
    - Items must have the same intent to be included in the same list
    - Allows other _paragraph items_ inside content
    - Indentation: NOT IMPLEMENTED YET
4. **Quote:**
    - Levels: 0 to infinity
    - Lines must be the same indent to be included within the same quote
    - Allows other _paragraph items_ inside content
    - Can be Lazy
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
8. **Table:**
    - Equal number of cell counts
    - Equal number of indentations
    - Cell content should allow emphasis
    - Indentation: `NOT IMPLEMENTED YET`
10. **Newline:**
     - Consecutive newlines are merged into one
11. **Paragraph:**
    - Anything else
    - Indentation: NOT IMPLEMENTED YET

### 🎺 Emphasis
Emphasis can be inside the content of any paragraph types. Even emphasis items can have emphasis inside 🤩.

1. **Bold:** wrapped inside `**`
2. **Italic:** wrapped inside `*`
3. **Strike:** wrapped inside `~~`
4. **Underline:** wrapped inside `__`
5. **Link:** wrapped as `[title](url)`
6. **Code:** wrapped inside backticks

### 😤 Limitations of the emphasis identifiers

1. Bold: cannot include `**` in the middle of the word.
2. Italics: cannot include `*` in the middle of the word.
3. Code: cannot include <code>``</code> in the middle of the word.
4. Strike Through: cannot include `~~` in the middle of the word.
5. Underline: cannot include `__` in the middle of the word.
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




> > > zero f
> > one f
>>>
>>>
>>
>
> one
> # two
> > three
> > > four
> > > > d-five
> >
> > five
> > > ## six
> > > > seven
> > > > > eight
> > > >
> > > > simple
> > > >
> > > para
graph

