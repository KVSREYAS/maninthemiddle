import eventlet

eventlet.monkey_patch()

from flask import Flask,request
from flask_socketio import SocketIO,send,emit
from medieval_converter import convert_func
import random
import os
from dotenv import load_dotenv
from clue_generator import generate_clue,answer_question
import time
import threading
from threading import Timer
load_dotenv()


app=Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'

socketio=SocketIO(app,cors_allowed_origins="*",async_mode="eventlet")


rooms={}
connected_users={}
user_status={}
user_roles={}
first_time=True
usertoroom={}
next_avail_room=1
timers={}

def create_room(roomid):
    rooms[roomid]={}
    rooms[roomid]["connected_users"]={}
    rooms[roomid]["user_status"]={}
    rooms[roomid]["user_roles"]={}
    rooms[roomid]["role_assigned"]=False
    # rooms[roomid]["timer"] = {"start_time": None, "duration": None}
  

def broadcast_all_users(roomid):
    user_list = [{"name": username, "ready": rooms[roomid]["user_status"][sid]} 
                 for sid, username in rooms[roomid]["connected_users"].items()]
    print(user_list)
    for user in rooms[roomid]["connected_users"]:
        socketio.emit('user_list', user_list, to=user)

# def periodic_timer_corrections():
#     while True:
#         for roomid, room in rooms.items():
#             timer = room.get("timer", {})
#             if timer.get("start_time") and timer.get("duration"):
#                 socketio.emit('timer_correction', {
#                     'startTime': timer["start_time"],
#                     'duration': timer["duration"],
#                     'serverTime': int(time.time() * 1000)
#                 }, room=roomid)
#         time.sleep(2)

# correction_thread = threading.Thread(target=periodic_timer_corrections, daemon=True)
# correction_thread.start()

@app.route('/')
def index():
    return "Flask SocketIO server running"



# @socketio.on('request_new_room')
# def room_creation():
#     global next_avail_room
#     print(next_avail_room)
#     create_room(next_avail_room)
#     socketio.emit('new_room_id',next_avail_room,to=request.sid)
#     next_avail_room+=1
    





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
        
        
        for user in rooms[roomid]["connected_users"]:
            emit('all_users_ready',to=user)
    
        
    
@socketio.on('assign_roles')
def assign_roles():
    print(rooms)
    roomid=usertoroom[request.sid]
    socketio.emit("role_recieve",rooms[roomid]["user_roles"][request.sid],to=request.sid)
    socketio.emit('q_recieve',rooms[roomid]["question"],to=request.sid)
    socketio.emit("clue_recieve",rooms[roomid]["clues"],to=request.sid)

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
    # # Find the room for this sid if possible
    # for roomid, room in rooms.items():
    #     if request.sid in room["connected_users"]:
    #         timer = room.get("timer", {})
    #         if timer.get("start_time") and timer.get("duration"):
    #             socketio.emit('timer_correction', {
    #                 'startTime': timer["start_time"],
    #                 'duration': timer["duration"],
    #                 'serverTime': int(time.time() * 1000)
    #             }, to=request.sid)

@socketio.on('connect_msg')
def connect_msg(username, roomid):
    print("Recieved connect msg")
    try:
        roomid_int = int(roomid)
    except (ValueError, TypeError):
        socketio.emit("valid_room_id",{"success":False,"message":"Invalid room id"},to=request.sid)
        return
    if roomid_int not in rooms:
        socketio.emit("valid_room_id",{"success":False,"message":"Invalid room id"},to=request.sid)
        return
    print(rooms)
    if rooms[roomid_int]["role_assigned"]:
        socketio.emit("valid_room_id",{"success":False,"message":"Game has already started"},to=request.sid)
        return
    # Add user to the room
    rooms[roomid_int]["connected_users"][request.sid] = username
    rooms[roomid_int]["user_status"][request.sid] = False
    print(rooms)
    string = username + " has arrived"
    for user in rooms[roomid_int]["connected_users"]:
        if user != request.sid:
            send(string, to=user)
    broadcast_all_users(roomid_int)
    usertoroom[request.sid] = roomid_int
    socketio.emit("valid_room_id",{"success":True,"message":"Joined"}, to=request.sid)

