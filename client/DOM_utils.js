function cleanElement(element) {
  // empties DOM element of all children
  while (element.lastElementChild) {
    element.removeChild(element.lastElementChild);
  }
}

function removeElementByQuery(name, element = document.body) {
  // checks if element exists as child in element and if so, removes it (default parent element: docoument.body)
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
