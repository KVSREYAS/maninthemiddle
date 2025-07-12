import eventlet

eventlet.monkey_patch()

from flask import Flask,request
from flask_socketio import SocketIO,send,emit
from medieval_converter import convert_func
import random
import os
from dotenv import load_dotenv
from clue_generator import generate_clue,answer_question
load_dotenv()


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
        if len(rooms[roomid]["connected_users"])>2:
            catcher=random.choice(list(rooms[roomid]["connected_users"].keys()))
        else:
            catcher=-1
        if not rooms[roomid]["role_assigned"]:
            for user in rooms[roomid]["connected_users"]:
                if user not in rooms[roomid]["user_roles"]:
                    if user==catcher:
                        rooms[roomid]["user_roles"][user]="catcher"
                    else:
                        rooms[roomid]["user_roles"][user]="normal"
            rooms[roomid]["role_assigned"]=True
        print(rooms[roomid]["user_roles"])
        
        question=generate_clue()
        rooms[roomid]["answer"]=question['answer']
        rooms[roomid]["question"]=question["question"]
        rooms[roomid]["clues"]=question["clues"]
        
        
        
        emit('all_users_ready',broadcast=True)
    
        
    
@socketio.on('assign_roles')
def assign_roles():
    print(rooms)
    roomid=usertoroom[request.sid]
    socketio.emit("role_recieve",rooms[roomid]["user_roles"][request.sid],to=request.sid)
    socketio.emit('q_recieve',rooms[roomid]["question"])
    socketio.emit("clue_recieve",rooms[roomid]["clues"])
    
    # Send answer only to the catcher
    if rooms[roomid]["user_roles"][request.sid] == "catcher":
        socketio.emit("answer_recieve", rooms[roomid]["answer"], to=request.sid)

@socketio.on('testing')
def testing(string):
    roomid=usertoroom[request.sid]
    print(rooms[roomid]["connected_users"][request.sid])

@socketio.on('connect')
def handle_connect():
    print("client connected")
    
@socketio.on('connect_msg')
def connect_msg(username, roomid):
    try:
        roomid_int = int(roomid)
    except (ValueError, TypeError):
        socketio.emit("valid_room_id", False, to=request.sid)
        return
    if roomid_int not in rooms:
        create_room(roomid_int)
    # Add user to the room
    rooms[roomid_int]["connected_users"][request.sid] = username
    rooms[roomid_int]["user_status"][request.sid] = False
    print(rooms)
    string = username + " has arrived"
    send(string, broadcast=True, include_self=False)
    broadcast_all_users(roomid_int)
    usertoroom[request.sid] = roomid_int
    socketio.emit("valid_room_id", True, to=request.sid)
    
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
    self_string="You: " + msg
    send(string,broadcast=True,include_self=False)
    send(self_string,to=request.sid)

@socketio.on('submit_answer')
def handle_answer(answer, username):
    roomid = usertoroom[request.sid]
    print(f'Answer submitted by {username}: {answer}')
    print(f'Correct answer is: {rooms[roomid]["answer"]}')
    
    # Check if the answer is correct
    is_correct = answer.lower().strip() == rooms[roomid]["answer"].lower().strip()
    print(f'Is answer correct? {is_correct}')
    
    # Send the result to all players
    socketio.emit('answer_result', {
        'username': username,
        'is_correct': is_correct,
        'answer': answer
    })
    
    if is_correct:
        # If correct, end the game
        print("Correct answer! Emitting game_over event")
        print(f"Winner: {username}, Correct Answer: {rooms[roomid]['answer']}")
        # Emit to all clients in the room
        socketio.emit('game_over', {
            'winner': username,
            'correct_answer': rooms[roomid]["answer"]
        })
        print("Game over event emitted to room:", roomid)


@socketio.on("answer_question")
def answer_ques(question):
    roomid=usertoroom[request.sid]
    print("recieved question",question)
    ans=answer_question(rooms[roomid]["answer"],question)
    username=rooms[roomid]["connected_users"][request.sid]
    question_string=username+" : "+question
    ans="AI: "+ans
    send(question_string,broadcast=True)
    send(ans,broadcast=True)

@socketio.on("handle_fake_answer")
def handle_fake_answer(question,answer):
    roomid=usertoroom[request.sid]
    username=rooms[roomid]["connected_users"][request.sid]
    question_string=username+" : "+question
    ans="AI: "+answer
    send(question_string,broadcast=True)
    send(ans,broadcast=True)

if __name__=='__main__':
    print("hwelloo")
    port = int(os.environ.get("PORT", 3000))  # Use 3000 locally, or Railway's port in production
    socketio.run(app,host='0.0.0.0',port=port,debug=True)