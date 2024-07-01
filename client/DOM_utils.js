function cleanElement(element) {
  while (element.lastElementChild) {
    element.removeChild(element.lastElementChild);
  }
}

function removeElementByQuery(name, element = document.body) {
  let selector = name;

  if (!name.startsWith("#") && !name.startsWith(".")) {
    selector = `#${name}`;
  }

  let elementToRemove = element.querySelector(selector);

  if (elementToRemove) {
    elementToRemove.parentNode.removeChild(elementToRemove);
  }
}

function emptyArray(arr) {
  while (arr.length > 0) {
    arr.pop();
  }
}
