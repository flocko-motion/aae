import Time from "./Time.mjs";
import User from "./User.mjs";
import Log from "./Log.mjs";
import StoryBoard from "./StoryBoard.mjs";
import Game from "./Game.mjs";

function init() {
    Com.connect();
    Time.init();
}

/*--------------------------------------------
Module "com" - Communication with server
--------------------------------------------*/

class Com {

    static initialized = false;
    static serverUrl = '';

    static connect() {
        if(this.initialized) return;
        Com.clientId = Com.makeId(10);
        Com.pipeline = new Array();
        Com.lastReceived = null;
        Com.socket = io.connect(Com.serverUrl, {secure: true, transports: ['websocket']});
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
        // TODO: link to some UI
        // Ui.data.messagesPipeline = Socket.pipeline;

    }

    static makeId(length) {
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
        Log.assert(o.sender !== undefined && o.recipient !== undefined && o.method !== undefined
            && o.subject !== undefined && o.params !== undefined);
        let m = new Message(o.sender, o.recipient, o.method, o.subject, o.params, Message.RECEIVED);
        if(o.stamps) m.stamps = o.stamps;
        if(o.clientId) m.clientId = o.clientId;
        if(o.res) m.res = o.res;
        return m;
    }

    send() {
        let message = this;
        // this.send2();
        Com.queue(message);
        return new Promise(function(resolve, reject) {
            message.onResponse = () => resolve(message.res);
            message.onError = () => reject(new Error("Sending message or receiving response failed"));
        });
    }

    stamp() {
        this.stamps.push(Time.stamp());
    }

    json() {
        const json = {
            'mid': this.mid,
            'clientId': this.clientId,
            'role': User.user.role,
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
        this.onResponse();
    }

    parseIncoming() {
        this._parse(this.params, false);
    }

    _parse(o, isReply) {
        const s = this.method + '_' + this.subject + (isReply ? '_res' : '');
        let cmd = Commands[s];
        if(!isReply) Log.assert(cmd, 'Can\'t process message, command "' + s + '" not found');
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
            /* let report = Ui.dataReport(); */
            (new Message(User.user.uid, 'srv', 'push', 'report',
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

    /* Receive list of games from server */
    static get_games_res(o, stamps) {
        console.log('received games list');
        Game.gamesList = o['games'];
    }

    static get_time_res(o, stamps) {
        try {
            Log.assert(o.client);
            Log.assert(o.server);
            Time.pingResponse(o.client, o.server);
        } finally {}
    }

    // receive push_log from server
    static push_log(o, stamps) {
        try {
            /* Ui.data.logServer.unshift(o); */
            // while(Ui.data.logServer.length > 200) Ui.data.logServer.pop();
        } finally {}
    }

    // receive push_report from other user
    static push_report(o, stamps) {
        try {
            /* Ui.data.masterUserReport = JSON.parse(o); */
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
                o.users[i].avatar = User.user.avatar;
            }
            /* Ui.data.server = o; */
        } finally {}
    }

    // answer to subscription request
    static reg_subscription_res(o, stamps) {}

    // answer to registration request
    static reg_user_res(o, stamps) {
        try {
            Log.assert(o.unum, 'Expecting unum in reg_user response');
            User.user.unum = o.unum;
        } finally {}
    }

    // receive set_game
    static set_game(o, stamps) {
        try {
            Log.assert(typeof(o) === 'number');
            StoryBoard.timeStart = o;
        } finally {}
    }

    // receive set_hero
    static set_hero(o, stamps) {
        try {
            Log.assert(typeof(o) === 'number');
            StoryBoard.hero = o;
            StoryBoard.pickTrack();
        } finally {}
    }

}



export default  { init, Socket: Com, Message, Commands }