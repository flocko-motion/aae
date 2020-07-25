import Cookie from "./Cookie.mjs";
import Com from "./Com.mjs";

/*--------------------------------------------
Module "User" - a user
--------------------------------------------*/



class User {

    static user;

    avatar;

    _uid;


    constructor(role) {
        this._uid = Cookie.get("uid");
        if(this._uid) this._updateAvatarUrl();
        this.unum = null; // user number
        this.name = Cookie.get("name");
        this.role = role;
        if (!this._uid) {
            this.uid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }
    }

    _updateAvatarUrl() {
        this.avatar = "https://avatars.dicebear.com/v2/avataaars/" + this._uid + "-" + 0
        + ".svg?options[mouth][1]=smile&options[mouth][0]=twinkle&options[style]=circle&options[accessoriesChance]=60";
    }

    // register user with server
    async register() {
        await (new Com.Message(this.uid, 'srv', 'reg', 'user', null, Com.Message.SEND_AND_WAIT)).send();
    }

    set uid(s) {
        /* Ui.data.uid = this._uid = s; */
        Cookie.set('uid', s, 365);
        this._updateAvatarUrl();
        $("#avatar").attr("src", this.avatar);
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

    async register() {
        await super.register();
        await (new Com.Message(this._uid, 'srv', 'reg', 'subscription', Com.Message.SEND_AND_WAIT)).send();
    }
}

export default { Player, Master }