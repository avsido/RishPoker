/*
  provided by GPT - produces and returns a PIN with template '#-letter-letter-letter-digit-digit-digit'
*/

const generatedStrings = new Set();

function generateUniqueString() {
  const letters = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  let uniqueString = "";

  // Generate three random letters
  for (let i = 0; i < 3; i++) {
    uniqueString += letters.charAt(Math.floor(Math.random() * letters.length));
  }

  // Generate three random digits
  for (let i = 0; i < 3; i++) {
    uniqueString += digits.charAt(Math.floor(Math.random() * digits.length));
  }

  // Prefix with '#'
  uniqueString = "#" + uniqueString;

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
