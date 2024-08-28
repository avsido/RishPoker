class userBox {
  el = null;
  constructor() {
    let el = document.createElement("div");
    this.header = document.querySelector("body>.title");
    // this.el = document.createElement("div");
    el.id = "userBox";
    this.header.appendChild(el);
    this.el = document.querySelector("#userBox");
    this.update();
    return this;
  }
  update() {
    this.el.innerHTML =
      "hello " +
      app.user.username +
      ", your current credit: " +
      app.user.credit +
      "$";
  }
  remove() {
    this.el.remove();
  }
}
