'use strict';

// TODO: identify old browsers and kick them out

// TODO: messages need confirmation, have unconfirmed messages counter
// TODO: have websocket connection status
// TODO: have most recent message received from server stat

const config = {
    'server': {
        'url': '',
        'dirMedia': 'https://bammedia.omnitopos.net/'
    },
    'time': {
        'syncSteps': 8,
        'syncInterval': 3000,
    },
    'sound': {
        'refreshInterval': 200,
        'syncMode': 'soft',
        'syncModeThreshold': 0.03, // if rate change takes longer than this (seconds) then switch to hard sync
        'softSyncInterval': 1000,
        'hardSyncInterval': 30000,
        'rateChangeTimes': 10, // how many times to measure rate change before deciding if to switch to hard sync
    }
};

Number.toFixedSafe = function (n, d) {
    if (!d) d = 0;
    if (isNaN(n)) return n;
    else return Number(n).toFixed(d);
};

function assert(b, error) {
    if(!error) error = 'ERROR';
    if(!b) throw new AssertionException(error);
}
function AssertionException(value) {
   this.value = value;
   this.message = 'Assertion failed';
   this.toString = function() {
      return this.value + this.message;
   };
}

/*

console.error = (function() {

    var error = console.error;
    console.log(error);

    return function(exception) {
        if (typeof exception.stack !== 'undefined') {
            error.call(console, exception.stack);
        } else {
            error.apply(console, arguments);
        }
    }
})();
*/

/*--------------------------------------------
Module "Cookie" - The cookie handler
--------------------------------------------*/

class Cookie {

}
Cookie.set = function (name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
};

Cookie.get = function (name) {
    const b = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
    return b ? b.pop() : '';
};


/*--------------------------------------------
Module "Time" - The master clock
--------------------------------------------*/


class Time {

    static init() {
        if(!Time.synced) Time.sync();
    }

    static stamp() {
        return parseFloat(moment().format('X.SSS')) + this.randomDelta;
    }

    static server() {
        return parseFloat(moment().format('X.SSS')) + this.randomDelta + Time.diff;
    }

    static game() {
        return Time.server() - Game.timeStart;
    }

    static sync(n) {
        if (!n) n = config.time.syncSteps;
        Ui.data.timeSyncSteps = Time.syncSteps = n;
        Time.syncTimerSet();
    }

    static syncTimerSet() {
        // any old timeers hanging around? clear them...
        if (Time.syncTimer) clearInterval(Time.syncTimer);
        // start new series of pings
        Time.syncTimer = setInterval(function () {
            if (Time.syncSteps-- <= 1) clearInterval(Time.syncTimer);
            else Time.syncTimerSet();
            Ui.data.timeSyncSteps = Time.syncSteps;
            Time.ping();
        }, config.time.syncInterval * Math.pow(1.05, Time.pingsCount));
    }

    // send a single server ping to calculate offset
    static ping() {
        (new Message(user.uid, 'srv', 'get', 'time', Time.stamp(),Message.SEND_INSTANTLY)).send();
        Time.pingsCount = Ui.data.timePingsCount = Time.pingsCount + 1;
    }

    // ping sent the local time, we received the server time
    static pingResponse(sent, received) {
        const t = Time.stamp();
        const roundTrip = t - sent;
        if (!roundTrip || roundTrip < 0) Log.log('Time', Log.ERROR, 'illegal roundTrip value: ' + roundTrip);
        const diff = received - sent + (roundTrip / 2);

        //console.log('pingResponse: ' + sent + ' -> ' + received + ' diff:'+diff);
        Time.pings.push({'diff': diff, 'roundTrip': roundTrip});
        // calculate average diff
        Time.pings.sort(function (a, b) {
            return (a.roundTrip > b.roundTrip) ? 1 : ((b.roundTrip > a.roundTrip) ? -1 : 0);
        });
        if (Time.pings.length > config.time.syncSteps) Time.pings.pop();
        Time.diff = Time.pings[0].diff;
        const sd = Time.roundTripStandardDeviation();
        // need more sync steps?
        if (Time.syncSteps < 2 && (Time.pings[0].roundTrip >= 0.5 || sd > 0.0001)) Time.syncSteps++;
        // update ui
        Ui.data.timeRoundTripStandardDeviation = sd;
        Ui.data.timePings = Time.pings;
    }

