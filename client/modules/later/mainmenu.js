class mainmenu {
    html = '<div class="menu play">' +
        '<a href="javascript:void(0);" class="comp">VS Computer</a>' +
        '<a href="javascript:void(0);" class="invite">invite friend</a>' +
        '<a href="javascript:void(0);" class="join">join friend</a>' +
        '</div>';
    el = null;
    constructor(app) {
        app.el.main.innerHTML = this.html;
        this.el = app.el.main.querySelector('.menu.play');
        this.compButton = this.el.querySelector('.comp');
        this.inviteButton = this.el.querySelector('.invite');
        this.joinButton = this.el.querySelector('.join');
        this.compButton.addEventListener('click', () => {})
        this.inviteButton.addEventListener('click', () => {
            let invitePopup = new invitepopup(app);
        })
        this.joinButton.addEventListener('click', () => {
            let joinPopup = new joinpopup(app);
        })
    }
}