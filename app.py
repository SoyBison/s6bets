from flask import Flask
from flask_socketio import SocketIO
import os


app = Flask(__name__)
app.config['DATABASE_URL'] = os.environ['DATABASE_URL']
socketio = SocketIO(app)

@app.route('/')
def index():
    return "Lmao you shouldn't be here."


if __name__ == '__main__':
    socketio.run(app)