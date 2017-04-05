import SocketServer
import socket
import struct
import numpy as np
from multiprocessing import Queue
from threading import Thread
from threading import Thread
from time import sleep
import time
import sys
from db import DbInstance

HOST, PORT = "", 5000

q = Queue(maxsize=0)

class No2Handler(SocketServer.BaseRequestHandler, object):
    def saveNo2(self, id, no2_con):
        no2_data = {}
        no2_data["id"] = id
        no2_data["t"] = int(time.time())
        no2_data["max"] = max(no2_con)
        no2_data["min"] = min(no2_con)
        no2_data["std"] = np.std(no2_con)
        no2_data["mean"] = np.mean(no2_con)
        q.put(no2_data)

    def handle(self):
        client = self.request
        client.settimeout(3.0)
        address = self.client_address[0]
        no2_con = []
        try:
            buffer = bytearray(4)
            client.recvfrom_into(buffer,4)
            id = buffer
            id = struct.unpack('i', id)[0]
            cnt = 0
            while True:
                nbytes, address = client.recvfrom_into(buffer, 4)
                no2 = buffer
                if nbytes == 0:
                    break
                no2 = struct.unpack('f', no2)[0]
                no2_con.append( no2 )
                if len(no2_con) == 60:
                    self.saveNo2 ( id, no2_con )
                    no2_con = []
        finally:
            client.close()
            

class No2Server(SocketServer.ThreadingTCPServer, object):
    def server_bind(self):
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.socket.bind(self.server_address)
        self.socket.settimeout(3.0)

def dbThreadFunction():
    db = DbInstance("no2.db")
    while True:
        while not q.empty():
            db.insert( q.get() )
        db.commit()
        sleep(30)

if __name__ == "__main__":
    dbThread = Thread(target = dbThreadFunction )
    dbThread.daemon = True
    dbThread.start()
    server = No2Server((HOST, PORT), No2Handler)
    server.serve_forever()
