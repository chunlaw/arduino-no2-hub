import SocketServer
import socket
import struct
import numpy as np
from multiprocessing import Queue
from threading import Thread
from time import sleep
from db import DbInstance
from bot import No2Bot
import ConfigParser, signal, sys, os, time
import paho.mqtt.client as mqtt

HOST, PORT = "", 5000

q = Queue(maxsize=0)

def on_connect(mq, userdata, rc, _):
    mq.subscribe(mq.handler.config.get("MQTT", "topic") + '/#')

def on_message(mq, userdata, msg):
    device_id = msg.topic.split('/')[1]
    no2 = msg.payload
    mq.handler.onUpdate ( device_id, float(no2), time.time() )

class No2Server:
    
    no2_con = {}

    def __init__(self, config_file):
        global mqtt_client, mqtt_looping
        mqtt_client_id = "server"
        mqtt_client = mqtt.Client(client_id=mqtt_client_id)
        mqtt_client.handler = self
        self.config = ConfigParser.ConfigParser()
        self.config.read("mqtt.ini")
        user = self.config.get("MQTT", "user")
        password = self.config.get("MQTT", "pass")
        mqtt_client.username_pw_set ( user, password )
        mqtt_client.on_connect = on_connect
        mqtt_client.on_message = on_message
        tbot = No2Bot("no2.db")
        tbot.run()

        try:
            mqtt_client.connect(self.config.get("MQTT", "hostname"))
        except:
            print "MQTT Broker is offline"
        mqtt_looping = True

    def onUpdate( self, device_id, no2, timestamp ):
        if self.no2_con.has_key(device_id):
            timediff = timestamp - self.no2_con[device_id][0][1]
            if timediff >= 600:
                print "%s is now connected" % device_id
                self.tbot.sendConnectionMessage(id, 0)
                self.no2_con[device_id] = []
            elif timediff >= 60:
                self.saveNo2 ( device_id, self.no2_con[device_id] )
                self.no2_con[device_id] = []
        else:
            self.no2_con[device_id] = []
            print "%s is now connected" % device_id
        self.no2_con[device_id].append([no2, timestamp])

    def saveNo2(self, id, no2_arr):
        no2_con = [no2[0] for no2 in no2_arr]
        no2_data = {}
        no2_data["id"] = id
        no2_data["t"] = int(time.time())
        no2_data["max"] = max(no2_con)
        no2_data["min"] = min(no2_con)
        no2_data["std"] = np.std(no2_con)
        no2_data["mean"] = np.mean(no2_con)
        q.put(no2_data)


    def server_run(self):
        global mqtt_looping
        cnt = 0
        print "Looping..."
        while mqtt_looping:
            mqtt_client.loop()
            cnt+=1
            if cnt > 20:
                try:
                    print 'reconnect'
                    mqtt_client.reconnect() # to avoid 'Broken pipe' error
                except:
                    time.sleep(1)
                cnt = 0
        print "Quit MQTT thread"
        mqtt_client.disconnect()

def dbThreadFunction():
    db = DbInstance("no2.db")
    while True:
        while not q.empty():
            db.insert( q.get() )
        db.commit()
        sleep(30)

def stop_all(*args):
    global mqtt_looping
    mqtt_looping = False

if __name__ == "__main__":
    signal.signal(signal.SIGTERM, stop_all)
    signal.signal(signal.SIGQUIT, stop_all)
    signal.signal(signal.SIGINT,  stop_all)

    dbThread = Thread(target = dbThreadFunction )
    dbThread.daemon = True
    dbThread.start()
    server = No2Server("mqtt.ini")
    server.server_run()
