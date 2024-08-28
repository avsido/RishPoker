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
      this.login('login');
    });

    this.registerButton = this.el.querySelector(".register");
    this.registerButton.addEventListener("click", () => {
      this.login('register');
    });
  }
  login(loginType){
    let data = this.getData(),
        getString = new URLSearchParams(data),
        url = "/" + loginType + "?" + getString.toString();
        app.getRequest(url, (res) => {
          if (res != "failed") {
            app.user = JSON.parse(res);
            window.userBoxEl = new userBox();
            this.el.remove();
          } else {
            alert("login error!");
          }
          greet();
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
