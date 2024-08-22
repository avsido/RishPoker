class joinpopup {
    html = '<div class="join popup">'+
	            '<h3>insert PIN:</h3>'+
	            '<input />'+
	            '<div class="buttons" />'+
		            '<a class="accept" href="javascript:void(0);">'+
		                '<img class="startDoubleGame" src="images/accept.png">'+
		            '</a>'+
		            '<a class="cancel" href="javascript:void(0);">'+
		                '<img class="startDoubleGame" src="images/cancel.png">'+
		            '</a>'+
		        '</div>'+
	        '</div>';
	el = null;
	constructor(app){
		app.el.main.insertAdjacentHTML('beforeend',this.html);
		this.el = app.el.main.querySelector('.join.popup'); 
		this.input = this.el.querySelector('input');
		this.cancelbutton = this.el.querySelector('.cancel');
		this.acceptButton = this.el.querySelector('.accept');
		this.acceptButton.addEventListener('click',()=>{
			let pin = this.input.value;
			app.io.emit("join-online-game", pin);
		})
		this.cancelbutton.addEventListener('click',()=>{
			this.el.remove();
		})
	}
}