@socketio.on('request_new_room')
def room_creation(username):
    global next_avail_room
    print(next_avail_room)
    create_room(next_avail_room)
    print("Creating room with ID:", next_avail_room)
    socketio.emit('new_room_id',next_avail_room,to=request.sid)
    connect_msg(username,next_avail_room)
    next_avail_room+=1


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
    for user in rooms[user_room_id]["connected_users"]:
        if user != request.sid:
            send(f"{username} has left", to=user)
    if len(rooms[user_room_id]["connected_users"])==0:
        print(user_room_id)
        rooms.pop(user_room_id,None)
        timers.pop(user_room_id, None)
        print(rooms)
    print(rooms)

@socketio.on('leave_game')
def leave_game():
    user_room_id = usertoroom[request.sid]
    username = rooms[user_room_id]["connected_users"].get(request.sid, "Unknown")
    print(f"{username} has left the game")
    rooms[user_room_id]["connected_users"].pop(request.sid, None)
    rooms[user_room_id]["user_status"].pop(request.sid, None)
    rooms[user_room_id]["user_roles"].pop(request.sid, None)
    # rooms[user_room_id]["role_assigned"] = False
    broadcast_all_users(user_room_id)
    send(f"{username} has left", broadcast=True)
    if len(rooms[user_room_id]["connected_users"]) == 0:
        print(user_room_id)
        rooms.pop(user_room_id, None)
        timers.pop(user_room_id, None)
        print(timers)
        print(rooms)
    usertoroom.pop(request.sid, None)


@socketio.on('send_message')
def handle_message(msg,username):
    print('Message recieved',msg)
    msg=convert_func(msg)
    roomno=usertoroom[request.sid]
    string=username+" : "+msg
    self_string="You: " + msg
    for user in rooms[roomno]["connected_users"]:
        if user != request.sid:
            print(f"Sending message to {user}")
            send(string,to=user)
    # send(string,broadcast=True,include_self=False)
    send(self_string,to=request.sid)


def is_answer_correct(actual_answer: str, user_answer: str) -> bool:
    # Words to remove
    remove_words = {"the", "a", "an"}
    
    def clean_text(text):
        words = text.lower().split()
        return " ".join(word for word in words if word not in remove_words)
    
    # Clean both answers
    actual_clean = clean_text(actual_answer)
    user_clean = clean_text(user_answer)
    
    # Function to calculate edit distance
    def edit_distance(s1, s2):
        m, n = len(s1), len(s2)
        dp = [[0] * (n + 1) for _ in range(m + 1)]
        
        for i in range(m + 1):
            for j in range(n + 1):
                if i == 0:
                    dp[i][j] = j
                elif j == 0:
                    dp[i][j] = i
                elif s1[i-1] == s2[j-1]:
                    dp[i][j] = dp[i-1][j-1]
                else:
                    dp[i][j] = 1 + min(dp[i-1][j],     # deletion
                                       dp[i][j-1],     # insertion
                                       dp[i-1][j-1])   # substitution
        return dp[m][n]
    
    # Check edit distance tolerance of 1
    return edit_distance(actual_clean, user_clean) <= 1

