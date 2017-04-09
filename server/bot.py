import telepot
import time
from db import DbInstance

class No2Bot:
    bot = ''
    dbname = ''
    c_u = {}
    
    def __init__(self, dbname):
        with open('telegram.token', 'r') as f:
            token = f.readline().rstrip()
        self.bot = telepot.Bot(token)
        self.dbname = dbname
        db = DbInstance(dbname)
        self.c_u = db.getChatToUUIDList()
        print self.bot.getMe()

    def sendConnectionMessage(self, id, status ):
        db = DbInstance(self.dbname)
        chat_id, uuid = db.getChatId(id)
        print chat_id
        print uuid
        if status == 0:
            self.bot.sendMessage( chat_id, '%s\nConeection Closed' % uuid )
        elif status == 1:
            self.bot.sendMessage( chat_id, '%s\nConeection Open' % uuid )

    def run(self):
        self.bot.message_loop(self.handle)

    def handle_cmd(self, chat_id, cmds):
        if cmds[0] == '/start':
            self.bot.sendMessage(chat_id, 'Please enter your arduino UUID with \'/setup <UUID>\'')
        elif cmds[0] == '/setup':
            if len(cmds) != 2:
                self.bot.sendMessage(chat_id, 'Please enter your arduino UUID with \'/setup <UUID>\'')
            else:
                db = DbInstance(self.dbname)
                db.update_device(chat_id, cmds[1])
                self.c_u[str(chat_id)] = cmds[1]
                self.bot.sendMessage(chat_id, 'Device %s registered successfully! Please send me the GPS location' % cmds[1])
        else:
            print 'Command not supported'
    
    def handle_location(self, chat_id, location):
        if self.c_u.get(str(chat_id)) is None:
            self.bot.sendMessage(chat_id, 'Please send me the UUID first by "/setup <UUID>"')
        else:
            uuid = self.c_u.get(str(chat_id))
            db = DbInstance(self.dbname)
            db.update_device(chat_id, uuid, location['latitude'], location['longitude'])
            self.bot.sendMessage(chat_id, 'Device %s location updated' % uuid )

    def handle(self,msg):
        chat_id = msg['chat']['id']
        try:
            command = msg.get('text')
            location = msg.get('location')
            print 'Got command: %s' % command
            
            if command is not None:
                self.handle_cmd(chat_id, command.split())
            elif location is not None:
                self.handle_location(chat_id, location)
        except Exception as inst:
            print command
            print inst


if __name__ == '__main__':
    bot = No2Bot("no2.db")
    bot.run()
    while 1:
        time.sleep(30)
