
import eventlet

eventlet.monkey_patch()

from flask import Flask,request
from flask_socketio import SocketIO,send,emit
from medieval_converter import convert_func
import random

app=Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'

socketio=SocketIO(app,cors_allowed_origins="*")


rooms={}
connected_users={}
user_status={}
user_roles={}
first_time=True
usertoroom={}

def create_room(roomid):
    rooms[roomid]={}
    rooms[roomid]["connected_users"]={}
    rooms[roomid]["user_status"]={}
    rooms[roomid]["user_roles"]={}
    rooms[roomid]["role_assigned"]=False
 
create_room(1)
create_room(2)   

def broadcast_all_users(roomid):
    user_list = [{"name": username, "ready": rooms[roomid]["user_status"][sid]} 
                 for sid, username in rooms[roomid]["connected_users"].items()]
    print(user_list)
    socketio.emit('user_list', user_list)

@app.route('/')
def index():
    return "Flask SocketIO server running"




@socketio.on('user_ready')
def user_ready():
    roomid=usertoroom[request.sid]
    rooms[roomid]["user_status"][request.sid]=True
    broadcast_all_users(roomid)
    if all(rooms[roomid]["user_status"].values()):
        print("All users are ready")
        catcher=random.choice(list(rooms[roomid]["connected_users"].keys()))
        if not rooms[roomid]["role_assigned"]:
            for user in rooms[roomid]["connected_users"]:
                if user not in rooms[roomid]["user_roles"]:
                    if user==catcher:
                        rooms[roomid]["user_roles"][user]="Catcher"
                    else:
                        rooms[roomid]["user_roles"][user]="Normal"
            rooms[roomid]["role_assigned"]=True
        emit('all_users_ready',broadcast=True)
    
        
    
@socketio.on('assign_roles')
def assign_roles():
    print(rooms)
    roomid=usertoroom[request.sid]
    socketio.emit("role_recieve",rooms[roomid]["user_roles"][request.sid],to=request.sid)

@socketio.on('testing')
def testing(string):
    roomid=usertoroom[request.sid]
    print(rooms[roomid]["connected_users"][request.sid])

@socketio.on('connect')
def handle_connect():
    print("client connected")
    
@socketio.on('connect_msg')
def connect_msg(username,roomid):
    print(roomid)
    print(rooms)
    print(request.sid)
    roomid=int(roomid)
    if int(roomid) in rooms:
        # rooms[roomid]={}
        # connected_users[request.sid]=username
        rooms[roomid]["connected_users"][request.sid]=username
        # user_status[request.sid]=False
        rooms[roomid]["user_status"][request.sid]=False
        print(rooms)
        string=username+" has arrived"
        send(string,broadcast=True,include_self=False)
        broadcast_all_users(roomid)
        usertoroom[request.sid]=roomid
        socketio.emit("valid_room_id",True,to=request.sid)
    else:
        socketio.emit("valid_room_id",False)
    
@socketio.on('disconnect')
def handle_disconnect():
    user_room_id=usertoroom[request.sid]
    username = rooms[user_room_id]["connected_users"].get(request.sid, "Unknown")
    print('Cleint disconnected')
    rooms[user_room_id]["connected_users"].pop(request.sid,None)
    rooms[user_room_id]["user_status"].pop(request.sid,None)
    rooms[user_room_id]["user_roles"].pop(request.sid,None)
    rooms[user_room_id]["role_assigned"]=False
    broadcast_all_users(user_room_id)
    send(f"{username} has left",broadcast=True)
    print(rooms)
    
@socketio.on('send_message')
def handle_message(msg,username):
    print('Message recieved',msg)
    msg=convert_func(msg)
    string=username+" : "+msg
    send(string,broadcast=True,include_self=False)

if __name__=='__main__':
    print("hwelloo")
    socketio.run(app,host='0.0.0.0',port=3000,debug=True)