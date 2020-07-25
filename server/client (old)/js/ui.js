// user clicks  "accept and enter" on splash screen
function enter() {
    // click header -> home
    $('#debugButton').on('click',function(){
        Ui.page('system');
    }).show();

    Ui.page('loading');
    $('.splashHidden').toggleClass('splashHidden',false);
    Snd.enable();
}

/*--------------------------------------------
Module "Ui" - The user interface
--------------------------------------------*/

class Ui {
    static init() {

        Ui.pageCurrent = null;

        $('.initHidden').toggleClass('initHidden',false);

        // init vue
        Ui.app = new Vue({
            el: '#app',
            data: Ui.data
        });

        // refresh time display
        setInterval(function() {
            var m = moment.unix(Time.server())
            try {
                Ui.data.timeServer = m.format('HH:mm:ss.S');
                var t = Time.game();
                Ui.data.timeGame = (t > 0 ? '' : '-')  + moment().startOf('day').seconds(Math.abs(t)).format('HH:mm:ss');
                // socket.io
                Ui.data.socketConnected = Com.socket.connected;
                if(Com.lastReceived)
                    Ui.data.messagesLastReceived = (Time.stamp() - Com.lastReceived).toFixed(1) + 's';
                else
                    Ui.data.messagesLastReceived = 'n/a';
            }
            catch(e)
            {
                Log.log('exception',0,e);
            }
        },100);

        // populate home screen with links to all pages
        /*
        $('div.page').each(function(o) {
            $('div.page[x-page="home"]').append('<button class="float" x-link-page="' + $(this).attr('x-page') + '">'+$(this).attr('x-page')+'</button>').attr('x-link-page',$(this));
        });
        */
        $('button[x-link-page]').on('click',function(){
           Ui.page($(this).attr('x-link-page'));
        });
        /*
        $('#buttonSlowPhone').on('click',function(){
            if(config.sound.syncMode == 'soft')
            {
                Snd.setSyncMode('hard');

            } else Snd.setSyncMode('soft');

            $('#buttonSlowPhone').toggleClass('active',config.sound.syncMode == 'hard');
        });
        */
        $('#shellEnter').on('click',function() {
            Control.parseCommand($('#shellInput').val());
        });

        $('#debugUsersTitle').on('click',function() {
            Control.parseCommand('users');
        });


        // start on home page
        Ui.page('splash');


    }



    static page(name) {
        if(!name) return Ui.pageCurrent;
        Ui.pageCurrent = name;
        $('div[x-page="'+name+'"].page').show();
        $('div[x-page!="'+name+'"].page').hide();
    }

    static numberFormat(n,d) {
        if(n === undefined) return '';
        return n;
    }

}

// item component for tree view
Vue.component('item', {
  template: '#item-template',
  props: {
    model: Object
  },
  data: function () {
    return {
      open: false
    }
  },
  computed: {
    isFolder: function () {
      return this.model.children &&
        this.model.children.length
    }
  },
  methods: {
    toggle: function () {
      if (this.isFolder) {
        this.open = !this.open
      }
    },
    changeType: function () {
      if (!this.isFolder) {
        Vue.set(this.model, 'children', [])
        this.addChild()
        this.open = true
      }
    },
    addChild: function () {
      this.model.children.push({
        name: 'new stuff'
      })
    }
  }
})


/*--------------------------------------------
Module "Ui.data" - The data interface

main.js can write into this object to
make properties displayable by vue.js

--------------------------------------------*/

//  which data should I send when debug requests arrive?
Ui.data = {
    title: 'Bamory',
    pid:null,
    userName:'Audio',
    userRole:'Game',

    socketConnected: false,

    messages:[],
    messagesPipeline: [],
    messagesLastReceived: null,

    server: {},

    loadingProgress:0,

    log:[],
    logServer:[],

    controlOut:null,

    timeServer:null,
    timeGame:null,
    timeDiff: 0,
    timePrecision: 0,
    timeRoundTripStandardDeviation: 0,
    timeRandomDelta: 0,
    timePings:[],
    timePingsCount: 0,
    timeSyncSteps: 0,

    sndDiff:0,
    sndDiffs:[],
    sndBuffer:null,
    sndRate:1,
    sndRateChangeDelay:null,
    sndLen:null,
    sndSyncMode:'soft',
    sndSyncCountDown:null,
    sndSyncCountDownA: null,
    sndStatus:null,
    sndUrl:null,

    // only for master view
    masterUidSelected:null,
    masterUserReport:null,
    masterServerConsoleFilter:"",




};

// condensed copy of Ui.data as a debug report for a puppetmaster
Ui.dataReport = function() {
    const prefixes = ['user','socket','loading','time','snd',];
    let report = {};
    for(let i in Ui.data) {
        for(let j in prefixes) {
            let prefix = prefixes[j];
            if(i.substr(0, prefix.length) == prefix) {
                report[i] = Ui.data[i];
                break;
            }
        }
    }
    report.messagesPipelineLength = Ui.data.messagesPipeline.length;
    return  report;
};


