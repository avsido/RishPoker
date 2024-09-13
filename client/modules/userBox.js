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
      console.log("Updating userBox to " + app.user.credit);
      this.el.innerHTML = `
        <div style="display: flex; align-items: center;">
          <span class="material-icons md-48" style="margin-right: 30px;">account_circle</span>
          <div>
            <div style="font-weight: bold;">${app.user.username}</div>
            <div>$${app.user.credit}</div>
          </div>
        </div>
      `;
    }

  remove() {
    this.el.remove();
  }
}
