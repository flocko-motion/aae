import time


class User:

    list = []

    count = 0
    unums = 0  # numerical identifiers for user

    # time connection to this user was last
    offline_since = None

    def __init__(self, cid=None, uid=None, name='', online=True):
        # connection id
        self.cid = cid
        # user id
        if not uid:
            uid = User.unique_id()
        self.uid = uid
        self.name = name
        self.online = True
        # observing other user?
        self.observing = None
        # internal server count
        User.unums += 1
        self.unum = User.unums
        User.list.append(self)

    def observers(self):
        """ get list of observers of this user """
        bag = list()
        for u in User.list:
            if u.observing == self.uid:
                bag.append(u)
        return bag

    def __repr__(self):
        """ string representation """
        return 'User(' + str(self.cid) + ', ' + str(self.uid) + ', "' + str(self.name) + '", ' + str(
            self.online) + ')'

    def json(self):
        """ json representation """
        last_seen = 0
        if self.offline_since:
            last_seen = round(time.time() - self.offline_since)
        return {'cid': self.cid,
                'uid': self.uid,
                'name': self.name,
                'online': self.online,
                'unum': self.unum,
                'last_seen': last_seen, }

    @staticmethod
    def get_dict():
        d = dict()
        for u in User.list:
            d[u.uid] = (u.json())
        return d

    @staticmethod
    def by_cid(cid):
        for u in User.list:
            if u.cid == cid:
                return u
        else:
            return None

    @staticmethod
    def by_uid(uid):
        if not uid:
            raise ValueError
        for u in User.list:
            if u.uid == uid:
                return u
                break
        else:
            return None

    @staticmethod
    def unique_id():
        User.count += 1
        return 'usr-' + str(time.time()) + '-' + str(User.count)