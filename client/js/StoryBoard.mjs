import Time from "./Time.mjs";
import User from "./User.mjs";

/*--------------------------------------------
Module "Game" - the storyboard engine

This module knows which file to play at what
time...

--------------------------------------------*/


class StoryBoard {

    static chapters = [];

    static init() {
        StoryBoard.timeStart = 0;
        StoryBoard.loadingPhase = 0;
        StoryBoard.hero = 2;
        //Game.chapters['intro'] = new GameChapter(Game.rootDir + 'intro.mp3', 394, 0);
        StoryBoard.chapters['game'] = new Chapter('bamory_0.mp3', 2935.693083, 0);
        //Game.chapters['outro'] = new GameChapter(Game.rootDir + 'outro.mp3', 377, Game.chapters['game'].len);
        StoryBoard.chapter = StoryBoard.chapters['game'];
    }

    // i received my unum (user number) and will now select my individual track
    static pickTrack() {
        let role;
        if (User.user.unum === StoryBoard.hero) role = 'hero';
        else role = User.user.unum % 4;
        StoryBoard.chapters['game'] = new Chapter(/* StoryBoard.rootDir +*/ 'bamory_' + role + '.mp3', 2935.693083, 0);
    }

    // main loop
    static update() {
        // set current chapter
        // let t = Time.game();
        return;

        if (StoryBoard.loadingPhase === 0) {
            /* Ui.data.loadingProgress = SndEngineHtml5.rateChangeTimes.length / config.sound.rateChangeTimes * 100; */
            if (SndEngineHtml5.rateChangeTimes.length === config.sound.rateChangeTimes) {
                StoryBoard.loadingPhase = 1;
                Snd.volume(1);
                // if (Ui.page() === 'loading') Ui.page('game');
            }
        }

        /*
        if(t < 0) Game.chapter = Game.chapters['intro'];
        else if (t > Game.chapters['game'].len)
        {
            Game.chapter = Game.chapters['outro'];
        }
        else Game.chapter = Game.chapters['game'];
        */
        // change sound file?
        if (Snd.engine.url && (Snd.engine.url !== StoryBoard.chapter.url)) {
            console.log('change audio: ' + StoryBoard.chapter.url);
            Snd.load(StoryBoard.chapter.url);
        }
    }

    /*
    static getChapter() {
        return Game.chapter;
    }
    */

    static getChapterTime() {
        return Time.game() - StoryBoard.chapter.offset;
    }

    static set timeStart(t) {
        StoryBoard._timeStart = Number(t);
    }

    static get timeStart() {
        return StoryBoard._timeStart;
    }

}

class Chapter {

    constructor(url, len, offset) {
        this.url = url;
        this.len = len;
        this.offset = offset;
    }
}

export default StoryBoard