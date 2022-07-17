const k = "*s **bold** italics*"

const starBox = []
let bold = ""
let italic = ""
let boldIncomplete = false
let italicIncomplete = false
let normal = ""
const tokens = []

for (let i = 0; i < k.length; i++) {
  const curr = k[i]
  const prev = k[i - 1] || null
  // var next = k[i + 1] || null

  // add consecutive stars to starBox
  if (curr === "*" && (!prev || prev === "*")) {
    // if no previous star, add to starBox
    if (!prev) {
      starBox.push(curr)
    } else {
      const lastStr = starBox.pop()
      starBox.push(lastStr + curr)
    }
  }
  else if (curr === "*" && prev !== "*") {
    // Hmm, a new star in the middle of a word
    // lets check if we have an item in the starBox
    if (starBox.length >= 1) {
      // if we have we can check already if that can
      // be closed with this next star occurrence
      let cursor = i + 1
      let mayBeClosingStar = curr
      // accumulate the next characters until we find a star
      while (k[cursor] === "*") {
        mayBeClosingStar += k[cursor]
        cursor++
      }
      if (mayBeClosingStar ===  starBox[starBox.length - 1]) {
        // if accumulated string is equal to the last entry in the starBox
        starBox.pop()
      } else {
        // otherwise add as a new entry to the starBox
        starBox.push(mayBeClosingStar)
      }
      // set the cursor to the next character
      i = cursor - 1
    } else {
      starBox.push(curr)
    }
  }
}

console.log(starBox)
