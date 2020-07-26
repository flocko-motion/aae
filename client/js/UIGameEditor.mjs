import Game from "./Game.mjs";

class UIGameEditor {

    static gameEditors = [];

    // config
    static CHANNELS_MAX = 16;
    static CHANNEL_NAME_MAX_LEN = 63;
    static GAME_NAME_MAX_LEN = 63;
    static GAME_DESCRIPTION_MAX_LEN = 255;
    static GAME_URL_MAX_LEN = 255;
    static MEDIA_NAME_MAX_LEN = 63;

    // currently edited game
    /** @type {UIGameEditor} */
    static active = null;

    /** @type {Game} */
    game;

    /**
     *
     * @param {Game} game
     */
    constructor(game) {
        this.game = game;
        w2ui['layout'].get('main').tabs.add({ id: 'tabGame' + this.game.id,
            text: 'Loading..',
            closable: true,
            gameId: this.game.id,
            content: 'paneGameX',
            onClose: function(event) {
                UIGameEditor.closeGame(event.object.gameId);
                if(w2ui['layout'].get('main').content.name === 'paneGameX')
                    w2ui['layout'].html('main', w2ui['paneGames']);
            },
        });
        this.updateTab();
    }

    /**
     * Add a channel
     * @returns channel name, if successfull, false, if maximum number of channels reached
     */
    addChannel() {
        if(this.game.channels.length >= UIGameEditor.CHANNELS_MAX) return false;
        this.game.channels.push({name: null, assignment: "auto", playersMin: null, playersMax: null});
        return this.setChannelName(this.game.channels.length - 1, 'New Channel');
    }

    getChannelId(name) {
        for(const id in this.game.channels) {
            if(this.game.channels.hasOwnProperty(id) && this.game.channels[id].name === name) return id;
        }
        return null;
    }

    // deliver list of editable info fields for UI
    getRecordsChannels() {
        let records = [];
        let recid = 1;
        for(const channel of this.game.channels) {
            records.push({ ...{recid: recid++},  ...channel });
        }
        return records;
    }

    // deliver list of editable info fields for UI
    getRecordsInfo() {
        const fields = {'name':'Name',
            'description':'Description',
            'url':'Project URL'};
        let res = [];
        for(const [k, v] of Object.entries(fields)) res.push({'name':v, 'value':this.game[k], 'property':k});
        return res;
    }

    // deliver list of editable info fields for UI
    getRecordsMedia() {
        let records = [];
        let recid = 1;
        let folders = {};

        // push items which are in a directory
        const mediaSorted = Object.entries(this.game.media).sort(function(v1, v2) {
            const f1 = v1[1].folder ? v1[1].folder : null;
            const f2 = v2[1].folder ? v2[1].folder : null;
            if(f1 == null && f2 != null) return 1;
            else if(f1 != null && f2 == null) return -1;
            else if(f1 != null && f2 != null && f1 > f2) return 1;
            else if(f1 != null && f2 != null && f1 < f2) return -1;
            else if(v1[1].name > v2[1].name) return 1;
            else if(v1[1].name < v2[1].name) return -1;
            else return 0;
        });
        for(const item of mediaSorted) {
            const media = item[1];
            if(media['folder']) {
                let folderName = String(media['folder']);
                if(!folders['_' + folderName]) {
                    folders['_' + folderName] = {recid: recid++, directory: true, name: folderName, w2ui: {children: []}};
                    records.push(folders['_' + folderName]);
                }
                // recid of items in folder has to be XY, where X=recid of folder and Y is id within folder
                folders['_' + folderName]['w2ui']['children'].push(
                    { ...{recid: folders['_' + folderName]['recid'] * 10 + folders['_' + folderName]['w2ui']['children'].length + 1, id: item[0]}, ...media });
            }
        }
        // push items which are not in a directory
        // mediaSorted = Object.entries(this.game.media).sort((v1, v2) => v1[1].name > v2[1].name ? 1 : -1 );
        for(const item of mediaSorted) {
            if(!item[1]['folder']) {
                records.push({ ...{recid: recid++, id: item[0]},  ...item[1] });
            }
        }
        return records;
    }

