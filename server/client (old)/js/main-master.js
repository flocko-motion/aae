$( document ).ready(function() {
    console.log( "ready!" );
    Bam.init('master');
    Ui.data.title = "Bamory Puppetmaster";
    Ui.page('home');
    MasterUi.init();
});

class MasterUi {

    static init() {
        // make accordion panels toggle-able
        $('.accordionTitle').on('click', function(o) {
            console.log('click');
            $( this ).next().toggle();
        });
    }

    static selectUser(o) {
        let uid = Ui.data.masterUidSelected = o.dataset.uid;
        (new Message(user.uid, 'srv', 'debug', 'observe', uid, Message.SEND_INSTANTLY)).send();
        Ui.data.masterUserReport = null;
    }
}
