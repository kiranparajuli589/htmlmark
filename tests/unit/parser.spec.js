const parser = require("../../lib/parser")

describe("parser", () => {
  it("should parse the empty line to br", () => {
    const lexedData = [{
      "type": "new-line",
    }]
    const parsedData = parser(lexedData)
    expect(parsedData).toBe("<br>")
  })
  it.each([
    {level: 1, expected: "<h1>hello</h1>"},
    {level: 2, expected: "<h2>hello</h2>"},
    {level: 3, expected: "<h3>hello</h3>"},
    {level: 4, expected: "<h4>hello</h4>"},
    {level: 5, expected: "<h5>hello</h5>"},
    {level: 6, expected: "<h6>hello</h6>"},
  ])("should parse headings of different levels", ({level, expected}) => {
    const lexedData = [{
      "indent": "",
      "level": level,
      "raw": "something raw",
      "tokens": [{
        "type": "text",
        "value": "hello",
      }],
      "type": "heading",
    }]
    const parsedData = parser(lexedData)
    expect(parsedData).toBe(expected)
  })

  it.each([
    {depth: 0, expected: "<blockquote>hello</blockquote>"},
    {depth: 1, expected: "<blockquote><blockquote>hello</blockquote></blockquote>"},
    {depth: 2, expected: "<blockquote><blockquote><blockquote>hello</blockquote></blockquote></blockquote>"},
  ])("should parse quote of different depths", ({depth, expected}) => {
    const lexedData = [{
      "depth": depth,
      "indent": "",
      "raw": "something raw",
      "tokens": [{
        "type": "text",
        "value": "hello",
      }],
      "type": "quote",
    }]
    const parsedData = parser(lexedData)
    expect(parsedData).toBe(expected)
  })

  it("should parse the code block inside pre (with-language)", () => {
    const lexedData = [{
      "language": "js",
      "tokens": [
        {
          "value": "const a = 1;",
        },
      ],
      "type": "code-block",
    }]
    const parsedData = parser(lexedData)
    expect(parsedData).toBe("<pre><code class=\"language-js\">const a = 1;</code></pre>")
  })

  it("should parse the code block inside pre (without-language)", () => {
    const lexedData = [{
      "language": null,
      "tokens": [
        {
          "value": "const a = 1;",
        },
      ],
      "type": "code-block",
    }]
    const parsedData = parser(lexedData)
    expect(parsedData).toBe("<pre><code>const a = 1;</code></pre>")
  })

  it("should parse unordered list", () => {
    const lexedData = [
      {
        "indent": "",
        "raw": "- list item 1",
        "tokens": [{
          "type": "text",
          "value": "list item 1",
        }],
        "type": "list-item",
      },
      {
        "indent": "",
        "raw": "- list item 2",
        "tokens": [{
          "type": "text",
          "value": "list item 2",
        }],
        "type": "list-item",
      }]
    const parsedData = parser(lexedData)
    expect(parsedData).toBe("<ul><li>list item 1</li><li>list item 2</li></ul>")
  })



  it("should parse ordered list", () => {
    const lexedData = [
      {
        "indent": "",
        "raw": "1. list item 1",
        "tokens": [{
          "type": "text",
          "value": "list item 1",
        }],
        "type": "count-item",
      },
      {
        "indent": "",
        "raw": "1. list item 2",
        "tokens": [{
          "type": "text",
          "value": "list item 2",
        }],
        "type": "count-item",
      }]
    const parsedData = parser(lexedData)
    expect(parsedData).toBe("<ol><li>list item 1</li><li>list item 2</li></ol>")
  })

  it("should parse the checkbox unchecked", () => {
    const lexedData = [{
      "indent": "",
      "raw": "- [ ] checkbox empty",
      "tokens": [
        {
          "type": "text",
          "value": "checkbox empty",
        },
      ],
      "type": "check-box",
    }]
    const parsedData = parser(lexedData)
    expect(parsedData).toBe("<ul><li><input type=\"checkbox\">checkbox empty</li></ul>")
  })

  it("should parse the checkbox checked", () => {
    const lexedData = [{
      "indent": "",
      "raw": "- [x] checkbox empty",
      "tokens": [
        {
          "type": "text",
          "value": "checkbox full",
        },
      ],
      "type": "check-box-checked",
    }]
    const parsedData = parser(lexedData)
    expect(parsedData).toBe("<ul><li><input type=\"checkbox\" checked>checkbox full</li></ul>")
  })

  it("should parse the image", () => {
    const lexedData = [{
      "indent": "",
      "raw": "![Kiran Parajuli](https://avatars.githubusercontent.com/u/39373750?v=4)",
      "tokens": {
        "alt": "Kiran Parajuli",
        "url": "https://avatars.githubusercontent.com/u/39373750?v=4",
      },
      "type": "image",
    }]
    const parsedData = parser(lexedData)
    expect(parsedData).toBe("<img src=\"https://avatars.githubusercontent.com/u/39373750?v=4\" alt=\"Kiran Parajuli\">")
  })

  it("should parse a paragraph", () => {
    const lexedData = [{
      "indent": "",
      "raw": "paragraph",
      "tokens": [
        {
          "type": "text",
          "value": "paragraph",
        },
      ],
      "type": "paragraph",
    }]
    const parsedData = parser(lexedData)
    expect(parsedData).toBe("<p>paragraph</p>")
  })
  it("should parse paragraph with magic", () => {
    const lexedData = [{
      "raw": "a paragraph of words `first code` normal text here `code body` *first italics* here me crying *italic body* here me crying **first bolds** some normal again **bold body** [Kiran Parajuli](https://kiranparajuli.com.np) ~~strikes body~~ here some normal again at the last",
      "tokens": [
        {
          "type": "text",
          "value": "a paragraph of words ",
        },
        {
          "type": "code",
          "value": "first code",
        },
        {
          "type": "text",
          "value": " normal text here ",
        },
        {
          "type": "code",
          "value": "code body",
        },
        {
          "type": "text",
          "value": " ",
        },
        {
          "type": "italic",
          "value": "first italics",
        },
        {
          "type": "text",
          "value": " here me crying ",
        },
        {
          "type": "italic",
          "value": "italic body",
        },
        {
          "type": "text",
          "value": " here me crying ",
        },
        {
          "type": "bold",
          "value": "first bolds",
        },
        {
          "type": "text",
          "value": " some normal again ",
        },
        {
          "type": "bold",
          "value": "bold body",
        },
        {
          "type": "text",
          "value": " ",
        },
        {
          "href": "https://kiranparajuli.com.np",
          "type": "link",
          "value": "Kiran Parajuli",
        },
        {
          "type": "text",
          "value": " ",
        },
        {
          "type": "strike-through",
          "value": "strikes body",
        },
        {
          "type": "text",
          "value": " here some normal again at the last",
        },
      ],
      "type": "paragraph",
    }]

    const parsedData = parser(lexedData)
    expect(parsedData).toBe("<p>a paragraph of words <code>first code</code> normal text here <code>code body</code> <em>first italics</em> here me crying <em>italic body</em> here me crying <strong>first bolds</strong> some normal again <strong>bold body</strong> <a href=\"https://kiranparajuli.com.np\">Kiran Parajuli</a> <s>strikes body</s> here some normal again at the last</p>")
  })
  it("should avoid the comment", () => {
    const lexedData = [
      {
        "indent": "",
        "raw": "<!-- comment item text -->",
        "tokens": {
          "value": "comment item text",
        },
        "type": "comment",
      }
    ]
    const parsedData = parser(lexedData)
    expect(parsedData).toBe("")
  })
})