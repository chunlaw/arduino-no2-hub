import sqlite3
import uuid

class DbInstance(object):
    conn = None
    c = None
    def __init__(self, db_name):
        self.conn = sqlite3.connect(db_name)
        self.c = self.conn.cursor()
        self.c.execute('SELECT name FROM sqlite_master WHERE type=\'table\' AND name=\'no2_data\';')
        if self.c.fetchone() is None:
            self.c.execute('''CREATE TABLE no2_data ( id integer, timestamp integer, max real, min real, mean real, std real )''')
        self.c.execute('SELECT name FROM sqlite_master WHERE type=\'table\' AND name=\'sensor_location\';')
        if self.c.fetchone() is None:
            self.c.execute('''CREATE TABLE sensor_location (id integer, uuid text primary key, chat_id text, lat real, long real)''')
        self.autofill_uuid()
        self.commit()

    def __del__(self):
        self.conn.close()

    def autofill_uuid(self):
        self.c.execute('SELECT * FROM sensor_location')
        sensors = self.c.fetchall()
        for sensor in sensors:
            if sensor[1] is None:
                self.c.execute('UPDATE sensor_location set uuid = ? where id = ?', (str(uuid.uuid4()),sensor[0]) )

    def insert( self, data ):
        self.c.execute("INSERT INTO no2_data VALUES (?,?,?,?,?,?)", ( data["id"], data["t"], data["max"], data["min"], data["std"], data["mean"] ))

    def commit( self ):
        print "commit"
        self.conn.commit()

    def update_device(self,chat_id, uuid, lat=None, longi=None):
        self.c.execute("INSERT or replace INTO sensor_location (id, uuid, chat_id, lat, long) VALUES ((select id from sensor_location where uuid = ?), ?, ?, coalesce(?,(select lat from sensor_location where uuid = ?)), coalesce(?,(select long from sensor_location where uuid = ?)))", (uuid, uuid, chat_id, lat, uuid, longi, uuid))
        self.commit()

    def getChatToUUIDList(self):
        self.c.execute('SELECT * FROM sensor_location')
        sensors = self.c.fetchall()
        c_u = {}
        for sensor in sensors:
            if sensor[2] is not None:
                print sensor
                c_u[sensor[2]] = sensor[1]
        return c_u

    def getChatId(self, id):
        print type(id)
        self.c.execute('SELECT chat_id, uuid FROM sensor_location where id = ?', (id,))
        return self.c.fetchone()

if __name__ == "__main__":
    db_instance = DbInstance("no2.db")
