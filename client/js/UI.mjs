import UIGameEditor from "./UIGameEditor.mjs";
import Game from "./Game.mjs";

class UI {

    constructor() {

        $('#layout').w2layout({
            name: 'layout',
            panels: [
                {type: 'top', size: 40, resizable: false},
                {
                    type: 'main',
                    tabs: {
                        name: "mainTabs",
                        active: 'tabGames',
                        tabs: [
                            {id: 'tabGames', text: 'My Games', content: 'paneGames'},
                            {id: 'tabSessions', text: 'My Sessions (3)', content: 'paneSessions'},
                            {
                                id: 'tabSessionX',
                                text: '<i class="fas fa-play"></i> TestGame',
                                closable: true,
                                content: 'paneSessionX'
                            }
                        ],
                        onClick: function(event) {
                            if (event.tab.content && w2ui[event.tab.content])
                                this.owner.html('main', w2ui[event.tab.content]);
                            else console.error('content not found: ' + event.tab.content);
                        },
                    },
                },
            ]
        });

        $().w2layout({
                name: 'paneTop',
                panels: [
                    {
                        type: 'main', style: 'padding-top: 9px; padding-left: 9px; font-size: 18px;',
                        content: '<img alt="" src="gfx/favicon.png" style="width:18px;height:18px;" />Audio Augmented Encounter Studio'
                    },
                    {
                        type: 'right', style: 'text-align:right;padding-top:9px;padding-right:9px;',
                        content: '<button id="btn-login" disabled="true" onclick="login()"><i class="fas fa-sign-in-alt"></i> Log in</button>' +
                            '<button id="btn-logout" disabled="true" hidden="true" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Log out</button>'
                    }
                ]
            });


        $().w2grid({
                name: 'paneGames',
                show: {
                    header: false,
                    lineNumbers: false,
                    toolbar: true,
                    footer: true,
                    saveRestoreState: false,
                    statusRecordID: false,
                    toolbarAdd: true,
                    toolbarColumns: false,
                    toolbarDelete: true,
                    toolbarInput: false,
                    toolbarReload: false,
                    toolbarSearch: false,
                    toolbarSave: false,
                    toolbarEdit: true
                },
                toolbar: {
                    items: [
                        {type: 'break'},
                        {type: 'button', id: 'mybutton', text: 'Launch Session', icon: 'fas fa-play'}
                    ],
                    onClick: function(target, data) {
                        console.log('item ' + target + ' is clicked. data: ' + data);
                        console.log(target);

                    },
                },
                // Edit selected game
                onEdit: function(/* event */) {
                    let game = this.get(this.getSelection()[0]);
                    UIGameEditor.editGame(game.id).then();
                },
                // w2ui is about to render this pane - let's refresh the data before that
                onRender: function(/* event */) {
                    this.clear();
                    let list = Game.gamesList;
                    let recid = 1;
                    for(let item of Object.values(list)) {
                        item['players'] = item['playersMin'] + '-' + item['playersMax'];
                        this.add({...item, ...{recid: recid++}});
                    }
                },
                columns: [
                    {field: 'name', text: 'Name', size: '30%', sortable: true},
                    {field: 'description', text: 'Notes', size: '30%', sortable: true},
                    {field: 'channels', text: 'Channels', size: '90px', sortable: true},
                    {field: 'players', text: 'Players', size: '90px', sortable: true},
                    {field: 'sessions', text: 'Sessions', size: '90px', sortable: true}
                ],
            })
        ;

        $().w2grid({
            name: 'paneSessions',
            show: {
                header: false,
                lineNumbers: false,
                toolbar: true,
                footer: true,
                saveRestoreState: false,
                statusRecordID: false,
                toolbarAdd: false,
                toolbarColumns: false,
                toolbarDelete: true,
                toolbarInput: false,
                toolbarReload: false,
                toolbarSearch: false,
                toolbarSave: false,
                toolbarEdit: false
            },
            toolbar: {
                items: [
                    {type: 'break'},
                    {type: 'button', id: 'mybutton1', text: 'Pause', icon: 'fas fa-pause'},
                    {type: 'button', id: 'mybutton3', text: 'Starting Time', icon: 'far fa-clock'},
                    {type: 'button', id: 'mybutton2', text: 'View', icon: 'far fa-eye'}
                ],
                onClick: function(target /*, data */) {
                    console.log(target);
                }
            },
            columns: [
                {field: 'id', text: 'Session', size: '90px', sortable: true},
                {field: 'game', text: 'Game', size: '30%', sortable: true},
                {field: 'players', text: 'Players', size: '90px', sortable: true},
                {field: 'status', text: 'Status', size: '90px', sortable: true},
                {field: 'timeStart', text: 'Start Time', size: '90px', sortable: true},
                {field: 'timeGame', text: 'Game Time', size: '90px', sortable: true},
            ],
            records: [
                {
                    recid: 1,
                    id: '117',
                    game: 'Story A',
                    players: '0 / 1',
                    status: 'waiting',
                    timeStart: '22:10:00',
                    timeGame: '-03:20:17'
                },
                {
                    recid: 2,
                    id: '119',
                    game: 'Story A',
                    players: '1 / 1',
                    status: 'running',
                    timeStart: '13:20:00',
                    timeGame: '00:15:10'
                },
                {
                    recid: 3,
                    id: '112',
                    game: 'Story B',
                    players: '0 / 2-4',
                    status: 'finished',
                    timeStart: '13:20:00',
                    timeGame: '00:22:30'
                },
            ],

        });

        $().w2layout({
            name: 'paneGameX',
            padding: 4,
            panels: [
                {
                    type: 'main',
                    style: "background-color:black;",
                    name: 'paneGameChart',
                    content: 'blah',
                    onShow: function(event) {
                        console.log('show' + event);
                    }
                },
                {
                    type: 'preview', size: "300px", resizable: true, tabs:
                        {
                            active: 'tab1',
                            tabs: [
                                {id: 'tab1', text: 'Game Setup', content: 'paneGameXInfo'},
                                {id: 'tab3', text: 'Channels Setup', content: 'paneGameXChannels'},
                                {id: 'tab4', text: 'Media Library', content: 'paneGameXLibrary'},
                                {id: 'tab2', text: 'Edit Clip', content: 'paneGameXEdit'},
                            ],
                            onClick: function (event) {
                                if (event.tab.content && w2ui[event.tab.content])
                                    this.owner.html('preview', w2ui[event.tab.content]);
                                else console.error('content not found: ' + event.tab.content);
                            }
                        }
                },
            ]
        });

        $().w2grid({
            name: 'paneGameXInfo',
            show: {
                toolbar: false,
                footer: false,
            },
            columns: [
                {
                    field: 'name', size: '200px', text: 'Option',
                    editable: false
                },
                {
                    field: 'value', text: 'Value',
                    editable: {type: 'text'}
                },
            ],
            onChange: function(event) {
                const row = this.get(event.recid);
                if(!row) return;
                let value = event.value_new.trim();
                if(row.property === 'name' && value === '') {
                    w2popup.open({
                        title: 'Error',
                        body: '<div class="w2ui-centered">Game must have a name!</div>',
                        buttons   : '<button class="w2ui-btn" onclick="w2popup.close();">OK</button> ',
                    });
                } else UIGameEditor.active.setGameProperty(row.property, w2utils.stripTags(value));
                this.render();
            },
            // w2ui is about to render this pane - let's refresh the data before that
            onRender: function() {
                this.clear();
                let list = UIGameEditor.active.getRecordsInfo();
                let recid = 1;
                for (let item of Object.values(list)) {
                    this.add({...item, ...{recid: recid++}});
                }
            },
        });

        $().w2grid({
            name: 'paneGameXEdit',
            show: {
                toolbar: false,
                footer: false,
            },
            columns: [
                {
                    field: 'name', size: '200px', text: 'Option',
                    editable: false
                },
                {
                    field: 'value', text: 'Value',
                    editable: {type: 'text'}
                },
            ],
            records: [
                {recid: 1, name: "Node Name", value: "Intro"},
                {recid: 10, name: "Channel 1", value: "intro_1.mp3"},
                {recid: 11, name: "Channel 2", value: "intro_2.mp3"},
                {recid: 12, name: "Channel 3", value: "intro_3.mp3"},
                {recid: 13, name: "Channel 4", value: "intro_4.mp3"},
                {
                    recid: 20,
                    name: "End Of Clip Action",
                    value: "gotoX, loop, multiple-choice, enough players, master go"
                },
                {recid: 21, name: "End Of Clip Parameter", value: "Clip 1"},
            ]
        });

        $().w2grid({
            name: 'paneGameXChannels',
            show: {
                toolbar: true,
                footer: false,
                toolbarAdd: false,
                toolbarColumns: false,
                toolbarDelete: false,
                toolbarInput: false,
                toolbarReload: false,
                toolbarSearch: false,
                toolbarSave: false,
                toolbarEdit: false,

            },
            columns: [
                {field: 'recid', text: '#', size: '50px',},
                {
                    field: 'name', text: 'Channel Name',
                    editable: {type: 'text'}
                },
                {
                    field: 'assignment', text: 'Players Assignment',
                    editable: {
                        type: 'list',
                        items: {"auto": "Automatic", "first": "Fill Up First", "last": "Fill Up Last"},
                        showAll: true
                    },
                },
                {
                    field: 'playersMin', text: 'Min. Players', render: 'int',
                    editable: {type: 'int', min: 0},
                    style: 'text-align: left',
                },
                {
                    field: 'playersMax', text: 'Max. Players', render: 'int',
                    editable: {type: 'int', min: 0},
                    style: 'text-align: left',
                },
            ],
            toolbar: {
                items: [
                    {id: 'add_channel', type: 'button', text: 'More Channels', icon: 'fas fa-plus'},
                    {id: 'remove_channel', type: 'button', text: 'Less Channel', icon: 'fas fa-minus'},
                ],
                onClick: function(event) {
                    switch(event.target) {
                        case 'add_channel':
                            if(!UIGameEditor.active.addChannel()) w2popup.open({
                                title: 'Error',
                                body: '<div class="w2ui-centered">Maximum amount of channels reached!</div>',
                                buttons   : '<button class="w2ui-btn" onclick="w2popup.close();">OK</button> ',
                            });
                            this.owner.render();
                            break;
                        case 'remove_channel':
                            let selection = this.owner.getSelection();
                            for(let recid of selection) {
                                UIGameEditor.active.removeChannel(recid - 1);
                                break; // no multi selection supported
                            }
                            this.owner.render();
                            break;
                    }
                }
            },
            onChange: function(event) {
                const column = this.columns[event.column];
                const property = column.field;
                const channelId = UIGameEditor.active.getChannelId(this.get(event.recid)['name']);
                if(channelId !== null) {
                    let value = typeof(event.value_new) === 'object' ? event.value_new.id : event.value_new;
                    if(column.render === 'int') {
                        value = parseInt(value);
                        if(isNaN(value)) value = null;
                    }
                    UIGameEditor.active.setChannelProperty(channelId, property, value);
                }
                this.render();

            },
            // w2ui is about to render this pane - let's refresh the data before that
            onRender: function(/* event */) {
                this.clear();
                let list = UIGameEditor.active.getRecordsChannels();
                let recid = 1;
                    for (let item of Object.values(list)) {
                        this.add({...item, ...{recid: recid++}});
                    }
            },
        });

        $().w2grid({
            name: 'paneGameXLibrary',
            reorderRows: true,
            multiSelect: true,
            show: {
                toolbar: true,
                footer: false,
                toolbarAdd: false,
                toolbarColumns: false,
                toolbarDelete: true,
                toolbarInput: false,
                toolbarReload: false,
                toolbarSearch: false,
                toolbarSave: false,
                toolbarEdit: false,

            },
            columns: [
                {
                    field: 'name', text: 'Name', sortable: true,
                    editable: {type: 'text'}
                },
                {
                    field: 'length', text: 'Length', sortable: true,
                },
                {
                    field: 'quality', text: 'Quality', sortable: true,
                },
                {
                    field: 'size', text: 'File Size', sortable: true,
                },
                {
                    field: 'date', text: 'Last Changed', sortable: true,
                },],
            toolbar: {
                items: [
                    /* {id: 'new_folder', type: 'button', text: 'Add Folder', icon: 'fas fa-folder-plus'}, */
                    {id: 'add_file', type: 'button', text: 'Add Audio File', icon: 'fas fa-file-medical'},
                    {id: 'update_file', type: 'button', text: 'Update Audio File', disabled: true, icon: 'fas fa-file-upload'},
                    {type: 'break'},
                    {id: 'move_files', type: 'menu',  text: 'Move Files', icon: 'fas fa-folder-open', disabled: true,
                        items: function() {
                            const folders = UIGameEditor.active.getMediaFolders();
                            const records = [
                                {id:'', text:'/', icon: 'fas fa-folder-open'},
                            ];
                            for(const folder of folders) {
                                records.push({id:folder, text:'/'+folder, icon: 'fas fa-folder-open'});
                            }
                            records.push({id:'___NEW___', text:'New Folder', icon: 'fas fa-folder-plus'});
                            return records;
                        },
                    },
                    {type: 'break'},
                    {id: 'play_file', type: 'button', text: 'Play Audio File', disabled: true,  icon: 'fas fa-play'},
                ],
                onClick: function(event) {
                    const target = event.target.split(':');
                    switch(target[0]) {
                        case 'add_file':
                            // TODO: implement add file
                            w2ui.grid.add({recid: w2ui.grid.records.length + 1});
                            break;
                        case 'move_files':
                            if(target.length > 1) {
                                const folder = target[1];
                                const selection = this.owner.getSelection();
                                const owner = this.owner;
                                if(folder === '___NEW___') {
                                    w2prompt({
                                        label       : 'New Folder',
                                        value       : '',
                                        title       : 'New Folder',
                                        ok_text     : 'Ok',
                                        cancel_text : 'Cancel',
                                        width       : 400,
                                        height      : 200
                                    })
                                    .change(function (event) {
                                        console.log('change', event);
                                    })
                                    .ok(function (folder) {
                                        folder = w2utils.stripTags(folder).trim();
                                        if(!folder) return;
                                        for(const i of selection) {
                                            const item = owner.get(i);
                                            if(!item.directory) UIGameEditor.active.setMediaFolder(item.id, folder);
                                        }
                                        owner.toolbar.disable('move_files');
                                        owner.toolbar.disable('update_file');
                                        owner.toolbar.disable('play_file');
                                        owner.render();
                                    });
                                }
                                else {
                                    for(const i of selection) {
                                        const item = this.owner.get(i);
                                        if(!item.directory) UIGameEditor.active.setMediaFolder(item.id, folder);
                                    }
                                    this.owner.toolbar.disable('move_files');
                                    this.owner.toolbar.disable('update_file');
                                    this.owner.toolbar.disable('play_file');
                                    this.owner.render();
                                }
                            }
                            break;
                        case 'play_file':
                            // TODO: implement play file
                            break;
                        case 'update_file':
                            // TODO: implement update file
                            break;
                    }
                },
            },
            onChange: function(event) {
                const row = this.get(event.recid);
                if(!row) return;
                let value = w2utils.stripTags(event.value_new.trim());
                if(value === '') {
                    w2popup.open({
                        title: 'Error',
                        body: '<div class="w2ui-centered">Media file must have a name!</div>',
                        buttons   : '<button class="w2ui-btn" onclick="w2popup.close();">OK</button> ',
                    });
                } else UIGameEditor.active.setMediaName(row.id, value);
                this.render();
            },
            onDelete: function(event) {
                // confirmation set force=true
                if(event.force)
                {
                    const selection = this.getSelection();
                    for(const i of selection) {
                        const item = this.get(i);
                        if(!item.directory) UIGameEditor.active.removeMedia(item.id);
                    }
                    event.preventDefault();
                    this.render();
                    console.log('delete selectioN: ', this.deletionSelection, this.getSelection());
                }
            },
            // select rows
            onSelect: function(event) {
                if(!event.recids) event.recids = [Number(event.recid),];
                let selection = [];
                for(let item of Object.values(event.recids)) {
                    selection.push(this.get(item));
                }
                this.toolbar.disable('play_file');
                this.toolbar.disable('update_file');
                if(selection.length == 1) {
                    let item = this.get(event.recid);
                    if(!item.directory) {
                        this.toolbar.enable('play_file');
                        this.toolbar.enable('update_file');
                    }
                }
                if(selection.length) {
                    this.toolbar.enable('move_files');
                }
                else {
                    this.toolbar.disable('move_files');
                }
                // console.log(selection);
            },
            // w2ui is about to render this pane - let's refresh the data before that
            onRender: function(/* event */) {
                this.clear();
                let list = UIGameEditor.active.getRecordsMedia();
                let recid = 1;
                    for (let item of Object.values(list)) {
                        this.add({...item, ...{recid: recid++}});
                    }
            },
            // select rows
            onUnselect: function(event) {
                this.toolbar.disable('move_files');
                this.toolbar.disable('play_file');
                this.toolbar.disable('update_file');
            },
        });

        w2ui['paneGameX'].html('preview', w2ui['paneGameXInfo']);
        w2ui['layout'].html('top', w2ui['paneTop']);
        w2ui['layout'].html('main', w2ui['paneGames']);

    }


}

export default UI