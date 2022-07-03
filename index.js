const fs = require('fs')

const findRegex = (regex, text) => {
  const matches = []
  let match = regex.exec(text);
  do {
    if (match?.groups?.code) {
      matches.push({
        type: 'code',
        value: match.groups.code
      })
    } else if (match?.groups?.bold) {
      matches.push({
        type: 'bold',
        value: match.groups.bold
      })
    } else if (match?.groups?.italic) {
      matches.push({
        type: 'italic',
        value: match.groups.italic
      })
    } else if (match?.groups?.strike) {
      matches.push({
        type: 'strike',
        value: match.groups.strike
      })
    } else if (match?.groups?.linkTitle) {
      matches.push({
        type: 'link',
        value: match.groups.linkTitle,
        href: match.groups.linkHref
      })
    } else {
      matches.push({
        type: 'text',
        value: Array.isArray(match) ? match[0] : match
      })
    }


  } while((match = regex.exec(text)) !== null);
  return matches
}

const REGEX = {
  // regex with group to get the text
    heading1: /^#\s(?<heading1>.*)/,
    heading2: /^##\s(?<heading2>.*)/,
    heading3: /^###\s(?<heading3>.*)/,
    heading4: /^####\s(?<heading4>.*)/,
    heading5: /^#####\s(?<heading5>.*)/,
    heading6: /^######\s(.*)$/,
    listItem: /^-\s(?<listItem>[^\[]+)/g,
    countItem: /^\d+\.\s(?<listItem>[^\[]+)/g,
    comment: /^\<\!--\s(?<comment>.*)\s--\>/,
    checkbox: /^-\s\[\s\]\s(?<checkbox>.*)/g,
    checkboxChecked: /^-\s\[x\]\s(?<checkboxChecked>.*)/g,
    quote: /^>\s(?<quote>.*)/g
}
const PARAGRAPH_REGEX = /(\*\*)(?<bold>[^\*\*]+)(\*\*)|`(?<code>[^`]+)`|(\~\~)(?<strike>[^\~\~]+)(\~\~)|\[(?<linkTitle>.*)]\((?<linkHref>.*)\)|(?<normal>[^`\*\[~]+)|\*(?<italic>[^\*\*]+)\*/g

// read content markdown at ./markdown.md
const content = fs.readFileSync('./markdown.md', 'utf8');

// read every line from the content
const lines = content.split('\n');

// parse every line to the respective markdown tokens
const parsedContent = []
for(let i=0; i<lines.length; i++) {
  const lineToParse = lines[i].trim();


  // for paragraphs, we need to parse the line with the PARAGRAPH_REGEX
  const beforeCompare = parsedContent.length

  // new line parsing
  // if there are multiple new lines in a row,
  // only single new line is added to the parsedContent
  if(lineToParse === '') {
    // last item of parsedContent is an empty line
    if (beforeCompare > 0 && parsedContent[beforeCompare-1].type !== 'newline') {
      parsedContent.push({
        type: 'newline'
      })
    }
    continue
  }

  // look for the every regex in the REGEX object
  for (let key in REGEX) {
    const regex = REGEX[key];
    let match = lineToParse.match(regex); 
    if (match) {
      match = regex.exec(lineToParse);
      parsedContent.push({
        type: key,
        value: match[1],
        raw: lines[i],
      })
      break
    }
  }
  // if noting was found, we parse the line with the PARAGRAPH_REGEX
  if (beforeCompare === parsedContent.length) {
    const tokens = findRegex(PARAGRAPH_REGEX, lineToParse)
    parsedContent.push({
      type: 'paragraph',
      tokens,
      raw: lines[i],
    })
  }
}


// check for every paresed line for inner tokens
// if only type is not newline, paragraph, image, comment
// we add the inner tokens to the parsed line
for(let i=0; i<parsedContent.length; i++) {
  const line = parsedContent[i];
  
  if (!['newline', 'paragraph', 'image', 'comment', 'quote'].includes(line.type)) {
    line.tokens = findRegex(PARAGRAPH_REGEX, line.value);
    continue
  }
  // TODO: if quote type handle separately.
  // if quote type, first we need to find the quote depth
  // then we need to find the inner tokens
  // then we need to add the quote depth to the inner tokens
  // then we need to add the inner tokens to the parsed line
  if (line.type === 'quote') {
    let depth = 0
    const qTokens = []
    let quoteLine = line.value
    while(quoteLine.startsWith('>')) {
      depth++
      quoteLine = quoteLine.substring(1).trim()
    }
    // now the quoteline is pure raw text
    // we can check it with the pqragraph regex
    line.depth = depth
    line.value = quoteLine
    line.tokens = findRegex(PARAGRAPH_REGEX, quoteLine)
  }
}

// write parsed content to the output.json
fs.rmSync('./output.json');
fs.writeFileSync('./output.json', JSON.stringify(parsedContent, undefined, 2))