    static roundTripStandardDeviation() {
        if (!Time.pings.length) return null;
        let sum = 0;
        for (let i in Time.pings) {
            if(Time.pings.hasOwnProperty(i))
                sum += Time.pings[i].roundTrip;
        }
        let mean = sum / Time.pings.length;
        let sd = 0;
        for (let i in Time.pings) {
            if(Time.pings.hasOwnProperty(i)) sd += Math.pow(Time.pings[i].roundTrip - mean, 2);
        }
        sd /= Time.pings.length;
        return sd;
    }

    static set diff(n) {
        Time.__diff = n;
        Ui.data.timeDiff = n;
    }

    static get diff() {
        return Time.__diff;
    }
}

// for testing robustness of sync: set internal time off by randomDelta
Time.randomDelta = Ui.data.timeRandomDelta = 0; // Math.round(Math.random() * 100000) / 1000 ;
Time.synced = false;
Time.syncTimer = null;
Time.syncSteps = 0;
Time.pings = [];
Time.pingsCount = 0;
Time.diff = 0;


/*--------------------------------------------
Module "Log" - The log handler

Log levels:
0 - only errors
1 -
1 - more details
2 - debug
--------------------------------------------*/

class Log {


    static log(chapter, level, text) {
        const id = Log.nextLogId++;
        Log.logs[id] = {
            'id': id,
            'time': (Time.stamp() - Log.t0).toFixed(2),
            'level': level,
            'chapter': chapter,
            'text': text
        };
        Ui.data.log = Log.logs;
    }

}

Log.t0 = Time.stamp();
Log.logs = [];
Log.nextLogId = 0;
Log.ERROR = 0;
Log.WARNING = 1;
Log.MESSAGE = 2;
Log.VERBOSE = 3;
Log.DEBUG = 4;
Log.levels = ['ERROR', 'WARNG', 'MSSGE', 'VRBSE', 'DEBUG'];
Log.t0 = Time.stamp();

/*--------------------------------------------
Module "com" - Communication with server
--------------------------------------------*/

class Com {

    static init() {
        Com.clientId = Com.makeid(10);
        Com.pipeline = new Array();
        Com.lastReceived = null;
        Com.socket = io.connect(config.server.url, {secure: true, transports: ['websocket']});
        Com.socket.on('pong', (latency) => {
            Com.lastReceived = Time.stamp();
        });
        Com.socket.on('connect', (latency) => {
            // TODO: after a reconnect, register with server again
            console.log('connect');
            Com.lastReceived = Time.stamp();
            Time.sync();
        });
        Com.socket.on('disconnect', (latency) => {
            console.log('disconnect');
            Com.lastReceived = Time.stamp();
        });
        Com.socket.on('reconnect', (latency) => {
            console.log('reconnect');
            Com.lastReceived = Time.stamp();
        });
        Com.socket.on('msg', Com.handleMessage);
        // link to Ui
        Ui.data.messagesPipeline = Com.pipeline;

    }

    static makeid(length) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    // queue message into pipeline
    static queue(message) {
        Com.pipeline.push(message);
        Com.send();
    }

    // check queue and send all ready-to-send messages
    static send() {
        let wait = false; // halt sending queued messages until response received?
        for(let i in Com.pipeline)
        {
            let message = Com.pipeline[i];
            if(message.status == Message.WAIT_AND_HALT) wait = true;
            let send = (message.status === Message.SEND_INSTANTLY
                || ((message.status === Message.SEND_AND_WAIT || message.status === Message.SEND) && !wait));
            if(send){
                let json = message.json();
                Com.socket.emit('msg', json);
                message.status = Message.status === Message.SEND_AND_WAIT ? Message.WAIT_AND_HALT : Message.WAIT;
            }
        }
    }

    // incoming message
    static handleMessage(m) {
        Com.lastReceived = Time.stamp();
        // console.log(m);
        if(m.res) {
            // find message matching this reply and mark as received
            let found = false;
            for(let i in Com.pipeline) {
                i = Number(i);
                let mp = Com.pipeline[i];
                if(mp.mid == m.mid) {
                    mp.res = m.res;
                    mp.stamps = m.stamps;
                    mp.status = Message.FINISHED;
                    mp.parseResponse();
                    found = true;
                }
                if(found) break;
            }
            if(!found) Log.log('com',Log.ERROR,'mid of received message not found in pipeline');
        }
        else Message.fromReceived(m).parseIncoming();
        // shorten pipeline
        while(Com.pipeline.length > 0) {
            if(Com.pipeline[0].status == Message.FINISHED) {
                Com.pipeline.shift();
            }
            else break;
        }

    }
}

