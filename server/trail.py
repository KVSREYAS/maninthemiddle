import eventlet

eventlet.monkey_patch()

from flask import Flask
from flask_socketio import SocketIO,send

print('hello')