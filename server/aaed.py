#!/usr/bin/python3.8

import setproctitle
import os
import aae

pid_file = '/run/aaed/aaed.pid'

# configure singleton process
try:
    os.system('killall aaed 2> /dev/null')
    setproctitle.setproctitle('aaed')
    pid = os.getpid()
    f = open(pid_file, "w")
    f.write(str(pid))
    f.close()
except FileNotFoundError:
    raise Exception("Cannot open pid file %s" % pid_file)

aae.server_start()