@socketio.on('submit_answer')
def handle_answer(answer, username):
    roomid = usertoroom[request.sid]
    print(f'Answer submitted by {username}: {answer}')
    print(f'Correct answer is: {rooms[roomid]["answer"]}')
    
    # Check if the answer is correct
    is_correct = is_answer_correct(rooms[roomid]["answer"], answer)
    print(f'Is answer correct? {is_correct}')
    
    # Send the result to all players
    for user in rooms[roomid]["connected_users"]:
        socketio.emit('answer_result', {
            'username': username,
            'is_correct': is_correct,
            'answer': answer
        },to=user)
    
    if is_correct:
        # If correct, end the game
        print("Correct answer! Emitting game_over event")
        print(f"Winner: {username}, Correct Answer: {rooms[roomid]['answer']}")
        # Emit to all clients in the room
        for user in rooms[roomid]["connected_users"]:
            socketio.emit('game_over', {
                'winner': "The Guessers",
                'correct_answer': rooms[roomid]["answer"]
            }, to=user)
        print("Game over event emitted to room:", roomid)
    else:
        reduce_time(roomid,20)  # Reduce time by 10 seconds if the answer is incorrect
        for user in rooms[roomid]["connected_users"]:
            socketio.emit('penalty',{
                'penalty': 20
            }, to=user)  # Notify the user who answered incorrectly


@socketio.on("answer_question")
def answer_ques(question):
    roomid=usertoroom[request.sid]
    print("recieved question",question)
    ans=answer_question(rooms[roomid]["answer"],question)
    username=rooms[roomid]["connected_users"][request.sid]
    question_string=username+" : "+question
    ans="AI: "+ans
    for user in rooms[roomid]["connected_users"]:
        print(f"Sending message to {user}")
        send(question_string,to=user)
        send(ans,to=user)


@socketio.on("handle_fake_answer")
def handle_fake_answer(question,answer):
    roomid=usertoroom[request.sid]
    username=rooms[roomid]["connected_users"][request.sid]
    question_string=username+" : "+question
    ans="AI: "+answer
    for user in rooms[roomid]["connected_users"]:
        print(f"Sending message to {user}")
        send(question_string,to=user)
        send(ans,to=user)



@socketio.on('sync_time')
def handle_sync_time(client_sent_at):
    print("Recieved sync request")
    server_time = int(time.time() * 1000)  # milliseconds
    socketio.emit('sync_time_response', {
        'clientSentAt': client_sent_at,
        'serverTime': server_time
    })


#Timer functions

def timer_end(room_id):
    print(f"Timer ended for room: {room_id}")
    # Handle timer end logic here
    for user in rooms[room_id]["connected_users"]:
        print(f"Emitting game_over to user: {user}")
        socketio.emit('game_over', {
            'winner': "The Catcher",
            'correct_answer': rooms[room_id]["answer"]
        }, to=user)

def init_timer(game_id, duration):
    end_time = time.time() + duration
    t = threading.Timer(duration, timer_end, args=[game_id])
    t.start()
    timers[game_id] = {"timer": t, "end_time": end_time}
    print(f"Timer started for {game_id} with {duration} seconds")

def reduce_time(game_id, seconds):
    if game_id in timers:
        data = timers[game_id]
        data["timer"].cancel()  # cancel old timer
        remaining = data["end_time"] - time.time() - seconds
        if remaining <= 0:
            timer_end(game_id)
        else:
            init_timer(game_id, remaining)




@socketio.on("start_timer_request")
def start_timer():
    roomid = usertoroom[request.sid]
    print(time.time())
    print(rooms)
    if "timer" not in rooms[roomid]:
        start_time = int(time.time() * 1000) + 2000  # 2s delay for sync
        duration = 300000 # 5 minutes in ms
        rooms[roomid]["timer"] = {"start_time": start_time, "duration": duration}
        init_timer(roomid, duration / 1000)
        print("Timer initialized for room:", roomid)
        print("Timer started")
        print('timer_req_recieved')
        print(type(start_time))
    else:
        print("Timer already exists for this room")
        start_time=rooms[roomid]["timer"]["start_time"]
        duration=rooms[roomid]["timer"]["duration"]
    print("Sending to",request.sid)
    socketio.emit('start_timer', {
        'startTime': start_time,
        'duration': duration,
        'serverTime': int(time.time() * 1000)
    }, to=request.sid)




if __name__=='__main__':
    print("hwelloo")
    port = int(os.environ.get("PORT", 3000))  # Use 3000 locally, or Railway's port in production
    socketio.run(app,host='0.0.0.0',port=port,debug=True)