// unique id of this connection, this user, this window...
// prevents problems with one user having several windows open -> confusion of pings

/*
Com.socket.on('msg', function (o) {
    console.log('msg: '+JSON.stringify(m));
    return;
    // dump messages w/ are not for me
    // TODO: server shouldn't send messages which are not meant for me!
    // if (m.recipient !== 'all' && m.recipient !== user.uid && (!m.res || m.sender !== user.uid)) return;

    Com.lastReceived = Time.stamp();

    // msg date -> Message object
    let m = Message.from_received(o);

    // log message
    if(m.method != 'push') {
        // while(Ui.data.messages.length > 30) Ui.data.messages.pop();
        Ui.data.messages.unshift(m);
    }
    // objectify message

    // it's a response to my request?
    if (m.res) {

        if (m.clientId === Com.clientId) switch (m.method + '-' + m.subject) {
            case 'debug-status':
                console.log(m.res);
                break;
            case 'debug-user':
                m.res = JSON.parse(m.res);
                console.log(m.res);
                let f = function (o) {
                    let res = {name: "status report"};
                    let a = [];
                    for (let i in o) {
                        // if(o[i] && typeof(o[i]) == 'object')
                        if(o.hasOwnProperty(i))
                            a.push({name: i + ': ' + String(o[i])});
                    }
                    res['children'] = a;
                    return res;
                };

                Ui.data.usersTree.children.push(f(m.res));
                console.log(f(m.res));
                break;
            case 'get-uid':
                user.uid = m.res;
                break;
            case 'get-users':
                m.res = JSON.parse(m.res);
                console.log(m.res);
                Ui.data.usersTree.children = [];
                for (let i in m.res) {
                    if(!m.res.hasOwnProperty(i)) continue;
                    let u = m.res[i];
                    if (!u.online) continue;
                    Ui.data.usersTree.children.push({
                        name: 'User #' + u.unum + (u.online ? '' : ' (Offline)'),
                        children: [{name: 'uid: ' + u.uid}, {name: 'cid: ' + u.cid}]
                    });
                }
                break;
            case 'get-time':
                Time.pingResponse(m.params, m.res);
                break;
            case 'get-version':
                console.log(m.res);
                Log.log('Com', Log.MESSAGE, 'server version ' + m.res);
                break;
            default:
                console.error('ERROR: message response has no handler' + JSON.stringify(m));
                break;
        }
    }
    // it's a request from someone else
    // TODO: make this work again
        /*
    else switch (m.method + '-' + m.subject) {
        case 'debug-user':
            const msg = new Message(m);
            msg.res = JSON.stringify(Ui.data);
            msg.send();
            break;
        case 'push-log':
            Ui.data.logServer.unshift(m.params);
            while(Ui.data.logServer.length > 200) Ui.data.logServer.pop();
            break;
        case 'set-game':
            const t = m.params;
            Log.log('Com', Log.MESSAGE, 'receive start time ' + moment.unix(t).format('YYYY-MM-DD HH:mm:ss'));
            Game.timeStart = t;
            break;
        case 'set-hero':
            const hero = m.params;
            Log.log('Com', Log.MESSAGE, 'receive hero id ' + hero);
            Game.hero = hero;
            Game.pickTrack();
            break;
        case 'set-user':
            const unum = Number(m.params);
            Log.log('Com', Log.MESSAGE, 'receive user number ' + unum);
            user.unum = unum;
            Ui.data.user = user;
            Game.pickTrack();
            break;
        default:
            console.error('ERROR: unknown server request: "' + (m.method + '-' + m.subject) + '" ' + JSON.stringify(m));
            break;
    }


});
*/

/*--------------------------------------------
Module "Message" - the message object
--------------------------------------------*/

class Message {

    constructor(sender, recipient, method, subject, params, status=Message.SEND) {
        this.status = status;
        if(status !== Message.RECEIVED) {
            this.cid = Com.socket.id;
            this.mid = Com.clientId + '-' + Message.count++;
            this.clientId = Com.clientId;
            this.stamps = [];
            this.stamp();
            this.res = null;
        }
        //
        this.sender = sender;
        this.recipient = recipient;
        this.method = method;
        this.subject = subject;
        this.params = params;
    }

