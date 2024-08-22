class loginform {
  html =
    "<div class='form login'>" +
    "<img src='images/rose.png' id='rose' />" +
    "<input name='username' placeholder='username' />" +
    "<input name='password' placeholder='password'/>" +
    "<div class='buttons'>" +
    "<button class='register'>REGISTER</button>" +
    "<button class='login'>LOGIN</button>" +
    "</div>" +
    "</div>";
  el = null;
  constructor() {
    this.divMain = document.querySelector("#divMain");
    this.divMain.innerHTML = this.html;
    this.el = document.querySelector(".form.login");
    this.inputs = this.el.querySelectorAll("input");
    this.loginButton = this.el.querySelector(".login");
    this.loginButton.addEventListener("click", () => {
      let data = this.getData(),
        getString = new URLSearchParams(data),
        url = "/login?" + getString.toString();
      sendHttpGETReq(url, (res) => {
        if (res != "failed") {
          window.current_user = JSON.parse(res);
          window.userBoxEl = new userBox();
          // alert('welcome ' + window.current_user.username + '. You have ' + current_user.credit + ' credit.');
          this.el.remove();
        } else {
          alert("login error!");
        }
        greet();
      });
    });

    this.registerButton = this.el.querySelector(".register");
    this.registerButton.addEventListener("click", () => {
      let data = this.getData(),
        getString = new URLSearchParams(data),
        url = "/register?" + getString.toString();
      sendHttpGETReq(url, (res) => {
        if (res != "failed") {
          window.current_user = JSON.parse(res);
          window.userBoxEl = new userBox();

          // window.location.assign(window.location);
        }
        this.el.remove();
        greet();
      });
    });
  }
  getData() {
    let data = {
      username: this.inputs[0].value,
      password: this.inputs[1].value,
    };
    return data;
  }
}
