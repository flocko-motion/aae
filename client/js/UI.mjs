import UIGameEditor from "./UIGameEditor.mjs";
import Game from "./Game.mjs";

class UI {

    constructor() {

        const
            pstyle = ''; //'background-color: #F5F6F7; border: 1px solid #dfdfdf; padding: 0px;';
        let
            templates = {};

        $(
            '#layout'
        ).w2layout({
            name: 'layout',
            panels: [
                {type: 'top', size: 40, resizable: false, style: pstyle},
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
                        onClick: function (event) {
                            if (event.tab.content && w2ui[event.tab.content])
                                this.owner.html('main', w2ui[event.tab.content]);
                            else console.error('content not found: ' + event.tab.content);
                        },
                    },
                },
            ]
        });

        $()
            .w2layout({
                name: 'paneTop',
                panels: [
                    {
                        type: 'main', style: 'padding-top: 9px; padding-left: 9px; font-size: 18px;',
                        content: '<img src="gfx/favicon.png" style="width:18px;height:18px;" />Audio Augmented Encounter Studio'
                    },
                    {
                        type: 'right', style: 'text-align:right;padding-top:9px;padding-right:9px;',
                        content: '<button id="btn-login" disabled="true" onclick="login()"><i class="fas fa-sign-in-alt"></i> Log in</button>' +
                            '<button id="btn-logout" disabled="true" hidden="true" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Log out</button>'
                    }
                ]
            });


        $()

            .w2grid({
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
                    onClick: function

                        (
                            target
                            ,
                            data
                        ) {
                        console.log('item ' + target + ' is clicked. data: ' + data);
                        console.log(target);

                    },
                },
                // Edit selected game
                onEdit: function (event) {
                    let game = this.get(this.getSelection()[0]);
                    UIGameEditor.editGame(game.id);
                },
                // w2ui is about to render this pane - let's refresh the data before that
                onRender: function (event) {
                    this.clear();
                    let list = Game.gamesList;
                    let recid = 1;
                    for (let i in list) {
                        let item = list[i];
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
                onClick: function (target, data) {
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
                    style: "background-color:grey;",
                    name: 'paneGameChart',
                    content: 'blah',
                    onShow: function () {
                        console.log('show');
                    }
                },
                {
                    type: 'preview', size: "300px", resizable: true, tabs:
                        {
                            active: 'tab1',
                            tabs: [
                                {id: 'tab1', text: 'Game Setup', content: 'paneGameXInfo'},
                                {id: 'tab3', text: 'Channels Setup', content: 'paneGameXChannels'},
                                {id: 'tab4', text: 'Audio Files', content: 'paneGameXLibrary'},
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
            // w2ui is about to render this pane - let's refresh the data before that
            onRender: function (event) {
                this.clear();
                let list = UIGameEditor.active.getFields();
                let recid = 1;
                    for (let i in list) {
                        let item = list[i];
                        this.add({...item, ...{recid: recid++}});
                    }
            },
            records: [
                {recid: 1, name: "Name", value: "My Test Game"},
                {recid: 10, name: "Description", value: ""},
                {recid: 11, name: "Project Homepage", value: ""},
            ]
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
            columnGroups: [
                {text: 'Channel', span: 2},
                {text: 'Players Assignment', span: 1},
                {text: 'Players Minimum', span: 2},
                {text: 'Players Maximum', span: 2},
            ],
            columns: [
                {field: 'recid', text: 'ID', size: '50px',},
                {
                    field: 'name', text: 'Name',
                    editable: {type: 'text'}
                },
                {
                    field: 'mode', text: 'Mode',
                    editable: {
                        type: 'list',
                        items: {"4": "Automatic", "5": "Fill Up First", "6": "Fill Up Last"},
                        showAll: true
                    },
                },
                {
                    field: 'minActive', text: 'Active', size: '60px', style: 'text-align: center',
                    editable: {type: 'checkbox', style: 'text-align: center'}
                },
                {
                    field: 'minInt', text: 'Minimum', render: 'int',
                    editable: {type: 'int', min: 0}
                },
                {
                    field: 'maxActive', text: 'Active', size: '60px', style: 'text-align: center',
                    editable: {type: 'checkbox', style: 'text-align: center'}
                },
                {
                    field: 'maxInt', text: 'Maximum', render: 'int',
                    editable: {type: 'int', min: 0}
                },
                {
                    field: '', text: '', size: '1px', style: "display:none"
                },
            ],
            toolbar: {
                items: [
                    {id: 'plus', type: 'button', text: 'More Channels', icon: 'fas fa-plus'},
                    {id: 'minus', type: 'button', text: 'Less Channel', icon: 'fas fa-minus'},
                ],
                onClick: function (event) {
                    if (event.target == 'add') {
                        w2ui.grid.add({recid: w2ui.grid.records.length + 1});
                    }
                }
            },
            records: [
                {
                    recid: 1,
                    active: true,
                    name: "Channel 1",
                    mode: "Automatic",
                    minActive: false,
                    minInt: 0,
                    maxActive: false,
                    maxInt: 0
                },
                {
                    recid: 2,
                    active: true,
                    name: "Channel 2",
                    mode: "Automatic",
                    minActive: false,
                    minInt: 0,
                    maxActive: false,
                    maxInt: 0
                },
                {
                    recid: 3,
                    active: true,
                    name: "Channel 3",
                    mode: "Automatic",
                    minActive: false,
                    minInt: 0,
                    maxActive: false,
                    maxInt: 0
                },
                {
                    recid: 4,
                    active: true,
                    name: "Channel 4",
                    mode: "Automatic",
                    minActive: false,
                    minInt: 0,
                    maxActive: false,
                    maxInt: 0
                },
                {
                    recid: 5,
                    active: true,
                    name: "Channel 5",
                    mode: "Automatic",
                    minActive: false,
                    minInt: 0,
                    maxActive: false,
                    maxInt: 0
                },
                {
                    recid: 6,
                    active: true,
                    name: "Channel 6",
                    mode: "Automatic",
                    minActive: false,
                    minInt: 0,
                    maxActive: false,
                    maxInt: 0
                },
            ]
        });

        $().w2grid({
            name: 'paneGameXLibrary',
            show: {
                toolbar: true,
                footer: false,
                toolbarAdd: false,
                toolbarColumns: false,
                toolbarDelete: true,
                toolbarInput: false,
                toolbarReload: true,
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
                    field: 'url', text: 'URL', sortable: true,
                    editable: {type: 'text'}
                },
                {
                    field: 'length', text: 'Length', sortable: true,
                    editable: {type: 'text'}
                },
                {
                    field: 'bitrate', text: 'Bitrate', sortable: true,
                    editable: {type: 'text'}
                },
                {
                    field: 'size', text: 'File Size', sortable: true,
                    editable: {type: 'text'}
                },
                {
                    field: 'date', text: 'Last Changed', sortable: true,
                    editable: {type: 'text'}
                },],
            toolbar: {
                items: [
                    {id: 'plus', type: 'button', caption: 'Add Audio URL', icon: 'fas fa-file-audio'},
                ],
                onClick: function (event) {
                    if (event.target == 'add') {
                        w2ui.grid.add({recid: w2ui.grid.records.length + 1});
                    }
                }
            },
            records: [
                {
                    recid: 1,
                    name: "intro_1",
                    url: "https://blah.blah.blub",
                    length: "15:22",
                    bitrate: "44 kHz",
                    size: "25 MBytes",
                    date: "2020-04-17 17:10:44"
                },
                {
                    recid: 2,
                    name: "intro_2",
                    url: "https://blah.blah.blub",
                    length: "15:22",
                    bitrate: "44 kHz",
                    size: "25 MBytes",
                    date: "2020-04-17 17:10:44"
                },
                {
                    recid: 3,
                    name: "intro_3",
                    url: "https://blah.blah.blub",
                    length: "15:22",
                    bitrate: "44 kHz",
                    size: "25 MBytes",
                    date: "2020-04-17 17:10:44"
                },
                {
                    recid: 4,
                    name: "intro_4",
                    url: "https://blah.blah.blub",
                    length: "15:22",
                    bitrate: "44 kHz",
                    size: "25 MBytes",
                    date: "2020-04-17 17:10:44"
                },
                {
                    recid: 5,
                    name: "test_1",
                    url: "https://blah.blah.blub",
                    length: "17:55",
                    bitrate: "44 kHz",
                    size: "41 MBytes",
                    date: "2020-04-17 17:10:44"
                },
                {
                    recid: 6,
                    name: "test_2",
                    url: "https://blah.blah.blub",
                    length: "17:55",
                    bitrate: "44 kHz",
                    size: "41 MBytes",
                    date: "2020-04-17 17:10:44"
                },
                {
                    recid: 7,
                    name: "test_3",
                    url: "https://blah.blah.blub",
                    length: "17:55",
                    bitrate: "44 kHz",
                    size: "41 MBytes",
                    date: "2020-04-17 17:10:44"
                },
                {
                    recid: 8,
                    name: "test_4",
                    url: "https://blah.blah.blub",
                    length: "17:5",
                    bitrate: "44 kHz",
                    size: "41 MBytes",
                    date: "2020-04-17 17:10:44"
                },
            ]
        });

        w2ui['paneGameX'].html('preview', w2ui['paneGameXInfo']);

        w2ui['layout'].html('top', w2ui['paneTop']);
        w2ui['layout'].html('main', w2ui['paneGames']);

    }


}

export default UI