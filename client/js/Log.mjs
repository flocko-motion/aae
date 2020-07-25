import Time from "./Time.mjs";

/*--------------------------------------------
Module "Log" - The log handler

Log levels:
0 - only errors
1 -
1 - more details
2 - debug
--------------------------------------------*/

class Log {

    static initialized = false;
    static ERROR = 0;
    static WARNING = 1;
    static MESSAGE = 2;
    static VERBOSE = 3;
    static DEBUG = 4;

    static init() {
        if(this.initialized) return;
        this.t0 = Time.stamp();
        this.logs = [];
        this.nextLogId = 0;
        this.levels = ['ERROR', 'WARNG', 'MSSGE', 'VRBSE', 'DEBUG'];
    }

    static log(chapter, level, text) {
        if(!this.initialized) throw "Log used before being initialized";
        const id = Log.nextLogId++;
        Log.logs[id] = {
            'id': id,
            'time': (Time.stamp() - Log.t0).toFixed(2),
            'level': level,
            'chapter': chapter,
            'text': text
        };
        /* Ui.data.log = Log.logs; */
    }

    static assert(b, error) {
        if(!error) error = 'ERROR';
        if(!b) throw new AssertionException(error);
    }

    static AssertionException(value) {
        this.value = value;
        this.message = 'Assertion failed';
        this.toString = function() {
            return this.value + this.message;
        };
    }

}

export default Log