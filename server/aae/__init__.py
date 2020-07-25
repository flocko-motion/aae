# TODO:
#  - if player opens seconds client, first client has to be deactivated
#  - if player reconnects after server-error or connection-error he should reestablish his reg_user

import socketio
import eventlet
import time
from aae.Session import Session
from aae.User import User
from aae.Message import Message
from aae.Manager import Manager
from aae.Commands import Commands
from aae.Log import log
from aae.Db import db

version = '0.1.20200308'
session = Session()

sio = socketio.Server(cors_allowed_origins=["http://localhost", "https://bam.omnitopos.net"])
app = socketio.WSGIApp(sio)

db.query('SELECT * FROM `games`')


@sio.on('connect')
def connect(*args):  # unused: environ
    cid = args[0]
    if cid not in Manager.connections:
        Manager.connections.append(cid)
        log('JOIN', '%s, now %d connections ' % (cid, len(Manager.connections)))
    else:
        log('ERR', '%s already in connections' % str(cid))


@sio.on('disconnect')
def disconnect(*args):
    cid = args[0]
    Manager.connections.remove(cid)
    u = User.by_cid(cid)
    if u in Manager.subscribers:
        Manager.subscribers.remove(u)
    if u:
        u.online = False
        u.offline_since = time.time()
    log('USR-', '%s, now %d connections ' % (cid, len(Manager.connections)))
    Manager.report_to_all()


@sio.on('msg')
def message(*args):
    cid = args[0]
    m = Message.from_json(args[1], cid=cid)
    log('RECV', '%s' % m)
    # parse message
    if m.recipient == 'srv':
        cmd = '%s_%s' % (m.method, m.subject)
        try:
            method = getattr(Commands, cmd)
            if not m.sender:
                print("bad message! no user!")
                return
            u = User.by_uid(m.sender)
            if u and u.cid != cid:
                # TODO
                print("-------------- !!!!!!!! user has new cid TODO: kill old clients !!!!!!!! --------------")
                u.cid = cid
            method(m, u)
            if not m.replied:
                m.reply()
        except AttributeError:
            log("ERR", "unknown command: %s" % cmd)
    # forward to destination
    else:
        m.send()
    # cron tasks
    Manager.cron()


def server_start():
    eventlet.wsgi.server(eventlet.listen(('', 8080)), app)
