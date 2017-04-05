import sqlite3

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
            self.c.execute('''CREATE TABLE sensor_location (id integer, lat real, long real)''')
        self.commit()

    def __del__(self):
        self.conn.close()

    def insert( self, data ):
        print "%d %d %f %f %f %f" % ( data["id"], data["t"], data["max"], data["min"], data["std"], data["mean"] )
        self.c.execute("INSERT INTO no2_data VALUES (?,?,?,?,?,?)", ( data["id"], data["t"], data["max"], data["min"], data["std"], data["mean"] ))
    def commit( self ):
        print "commit"
        self.conn.commit()

if __name__ == "__main__":
    db_instance = DbInstance("no2.db")
