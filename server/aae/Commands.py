from aae.User import User
from aae.Message import Message
from aae.Manager import Manager
from aae.Log import log
from aae.Db import db
import time
import json

global version
global session


class Commands:

    @staticmethod
    def debug_status(*args):
        """ ask server to send his status report """
        args[0].reply('Uptime: %s, Users: %d, Connections: %d' % (0, len(User.list), len(Manager.connections)))

    @staticmethod
    def debug_observe(*args):
        """ observe another player: subscribe to all his reports """
        uid = args[0].params
        observed = User.by_uid(uid)
        if not observed:
            print("user %s not found - can't observe " % uid)
            return
        # make this user observe given user
        user = args[1]
        user.observing = uid
        # notify observed user to start reporting
        Message('srv', observed.cid, recipient=observed.uid, method='debug', subject='report').send()

    @staticmethod
    def get_game(*args):
        """ return game data of single game """
        # todo: check auth
        rows = db.query('SELECT `data` FROM `games` WHERE `id`=%(id)s', {'id': args[0].params})
        if len(rows):
            args[0].reply(json.loads(rows[0]['data']))
        else:
            args[0].reply(None)

    @staticmethod
    def get_games(*args):
        """ return list of games accessible by this user - for editing purpuses """
        rows = db.query('SELECT `id`,`name`,`description`,`channels`,`playersMin`,`playersMax` FROM `games`')
        games = dict()
        for row in rows:
            games[row['id']] = row
        args[0].reply({'games': games})

    @staticmethod
    def get_ping(*args):
        if not args[1]:
            log("ERR", "user pings, but isn't connected")
            return
        else:
            args[1].online = True

    @staticmethod
    def get_users(*args):
        bag = User.get_dict()
        # TODO: why json.dumps ?
        args[0].reply(json.dumps(bag))

    @staticmethod
    def get_time(*args):
        args[0].reply({'client': args[0].params, 'server': time.time()})

    @staticmethod
    def get_version(*args):
        args[0].reply(version)

    @staticmethod
    def push_report(*args):
        """ player send his status report for server to distribute it to subscribers """
        print("status report received!")
        user = args[1]
        observers = user.observers()
        # nobody listening any more? notify user to stop reporting
        if not observers:
            print("nobody listening to reports anymore ... send stop to client")
            args[0].reply('stop')
            return
        for o in observers:
            Message(user.uid, o.cid, recipient=o.uid, method='push', subject='report', params=args[0].params).send()

    @staticmethod
    def reg_subscription(*args):
        assert(args[1])
        if args[1] not in Manager.subscribers:
            Manager.subscribers.append(args[1])
        Manager.report_to_subscribers()

    @staticmethod
    def reg_user(*args):
        # he has a uid, but we don't know him.. server probably restartet since his last visit
        # -> let's register him
        u = args[1]
        if not u:
            log('USR+', 'New user %s' % args[0].sender)
            u = User(args[0].cid, args[0].sender)
        u.online = True
        u.offline_since = None
        # m = Message('srv', u.cid, recipient=args[0].sender, method='set', subject='game', params=session.timeStart)
        # m.send()
        # m = Message('srv', u.cid, recipient=args[0].sender, method='set', subject='hero', params=session.hero)
        # m.send()
        args[0].reply({'unum': u.unum})
        Manager.report_to_all()

    @staticmethod
    def set_hero(*args):
        log('HERO', 'game master sets hero id')
        session.hero = int(args[0].params)
        reply = Message('srv', Message.BROADCAST, 'set', 'hero', session.hero)
        reply.send()

    @staticmethod
    def set_start(*args):
        log('HERO', 'game master sets start time')
        session.timeStart = int(args[0].params)
        reply = Message('srv', Message.BROADCAST, 'set', 'game', session.timeStart)
        reply.send()
