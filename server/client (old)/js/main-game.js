
/*--------------------------------------------
Module "Control" - game control
--------------------------------------------*/

class Control {

    static parseCommand(cmd) {
        cmd = String(cmd).trim().toLowerCase();
        if (!cmd) return;
        let stdout;
        cmd = cmd.split(' ');
        switch (cmd[0]) {
            case 'start':
                let t;
                if (!cmd[1]) t = moment();
                // start n - start in n minutes
                else if (String(Number(cmd[1])) === cmd[1]) {
                    t = moment().add(Number(cmd[1]), 'minutes')
                }
                // start hh:mm - start at given time
                else {
                    t = moment(moment().format('YYYY-MM-DD') + "T" + cmd[1] + ":00");
                    if (t.unix() < moment().unix()) {
                        t.add(1, 'days');
                    }
                }
                stdout = 'set start to ' + t.format('YYYY-MM-DD HH:mm:ss');
                new Message(user.uid, 'srv', 'set', 'start', t.unix()).send();
                break;
            case 'hero':
                let hero = Number(cmd[1]);
                if (!hero) {
                    stdout = 'bad command';
                    return;
                }
                new Message(user.uid, 'srv', 'set', 'hero', hero).send();
                break;
            case 'users':
                new Message(user.uid, 'srv', 'get', 'users').send();
                break;
            case 'user':
                if (!cmd[1]) return;
                new Message(user.uid, 'srv', 'debug', 'user', cmd[1]).send();
                break;
            case 'version':
                new Message(user.uid, 'srv', 'get', 'version').send();
                break;
            default:
                stdout = 'no command';
        }
        if (stdout) {
            Log.log('Control', Log.MESSAGE, stdout);
            Ui.data.controlOut = stdout;
        }
        $('#shellInput').val('');
    }
}

$(function () {
    Bam.init('player');
});
