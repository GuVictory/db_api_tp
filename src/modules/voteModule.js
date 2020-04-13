class voteModule {
    constructor(thread, nickname, voice) {
        this._thread = thread;
        this._nickname = nickname;
        this._voice = voice;
    }


    get voice() {
        return this._voice;
    }

    set voice(val) {
        this._voice = val;
    }

    get nickname() {
        return this._nickname;
    }

    set nickname(val) {
        this._nickname = val;
    }

    get thread() {
        return this._thread;
    }

    set thread(val) {
        this._thread = val;
    }
}

module.exports = {
    voteModule
}