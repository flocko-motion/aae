
/*--------------------------------------------
Module "Snd" - the sound engine

Mobile: https://github.com/goldfire/howler.js#mobilechrome-playback

--------------------------------------------*/

class Snd {

    static refreshInterval = 200;
    static syncMode = 'soft';
    static syncModeThreshold = 0.03; // if rate change takes longer than this (seconds) then switch to hard sync
    static softSyncInterval = 1000;
    static hardSyncInterval = 30000;
    static rateChangeTimes = 10; // how many times to measure rate change before deciding if to switch to hard sync

    static init(engine) {
        Snd.enabled = true;
        Snd.engine = engine;
        Snd.syncCountDown = 0;


        // Snd.engine.play();


        setInterval(function () {


            StoryBoard.update();

            let diff = Snd.diff();
            Snd.engine.analyzeBuffer();
            // faster countdown for big diff
            let acc = Ui.data.sndSyncCountDownA = Math.pow(Math.abs(diff / 2), 2) + 1;
            Snd.syncCountDown /= acc;
            //
            Snd.syncCountDown -= config.sound.refreshInterval;
            if (Snd.syncCountDown <= 0) {
                if (config.sound.syncMode === 'soft') {
                    if (Snd.engine.sync())
                        Snd.syncCountDown = config.sound.softSyncInterval;
                } else {
                    if (Snd.engine.sync())
                        Snd.syncCountDown = config.sound.hardSyncInterval;
                }
            }
            Ui.data.sndSyncCountDown = Snd.syncCountDown;
            Ui.data.sndStatus = Snd.engine.status();


        }, config.sound.refreshInterval);
    }

    // user clicks -> play silent sound to enable playback on mobile
    static enable() {
        Log.log('Snd', Log.DEBUG, 'mobile audio try enabling..!');
        const a = $('#audioEnabler').get(0);
        a.currentTime = 0;
        a.volume = 0;
        a.play();

        a.onplaying = function () {
            const a = $('#audioEnabler').get(0);
            a.onplaying = null;
            Snd.enabled = true;
            Log.log('Snd', Log.DEBUG, 'enabler playing! load real audio..');
            Snd.load(StoryBoard.chapter.url);
        };
    }

    static volume(v) {
        const a = $('#audioEnabler').get(0);
        if (v) a.volume = Math.min(1, Math.max(0, v));
        else return a.volume;
    }

    static play() {
        Snd.engine.play();
    }

    static load(url) {
        Ui.data.sndUrl = url;
        Snd.engine.load(url);
    }

    static stop() {
        Snd.engine.stop();
    }

    static setSyncMode(mode) {
        if (mode === config.sound.syncMode) return;
        if (mode !== 'soft' && mode !== 'hard') {
            Log.log('Snd', Log.ERROR, 'setSyncMode: illegal mode=' + mode);
            return;
        }
        Snd.syncCountDown = 0;
        Snd.engine.setSyncMode(mode);
        config.sound.syncMode = mode;
        Ui.data.sndSyncMode = config.sound.syncMode;
    }

    static sync() {
        return Snd.engine.sync();
    }

    // go to playback position in seconds
    static seek(s) {
        return Snd.engine.seek(s);
    }

    // calculate seek error in seconds
    static diff() {
        const diff = Snd.engine.diff();
        if (diff === null) return null;
        Ui.data.sndDiff = diff;
        Ui.data.sndDiffs.push({'t': StoryBoard.getChapterTime(), 'd': diff});
        if (Ui.data.sndDiffs.length > 200) Ui.data.sndDiffs.shift();
        return diff;
    }

}

Snd.media = null;
Snd.channel = null;

// sound engine for "Snd" module - type: html5
class SndEngineHtml5 {


    constructor() {
        Log.log('SndEngineHtml5', Log.DEBUG, 'init()');
        this.media = null;
        this.rateChangeTimer = 0;
        this.seekToken = 0; // incremented when engine calls seek, decremented after seek.. needed to detect user seeks
        this.seekOffset = 0;
    }

    load(url) {
        const a = $('audio#audioEnabler')[0];
        a.src = this.url = url;

        // get audio element from jquery bag
        this.media = a; // a[0];
        this.media.engine = this;

        Log.log('SndEngineHtml5', Log.VERBOSE, 'load audio: ' + url);

        const autoplay = true;
        // autoplay?
        if (autoplay) this.media.oncanplay = function () {
            if (this.paused) {
                Log.log('SndEngineHtml5', Log.DEBUG, 'oncanplay->play and sync');
                try {
                    let promise = this.play();
                    this.engine.sync();
                } catch (e) {
                    Log.log('SndEngineHtml5', Log.ERROR, 'exception: ' + e)
                }

            }
            //this.play();


        };
        this.media.onprogress = function (/*o*/) {
            //console.log('SndEngineHtml5: progress: ' + o);
        };

        this.media.onratechange = function (/*o*/) {
            this.engine.rateChangeMeasure();
        };

        this.media.onseeked = function (/*o*/) {
            this.engine.onseeked();
        };


    }

