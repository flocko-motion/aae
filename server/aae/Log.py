from aae.Manager import Manager
from aae.Message import Message


def log(*args):
    subject = 'LOG'
    if len(args) == 1:
        m = args[0]
    else:
        subject = args[0]
        m = args[1]

    print('%s: %s' % (subject, m))
    for s in Manager.subscribers:
        (Message('srv', s.cid, recipient=s.uid, method='push', subject='log',
                 params={'subject': subject, 'message': m})).send()
