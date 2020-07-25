import Log from "./Log.mjs";
import Com from "./Com.mjs";
import User from "./User.mjs";

/*--------------------------------------------
Module "Time" - The master clock
--------------------------------------------*/


class Time {

    static syncSteps = 1;
    static syncInterval = 100;
    static randomDelta = 0; // Math.round(Math.random() * 100000) / 1000 ;
    static synced = false;
    static syncTimer = null;
    static pings = [];
    static pingsCount = 0;
    static diff = 0;

    static init() {
        if(!this.synced) this.sync();
    }

    static stamp() {
        return parseFloat(moment().format('X.SSS')) + this.randomDelta;
    }

    static server() {
        return parseFloat(moment().format('X.SSS')) + this.randomDelta + this.diff;
    }

    static game() {
        return this.server() - StoryBoard.timeStart;
    }

    static sync(n) {
        if (!n) n = this.syncSteps;
        // TODO: UI
        //  Ui.data.timeSyncSteps = Time.syncSteps = n;
        this.syncTimerSet();
    }

    static syncTimerSet() {
        // any old timers hanging around? clear them...
        if (this.syncTimer) clearInterval(this.syncTimer);
        // start new series of pings
        this.syncTimer = setInterval(function () {
            if (Time.syncSteps-- <= 1) clearInterval(Time.syncTimer);
            else Time.syncTimerSet();
            // TODO: UI
            //  Ui.data.timeSyncSteps = this.syncSteps;
            Time.ping();
        }, this.syncInterval * Math.pow(1.05, this.pingsCount));
    }

    // send a single server ping to calculate offset
    static ping() {
        (new Com.Message(User.user.uid, 'srv', 'get', 'time', this.stamp(), Com.Message.SEND_INSTANTLY)).send();
        this.pingsCount = /* Ui.data.timePingsCount = */ this.pingsCount + 1;
    }

    // ping sent the local time, we received the server time
    static pingResponse(sent, received) {
        const t = this.stamp();
        const roundTrip = t - sent;
        if (!roundTrip || roundTrip < 0) Log.log('Time', Log.ERROR, 'illegal roundTrip value: ' + roundTrip);
        const diff = received - sent + (roundTrip / 2);

        //console.log('pingResponse: ' + sent + ' -> ' + received + ' diff:'+diff);
        this.pings.push({'diff': diff, 'roundTrip': roundTrip});
        // calculate average diff
        this.pings.sort(function (a, b) {
            return (a.roundTrip > b.roundTrip) ? 1 : ((b.roundTrip > a.roundTrip) ? -1 : 0);
        });
        if (this.pings.length > Math.max(1, this.syncSteps)) this.pings.pop();
        this.diff = this.pings[0].diff;
        const sd = this.roundTripStandardDeviation();
        // need more sync steps?
        if (this.syncSteps < 2 && (this.pings[0].roundTrip >= 0.5 || sd > 0.0001)) this.syncSteps++;
        // update ui
        // TODO: UI
        // Ui.data.timeRoundTripStandardDeviation = sd;
        // Ui.data.timePings = this.pings;
    }

    static roundTripStandardDeviation() {
        if (!this.pings.length) return null;
        let sum = 0;
        for (let i in this.pings) {
            if(this.pings.hasOwnProperty(i))
                sum += this.pings[i].roundTrip;
        }
        let mean = sum / this.pings.length;
        let sd = 0;
        for (let i in this.pings) {
            if(this.pings.hasOwnProperty(i)) sd += Math.pow(this.pings[i].roundTrip - mean, 2);
        }
        sd /= this.pings.length;
        return sd;
    }

    static set diff(n) {
        this.__diff = n;
        // TODO: UI
        // Ui.data.timeDiff = n;
    }

    static get diff() {
        return this.__diff;
    }
}
// for testing robustness of sync: set internal time off by randomDelta


export default Time;