    status() {
        if (!Snd.engine.media) return 'not loaded';
        let paused = 'paused=' + Snd.engine.media.paused;
        if (paused) Snd.engine.media.play();
        return paused;
    }


    analyzeBuffer() {
        const media = this.media;
        if (!media) return;
        const t = media.currentTime;
        if (!t) return;
        let t0 = null;
        let t1 = null;
        for (let i = 0; i < media.buffered.length; i++) {
            t0 = media.buffered.start(i);
            t1 = media.buffered.end(i);
            if (t0 <= t && t1 >= t) {
                Ui.data.sndBuffer = Number(t0 - t).toFixed(1) + 's / +' + Number(t1 - t).toFixed(1) + 's';
                break;
            }
        }

    }

    len() {
        if (isNaN(Snd.engine.media.duration)) return 0;
        const len = StoryBoard.chapter.len; // this.media.duration;
        Ui.data.sndLen = len;
        return len;
    }

    play() {
        this.media.play();
    }

    stop() {
        this.media.pause();
    }

    sync() {
        if (!this.media || this.media.paused) return false;
        const diff = this.diff();
        if (!diff) return;
        if (config.sound.syncMode === 'soft') {
            if (Math.abs(diff) > 5) {
                this.seek(StoryBoard.getChapterTime());
            } else {
                let r = 1 - (Math.sign(diff) * Math.log10(Math.pow(Math.abs(diff), 2) + 1));
                r = Math.round(r * 10000) / 10000;
                if (r > 0) this.rate(r);
            }
        } else {
            this.seek(StoryBoard.getChapterTime());
            this.rate(1);
        }
        return true;
        //Log.log('SndEngineHtml5',Log.DEBUG,'sync->diff='+diff);
    }

    diff() {
        if (!this.media) return null;
        const len = this.len();
        if (!len) return null;
        let s = StoryBoard.getChapterTime();
        s = s % len;
        if (s < 0) s += len;

        return (this.media.currentTime - s) % len;
    }

    setSyncMode(mode) {
        if (mode === 'hard') {
            this.rate(1);
        }
    }

    seek(s) {
        const len = (this.len());
        //Ui.data.sndSeekDebug = s + '/' + len + '/' + (s%len);
        if (len > 0) {
            // try to target better from experience
            const diff = this.diff();
            if (diff < 1) this.seekOffset = Math.max(-1, Math.min(1, this.seekOffset + diff));
            s = s - this.seekOffset;
            //
            s = s % len;
            if (s < 0) s += len;
            Log.log('SndEngineHtml5', Log.VERBOSE, 'seek ' + s);
            this.seekToken++;
            this.media.currentTime = s;
        } else Log.log('SndEngineHtml5', Log.ERROR, 'cant seek cause no len()');

    }

    onseeked() {
        // somebody else seeked
        if (this.seekToken === 0) {
            if (this.media.currentTime !== 0) {
                Log.log('SndEngineHtml5', Log.VERBOSE, 'who seeked? resync! ' + this.media.currentTime);
                this.sync();
            }
        }
        // engine seek
        else {
            this.seekToken--;
        }
    }

    rate(r) {
        this.rateChangeTimer = Time.stamp();
        //console.log(this.media.playbackRate);
        Ui.data.sndRate = this.media.playbackRate = r;
    }


    rateChangeMeasure() {
        if (config.sound.syncMode === 'hard' || isNaN(Snd.engine.media.duration)) {
            return;
        }
        let dt = Time.stamp() - this.rateChangeTimer;
        //console.log(dt + ' / ' + Snd.engine.media.duration);
        SndEngineHtml5.rateChangeTimes.push(dt);

        if (SndEngineHtml5.rateChangeTimes.length > config.sound.rateChangeTimes) SndEngineHtml5.rateChangeTimes.shift();
        let sum = SndEngineHtml5.rateChangeTimes.reduce(function (a, b) {
            return a + b;
        });
        let avg = sum / SndEngineHtml5.rateChangeTimes.length;

        if (SndEngineHtml5.rateChangeTimes.length === 10 && avg > config.sound.syncModeThreshold)
            Snd.setSyncMode('hard');
        else Snd.setSyncMode('soft');
        Ui.data.sndRateChangeDelay = avg.toFixed(3) + 's /'
            + Number(config.sound.syncModeThreshold).toFixed(3)
            + 's (' + SndEngineHtml5.rateChangeTimes.length + ')';
    }


}

SndEngineHtml5.nextChannelId = 0;
SndEngineHtml5.rateChangeTimes = [];
SndEngineHtml5.type = 'Html5 Audio Tag Engine';