    static fromReceived(o) {
        assert(o.sender !== undefined && o.recipient !== undefined && o.method !== undefined
            && o.subject !== undefined && o.params !== undefined);
        let m = new Message(o.sender, o.recipient, o.method, o.subject, o.params, Message.RECEIVED);
        if(o.stamps) m.stamps = o.stamps;
        if(o.clientId) m.clientId = o.clientId;
        if(o.res) m.res = o.res;
        return m;
    }

    send() {
        Com.queue(this);
    }

    stamp() {
        this.stamps.push(Time.stamp());
    }

    json() {
        const json = {
            'mid': this.mid,
            'clientId': this.clientId,
            'role': user.role,
            'sender': this.sender,
            'recipient': this.recipient,
            'method': this.method,
            'subject': this.subject,
            'params': this.params,
            'res': this.res,
            'stamps': this.stamps
        };
        for (let i in json) if (json[i] === undefined) json[i] = null;
        return json;
    }

    parseResponse() {
        this._parse(this.res, true);
    }

    parseIncoming() {
        this._parse(this.params, false);
    }

    _parse(o, isReply) {
        const s = this.method + '_' + this.subject + (isReply ? '_res' : '');
        let cmd = Commands[s];
        if(!isReply) assert(cmd, 'Can\'t process message, command "' + s + '" not found');
        if(cmd) cmd(o, this.stamps);

    }
}
Message.count = 0;
// static methods = ['get', 'set', 'join', 'debug'];
// static subjects = ['time', 'game', 'games', 'user', 'users'];

// message status
Message.SEND_INSTANTLY = 10; // always send right away
Message.SEND = 11; // send when on top of queue
Message.SEND_AND_WAIT = 12; // send when on top of queue and block queue until reply arrived
Message.WAIT = 20; // awaiting response
Message.WAIT_AND_HALT = 21; // awaiting response & halt queue
Message.RECEIVED = 30; // this is a received message, doesn't affect pipeline
Message.FINISHED = 40; // message has been fully processed - nothing else to do


/*--------------------------------------------
Class "Commands" - a collection of functions
to be called by a message received

function with _res suffix process answers to messages
sent by this client
--------------------------------------------*/

class Commands {

    static pushReportTimeout = null;

    // call this function to send a report
    static f_push_report() {
        Commands.pushReportTimeout = null;
        let m = moment.unix(Time.server())
        try {
            let report = Ui.dataReport();
            (new Message(user.uid, 'srv', 'push', 'report',
                JSON.stringify(report), Message.SEND_INSTANTLY)).send();

        }
        catch(e)
        {
            Log.log('exception',0,e);
        }
    }

    /* Server asks player to start sending debug reports */
    static debug_report(o, stamps) {
        try {
           Commands.f_push_report();
        } finally {}
    }

    static get_time_res(o, stamps) {
        try {
            assert(o.client);
            assert(o.server);
            Time.pingResponse(o.client, o.server);
        } finally {}
    }

    // receive push_log from server
    static push_log(o, stamps) {
        try {
            Ui.data.logServer.unshift(o);
            while(Ui.data.logServer.length > 200) Ui.data.logServer.pop();
        } finally {}
    }

    // receive push_report from other user
    static push_report(o, stamps) {
        try {
            Ui.data.masterUserReport = JSON.parse(o);
        } finally {}
    }

    // we pushed a report and receive a confirmation
    static push_report_res(o, stamps) {
        try {
            // stop reporting ?
            if(o == 'stop') {
                clearTimeout(Commands.pushReportTimeout);
                Commands.pushReportTimeout = null;
            }
            // set timer for next report
            else {
                if(Commands.pushReportTimeout) clearTimeout(Commands.pushReportTimeout);
                Commands.pushReportTimeout = setTimeout(Commands.f_push_report, 200);
            }
        } finally {}
    }

    // receive push_server from server
   static push_server(o, stamps) {
        try {
            for(let i in o.users) {
                o.users[i].avatar = User.avatarUrl(o.users[i].uid);
            }
            Ui.data.server = o;
        } finally {}
    }

    // answer to subscription request
    static reg_subscription_res(o, stamps) {}

