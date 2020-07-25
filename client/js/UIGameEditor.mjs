import Game from "./Game.mjs";

class UIGameEditor {

    static gameEditors = new Array();

    // currently edited game
    static active = null;

    game;

    constructor(game) {
        this.game = game;
        w2ui['layout'].get('main').tabs.add({ id: 'tabGame' + this.game.id,
            text: '<span class="w2ui-icon-pencil"></span> ' + this.game.name,
            closable: true,
            gameId: this.game.id,
            content: 'paneGameX',
            onClose: function(event) {
                UIGameEditor.closeGame(event.object.gameId);
                if(w2ui['layout'].get('main').content.name == 'paneGameX')
                    w2ui['layout'].html('main', w2ui['paneGames']);
            },
        });
    }

    // deliver list of editable fields for UI
    getFields() {
        return [
            {'name':'Name', 'value':this.game.name},
            {'name':'Description', 'value':this.game.description},
            {'name':'Projekt URL', 'value':this.game.url},
        ];
    }


    /**
     * Open a new editor tab (if not already open) for the given game.
     * If already open, activate the editor tab.
     *
     * @param gameId
     */
    static async editGame(gameId) {
        if(!this.gameEditors[gameId]) {
            console.log('edit game');
            let game = await Game.getGame(gameId);
            console.log('start editor');
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