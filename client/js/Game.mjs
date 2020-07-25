import Com from "./Com.mjs";
import User from "./User.mjs";

class Game {

    // list of available games
    static _gamesList = {};
    // loaded game data
    static games = {};

    static initialized = false;

    static async init() {
        if(!this.initialized) {
            await this.loadGamesList();
        }
    }

    static get gamesList() {
        return this._gamesList;
    }

    static set gamesList(gamesList) {
        console.log('set games list: '  + gamesList);
        this._gamesList = gamesList;
    }

    static async getGame(id) {
        if(!this.games[id]) {
            let data = await (new Com.Message(User.user.uid, 'srv', 'get', 'game', id, Com.Message.SEND_AND_WAIT)).send();
            this.games[id] = new Game(id, data);
        }
        return this.games[id];
    }

    static async loadGamesList() {
        await (new Com.Message(User.user.uid, 'srv', 'get', 'games', null, Com.Message.SEND_AND_WAIT)).send();
    }

    constructor(id, data) {
        this.id = id;
        for(let i in data) this[i] = data[i];
        console.log(this);
    }
}

export default Game



/*--------------------------------------------
Module "Game" - the storyboard engine

This module knows which file to play at what
time...

--------------------------------------------*/

/*
class Game {

    static init() {
        Game.rootDir = config.server.dirMedia + 'bamory/';
        Game.timeStart = 0;
        Game.loadingPhase = 0;
        Game.hero = 2;
        Game.chapters = [];
        //Game.chapters['intro'] = new GameChapter(Game.rootDir + 'intro.mp3', 394, 0);
        Game.chapters['game'] = new GameChapter(Game.rootDir + 'bamory_0.mp3', 2935.693083, 0);
        //Game.chapters['outro'] = new GameChapter(Game.rootDir + 'outro.mp3', 377, Game.chapters['game'].len);
        Game.chapter = Game.chapters['game'];
    }

    // i received my unum (user number) and will now select my individual track
    static pickTrack() {
        let role;
        if (user.unum === Game.hero) role = 'hero';
        else role = user.unum % 4;
        Game.chapters['game'] = new GameChapter(Game.rootDir + 'bamory_' + role + '.mp3', 2935.693083, 0);
    }

    // main loop
    static update() {
        // set current chapter
        // let t = Time.game();

        if (Game.loadingPhase === 0) {
            Ui.data.loadingProgress = SndEngineHtml5.rateChangeTimes.length / config.sound.rateChangeTimes * 100;
            if (SndEngineHtml5.rateChangeTimes.length === config.sound.rateChangeTimes) {
                Game.loadingPhase = 1;
                Snd.volume(1);
                if (Ui.page() === 'loading') Ui.page('game');
            }
        }

        // change sound file?
        if (Snd.engine.url && (Snd.engine.url !== Game.chapter.url)) {
            console.log('change audio: ' + Game.chapter.url);
            Snd.load(Game.chapter.url);
        }
    }


    static getChapterTime() {
        return Time.game() - Game.chapter.offset;
    }

    static set timeStart(t) {
        Game._timeStart = Number(t);
    }

    static get timeStart() {
        return Game._timeStart;
    }

}

class GameChapter {

    constructor(url, len, offset) {
        this.url = url;
        this.len = len;
        this.offset = offset;
    }
}

 */