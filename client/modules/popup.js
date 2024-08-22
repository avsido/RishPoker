class popup {
	html = '<div id="winDiv"><div id="winDiv" class="divPop divPopQuit"><h1></h1><button class="buttGame">OK</button></div>';
	el = null;
	constructor(msg,callback){
		this.body = document.querySelector('body');
		this.overlay = document.createElement("div");
		this.overlay.classList.add('divOverlay');
		this.overlay.innerHTML = this.html;
		this.body.appendChild(this.overlay)
		this.el = document.querySelector('#winDiv');
		this.title = this.el.querySelector('h1');
		this.title.innerHTML = msg;
		this.button = this.el.querySelector('button');
		this.button.addEventListener('click',()=>{
			callback();
			this.remove();
		});
	}
	remove(){
		this.overlay.remove()
	}
}