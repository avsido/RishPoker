class sounds {
    sounds = {
        placeCardSound: "sounds/card_place.ogg",
        flipOpponentCardSound: "sounds/card_flip.wav",
        winSound: "sounds/win.wav",
        loseSound: "sounds/lose.wav",
        tieSound: "sounds/tie.wav",
        openingSound: "sounds/opening.mp3",
        chatMessage: "sounds/chat_message.mp3"
    }
    constructor() {
        for (const [key, value] of Object.entries(this.sounds)) {
            this.key = new Howl({
                src: ['sounds/' + key]
            })
            console.log(`${key}: ${value}`);
        }
    }
    play(sound) {
        if (typeof(this.sounds[sound].play) != 'undefined') {
            this.sounds[sound].play();
        }
    }
}