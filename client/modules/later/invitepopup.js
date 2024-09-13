class invitepopup {
    html = '<div class="invite popup">'+
				'<p class="header">Send PIN to friend:</p>'+
				'<a href="javascript:void(0);" class="copy">'+
					'<h3 class="num"></h3>'+
					'<img src="images/copy.png">'+
				'</a>'+
				'<a href="javascript:void(0);" class="cancel">'+
					'<img src="images/cancel.png" />'+
				'</a>'+
			'</div>';
	el = null;
	constructor(app){
		app.io.emit("game-request-from-user");
		app.el.main.insertAdjacentHTML('beforeend',this.html);
		this.el = app.el.main.querySelector('.invite.popup'); 
		this.copybutton = this.el.querySelector('.copy');
		this.num = this.el.querySelector('.num');
		this.cancelbutton = this.el.querySelector('.cancel');
		this.copybutton.addEventListener('click',()=>{
			document.execCommand("copy");
			this.copybutton.querySelector('img').src = "images/copied.png";
		})
		this.cancelbutton.addEventListener('click',()=>{
			this.el.remove();
		})
		app.io.on("game-request-response", (pin) => {
	      this.num.innerHTML = pin;
	    });
	}
}
