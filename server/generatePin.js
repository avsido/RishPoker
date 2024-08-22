/*
  provided by GPT - produces and returns a PIN with template '#-letter-letter-letter-digit-digit-digit'
*/

const generatedStrings = new Set();

function generateUniqueString() {
  let digits = [];

  while (digits.length < 4) {
    let digit = Math.floor(Math.random() * 10);
    if (!digits.includes(digit)) {
      digits.push(digit);
    }
  }

  return digits.join("");
}

module.exports = generateUniqueString;
