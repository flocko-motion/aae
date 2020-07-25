from typing import Dict
import time
import aae


class Message:
    """An aae message"""
    count = 1
    res: dict = None
    replied: bool = False

    BROADCAST: str = 'BROADCAST'

    #  methods = ['get', 'set', 'join', 'debug', 'connect']
    #  subjects = ['time', 'game', 'games', 'user', 'player', 'players']

    @staticmethod
    def from_json(json, cid):
        try:
            m = Message(json['sender'], cid, recipient=json['recipient'], client_id=json['clientId'],
                        method=json['method'], subject=json['subject'], params=json['params'], res=json['res'],
                        mid=json['mid'], stamps=json['stamps'])
            return m
        except KeyError:
            print('ERR> Message.from_json() KeyError: %s' % str(json))
            return None

    def __init__(self, sender, cid, recipient=None, client_id=None,
                 method=None, subject=None, params=None, res=None,
                 mid=None, stamps=None):
        self.sender, self.recipient = sender, recipient
        if client_id is None:
            client_id = 'srv'
        self.client_id = client_id
        self.method, self.subject, self.params, self.res = method, subject, params, res
        self.cid = cid
        if mid is None:
            mid = 'srv-' + str(Message.count)
            Message.count += 1
        self.mid = mid
        if stamps is None:
            stamps = []
        self.stamps = stamps
        # this message passed through this machine:
        self.stamp()

    def __repr__(self):
        return 'Message(' + str(self.json()) + ')'

    def stamp(self):
        """Add a timestamp to the messages delivery history

        Messages get stamped by each node they pass through"""
        self.stamps.append(time.time())

    def json(self):
        json: Dict = {
            'mid': self.mid,
            'clientId': self.client_id,
            'sender': self.sender,
            'recipient': self.recipient,
            'method': self.method,
            'subject': self.subject,
            'params': self.params,
            'res': self.res,
            'stamps': self.stamps}
        return json

    def reply(self, res=None):
        if not res:
            res = {}
        self.res = res
        self.send()
        self.replied = True

    def send(self):
        json = self.json()
        if self.res is None:
            mode = 'SEND'
            print('%s %s' % (mode, self))
        else:
            mode = 'RPLY'
            print('%s %s' % (mode, self.res))
        # pass message to socket.io
        if self.cid == Message.BROADCAST:
            aae.sio.emit('msg', json)
        elif self.cid:
            aae.sio.emit('msg', json, room=self.cid)
        else:
            print("no CID")
            raise Exception
        # aae.sio.send()