    // answer to registration request
    static reg_user_res(o, stamps) {
        try {
            assert(o.unum, 'Expecting unum in reg_user response');
            user.unum = o.unum;
        } finally {}
    }

    // receive set_game
    static set_game(o, stamps) {
        try {
            assert(typeof(o) === 'number');
            Game.timeStart = o;
        } finally {}
    }

    // receive set_hero
    static set_hero(o, stamps) {
        try {
            assert(typeof(o) === 'number');
            Game.hero = o;
            Game.pickTrack();
        } finally {}
    }

}


/*--------------------------------------------
Module "User" - a user
--------------------------------------------*/

class User {
    constructor(role) {
        this.uid = Cookie.get("uid");
        this.unum = null; // user number
        this.name = Cookie.get("name");
        this.role = role;
        if (!this.uid) {
            this.uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    }

    // register user with server
    register() {
        (new Message(this.uid, 'srv', 'reg', 'user', null, Message.SEND_AND_WAIT)).send();
    }

    static avatarUrl(uid) {
        if(!uid) uid = this._uid;
        let url = "https://avatars.dicebear.com/v2/avataaars/" + uid + "-" + 0
            + ".svg?options[mouth][1]=smile&options[mouth][0]=twinkle&options[style]=circle&options[accessoriesChance]=60";
        return url;
    }

    set uid(s) {
        Ui.data.uid = this._uid = s;
        Cookie.set('uid', s, 365);
        $("#avatar").attr("src",User.avatarUrl(s));
    }

    get uid() {
        return this._uid;
    }
}

class Player extends User {
    constructor() {
        super('player');
    }

    get pid() {
        return this._uid;
    }

    set pid(pid) {
        throw Error("Can't set pid " + pid + ", pid is a static value");
    }
}

class Master extends User {
    constructor() {
        super('master');
    }

    register() {
        super.register();
        (new Message(this.uid, 'srv', 'reg', 'subscription', Message.SEND_AND_WAIT)).send();
    }
}


/*--------------------------------------------
Module "Game" - the storyboard engine

This module knows which file to play at what
time...

--------------------------------------------*/


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

        /*
        if(t < 0) Game.chapter = Game.chapters['intro'];
        else if (t > Game.chapters['game'].len)
        {
            Game.chapter = Game.chapters['outro'];
        }
        else Game.chapter = Game.chapters['game'];
        */
        // change sound file?
        if (Snd.engine.url && (Snd.engine.url !== Game.chapter.url)) {
            console.log('change audio: ' + Game.chapter.url);
            Snd.load(Game.chapter.url);
        }
    }

    /*
    static getChapter() {
        return Game.chapter;
    }
    */

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

/*--------------------------------------------
Module "Snd" - the sound engine

Mobile: https://github.com/goldfire/howler.js#mobilechrome-playback

--------------------------------------------*/

class Snd {

    static init(engine) {
        Snd.enabled = true;
        Snd.engine = engine;
        Snd.syncCountDown = 0;

        // Snd.engine.play();


        setInterval(function () {


            Game.update();

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
            Snd.load(Game.chapter.url);
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
        Ui.data.sndDiffs.push({'t': Game.getChapterTime(), 'd': diff});
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
        const len = Game.chapter.len; // this.media.duration;
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
                this.seek(Game.getChapterTime());
            } else {
                let r = 1 - (Math.sign(diff) * Math.log10(Math.pow(Math.abs(diff), 2) + 1));
                r = Math.round(r * 10000) / 10000;
                if (r > 0) this.rate(r);
            }
        } else {
            this.seek(Game.getChapterTime());
            this.rate(1);
        }
        return true;
        //Log.log('SndEngineHtml5',Log.DEBUG,'sync->diff='+diff);
    }

    diff() {
        if (!this.media) return null;
        const len = this.len();
        if (!len) return null;
        let s = Game.getChapterTime();
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

/*--------------------------------------------
Init
--------------------------------------------*/

let user;

class Bam {
    static init(userRole) {
        Com.init();
        assert(userRole, 'userRole missing');
        assert(userRole == 'player' || userRole == 'master', 'userRole must be "player" or "master"');
        if (userRole == 'player')
            user = new Player();
        else
            user = new Master();
        user.register();
        if (Ui && Ui.init) Ui.init();
        Game.init();
        Snd.init(new SndEngineHtml5());
    }
}

