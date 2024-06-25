function isValidCardPlacement(cardsToCheck, wantedHand) {
  if (isNaN(wantedHand)) {
    return false;
  }
  wantedHand = parseInt(wantedHand);

  if (!Number.isInteger(wantedHand)) {
    return false;
  }
  if (wantedHand < 0 || wantedHand > 4) {
    return false;
  }

  let temp = cardsToCheck[wantedHand].length;
  for (let i = 0; i < cardsToCheck.length; i++) {
    if (temp > cardsToCheck[i].length) {
      return false;
    }
  }
  return true;
}

module.exports = isValidCardPlacement;
