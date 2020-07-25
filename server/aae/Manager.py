from aae.User import User
from aae.Message import Message
import time


class Manager:
    """
    Manage cron tasks, reporting, cleaning up dead users...
    """

    report_last_sent = 0

    connections = []
    subscribers = []

    @staticmethod
    def cron():
        if time.time() - Manager.report_last_sent > 5:
            Manager.report_to_all()
        # users clean up
        for u in User.list:
            if u.offline_since and time.time() - u.offline_since > 10:
                User.list.remove(u)
                if u in Manager.subscribers:
                    Manager.subscribers.remove(u)
                del u

    @staticmethod
    def report_to_subscribers():
        """
        Send detailled status update to subscribers only
        """
        pass
        # TODO: which information should be for subscribers only?
        """
        if not len(subscribers):
            return
        p = {'connections': connections, 'users': User.getList()}
        for s in subscribers:
            (Message('srv', s.cid, recipient=s.uid, method='push', subject='server',
                     params=p)).send()
                     """

    @staticmethod
    def report_to_all():
        Manager.report_last_sent = time.time()
        p = {'connections': Manager.connections, 'users': User.get_dict()}
        (Message('srv', Message.BROADCAST, recipient='BROADCAST', method='push', subject='server',
                 params=p)).send()

