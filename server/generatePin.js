/*
  provided by GPT - produces and returns a PIN with template '#-letter-letter-letter-digit-digit-digit'
*/

const generatedStrings = new Set();

function generateUniqueString() {

  const digits = "0123456789";

  let uniqueString  = '';

  // Generate four random digits
  for (let i = 0; i < 4; i++) {
    uniqueString += digits.charAt(Math.floor(Math.random() * digits.length));
  }

  // Check if the generated string is unique
  if (generatedStrings.has(uniqueString)) {
    // If not unique, recursively generate a new string
    return generateUniqueString();
  } else {
    // If unique, add to the set and return the string
    generatedStrings.add(uniqueString);
    return uniqueString;
  }
}

module.exports = generateUniqueString;