    getMediaFolders() {
        const folders = [];
        for(const media of Object.values(this.game.media)) {
            if(media['folder'] && !folders.includes(media['folder'])) {
                folders.push(media['folder']);
            }
        }
        folders.sort();
        return folders;
    }

    removeChannel(i) {
        // TODO: update server
        this.game.channels.splice(i, 1);
        console.log('remove');
    }

    removeMedia(id) {
        if(this.game.media.hasOwnProperty(id)) {
            delete this.game.media[id];
            // TODO: delete file from server
        }
    }

    /**
     * change channel name - if name exists, add suffix to make name unique
     * @param id - id of the channel
     * @param name - new name
     * @returns name with added suffix
     */
    setChannelName(id, name) {
        // TODO: update server
        name = w2utils.stripTags(name).substr(0, UIGameEditor.CHANNEL_NAME_MAX_LEN);
        let i = 0;
        let found = false;
        while(!found) {
            found = true;
            for(const channel of this.game.channels) {
                if(channel.name === name + (i ? ' #' + i : '')) {
                    i++;
                    found = false;
                    break;
                }
            }
        }
        name = name + (i ? ' #' + i : '');
        this.game.channels[id].name = name;
        return name;
    }

    /**
     * change any (existing) property of a channel
     * @param id - id of channel
     * @param property - property to change
     * @param value - new value
     * @returns new value
     */
    setChannelProperty(id, property, value) {
        // TODO: update server
        if(property === 'name') return this.setChannelName(id, value);
        if(this.game.channels[id].hasOwnProperty(property)) {
            this.game.channels[id][property] = value;
            return value;
        } else throw new Error('property "'+property+'" not found in channel '+id);
    }

    /**
     * change any (existing) property of game
     * @param property
     * @param value
     * @returns {boolean} success
     */
    setGameProperty(property, value) {
        // TODO: update server
        if(this.game.hasOwnProperty(property)) {
            switch(property) {
                case 'description':
                    value = w2utils.stripTags(value).substr(0, UIGameEditor.GAME_DESCRIPTION_MAX_LEN);
                    break;
                case 'name':
                    value = w2utils.stripTags(value).substr(0,UIGameEditor.GAME_NAME_MAX_LEN);
                    break;
                case 'url':
                    value = w2utils.stripTags(value).substr(0,UIGameEditor.GAME_URL_MAX_LEN);
                    break;            }
            this.game[property] = value;
            if(property === 'name') this.updateTab();
            return true;
        }
        return false;
    }

    setMediaFolder(id, folder) {
        // TODO: update server
        if(this.game.media.hasOwnProperty(id)) {
            this.game.media[id].folder = w2utils.stripTags(folder).substr(0, UIGameEditor.MEDIA_NAME_MAX_LEN);
        }
    }

    setMediaName(id, name) {
        // TODO: update server
        if(this.game.media.hasOwnProperty(id)) {
            this.game.media[id].name = w2utils.stripTags(name).substr(0, UIGameEditor.MEDIA_NAME_MAX_LEN);
        }
    }

    /**
     * Update editor tab of this game
     */
    updateTab() {
        w2ui['layout'].get('main').tabs.get('tabGame' + this.game.id).text =
            '<span class="w2ui-icon-pencil"></span> ' + this.game.name.substr(0,20) + (this.game.name.length > 20 ?  '..' : '');
        w2ui['layout'].get('main').tabs.render();
    }


    /**
     * Open a new editor tab (if not already open) for the given game.
     * If already open, activate the editor tab.
     *
     * @param gameId
     */
    static async editGame(gameId) {
        if(!this.gameEditors[gameId]) {
            let game = await Game.getGame(gameId);
            this.gameEditors[gameId] = new UIGameEditor(game);
        }
        this.active = this.gameEditors[gameId];
        w2ui['layout'].html('main', w2ui['paneGameX']);
        w2ui['layout'].get('main').tabs.select('tabGame' + gameId);
    }

    /**
     * Close editor for given game
     * @param gameId
     */
    static closeGame(gameId) {
        delete this.gameEditors[gameId];
        w2ui['layout_main_tabs'].select('tabGames');
    }
}

export default UIGameEditor;