class App {
	user = null;
	game = null;
	constructor(){

	}
	getRequest(url, callback) {
	  let httpRequest = new XMLHttpRequest();
	  httpRequest.onreadystatechange = function () {
	    if (this.readyState == 4) {
	      if (this.status == 200) {
	        callback(this.responseText);
	      }
          if (this.status == 401) {
            alert("Wrong user/password, please try again");
        }
            if (this.status == 409) {
             alert("User already exists");
            }
	    }
	  };
	  httpRequest.open("GET", url, true);
	  httpRequest.send();
	}
}
