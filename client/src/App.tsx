import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import SignIn from './components/SignIn';
import Lobby from './components/Lobby';
import Game from './components/Game';
import CatcherGame from './components/CatcherGame';
import type { GamePage, User, GameRoom, ChatMessage } from './types';
import { Home, Target } from 'lucide-react';
import { Routes, Route, Navigate } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

// const SERVER_URL = "https://maninthemiddle-production.up.railway.app";
const SERVER_URL = "http://localhost:3000";

const App: React.FC = () => {
  const [socket, setSocket] = useState<typeof Socket | null>(null);
  const [currentPage, setCurrentPage] = useState<GamePage>('signin');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [users, setUsers] = useState<{name: string, ready: boolean}[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [question, setQuestion] = useState<string>('');
  const [clues, setClues] = useState<string[]>([]);
  const [answer, setAnswer] = useState('');
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [gameState, setGameState] = useState<'lobby' | 'game' | 'catcher'>('lobby');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [showGameOver, setShowGameOver] = useState(false);
  const [gameOverData, setGameOverData] = useState<{ winner: string; correct_answer: string } | null>(null);
  const socketRef = useRef<typeof Socket | null>(null);
  const [signInResetLoading, setSignInResetLoading] = useState<(() => void) | null>(null);
  const [signInError, setSignInError] = useState<string | null>(null);
  const navigate=useNavigate();
  const [creatingRoom, setCreatingRoom] = useState(false);

  useEffect(() => {
    const newSocket = io(SERVER_URL, { transports: ["websocket"] });
    setSocket(newSocket);
    socketRef.current = newSocket;  // Store socket reference

    newSocket.on("connect", () => {
      console.log("Connected to server with id:", newSocket.id);
      setMessages(msgs => [...msgs, "Connected to server"]);
    });

    newSocket.on("message", (msg: string) => {
      console.log("Received message:", msg);
      setMessages(msgs => [...msgs, msg]);
    });

    newSocket.on("user_list", (usersList: {name: string, ready: boolean}[]) => {
      setUsers(usersList);
    });
    
    newSocket.on("all_users_ready", () => {
      newSocket.emit("assign_roles");
      setGameStarted(true);
      setCurrentPage('game');
      console.log("Entering game page");
      navigate("/game");
    });

    newSocket.on("role_recieve", (role: string) => {
      console.log("Received role:", role);
      setCurrentUser(prev => {
        if (!prev) return null;
        return {
          ...prev,
          role: role.toLowerCase() as 'catcher' | 'normal'
        };
      });
      if (role === 'catcher') {
        setGameState('catcher');
      } else {
        setGameState('game');
      }
    });

    newSocket.on("q_recieve", (q: string) => {
      console.log("Received question:", q);
      setQuestion(q);
    });

    newSocket.on("clue_recieve", (c: string[]) => {
      console.log("Received clues:", c);
      setClues(c);
    });

    newSocket.on("answer_recieve", (a: string) => {
      setAnswer(a);
    });

    newSocket.on("valid_room_id", (obj:{success: boolean,message:string}) => {
      console.log(obj);
      if (!obj.success) {
        setSignInError(obj.message);
        if (signInResetLoading) signInResetLoading();
      }else{
        setSignInError(null);
        navigate("/lobby");
        setCurrentPage('lobby');
      }
    });

    newSocket.on("game_over", (data: { winner: string; correct_answer: string }) => {
      console.log("Game over event received");
      console.log("Game over data:", data);
      setGameOverData(data);
      setShowGameOver(true);
    });

    newSocket.on("new_room_id", (newroomid: number) => {
      console.log(newroomid);
      setRoomId(newroomid.toString());
      setCreatingRoom(false);
      setSignInError(null);
      navigate("/lobby");
      setCurrentPage('lobby');
      // console.log(newRoomId);
      // console.log(username);
      // socket?.emit('connect_msg',username,newRoomId)
    });

    return () => {
      console.log("Cleaning up socket listeners");
      if (socketRef.current) {
        socketRef.current.off('game_over');
        socketRef.current.disconnect();
      }
    }
  }, []);

  const handleJoinRoom = (username: string, roomId: string) => {
    if (!socket) return;

    const newUser: User = {
      id: socket.id,
      username,
      isReady: false,
    };
    console.log(username)
    socket.emit("connect_msg", username, roomId);
    setCurrentUser(newUser);
    setUsername(username);
    setRoomId(roomId);

    // setCurrentPage('lobby');
  };

  const handleCreateRoom = (username1: string) => {
    if (!socket) return;
    console.log("room created");
    const newUser1: User = {
      id: socket.id,
      username,
      isReady: false,
    };
    
    setUsername(username1);
    console.log(username)
    setCreatingRoom(true);
    setCurrentUser(newUser1);
    socket.emit('request_new_room',username1);
  };

  const handleToggleReady = () => {
    if (!socket || !currentUser) return;
    console.log(currentUser)
    socket.emit("user_ready");
    setCurrentUser(prev => prev ? { ...prev, isReady: true } : null);
  };

  const handleSendMessage = (message: string) => {
    if (!socket || !currentUser) return;

    socket.emit("send_message", message, currentUser.username);
  };

  const handleLeaveGame = () => {
    if (socket) {
      socket.emit("leave_game");
    }
    navigate("/");
    setCurrentPage('signin');
    setCurrentUser(null);
    setCurrentRoom(null);
    setMessages([]);
    setUsers([]);
    setGameStarted(false);
    setGameState('lobby');
  };

  const assignRoles = () => {
    if (!socket || !currentUser) return;
    console.log("assigning roles")
    socket.emit("assign_roles");
  };

  // Add Game Over Popup Component
  const GameOverPopup: React.FC<{ onClose: () => void; data: { winner: string; correct_answer: string } }> = ({
    onClose,
    data
  }) => {
    const isCatcherWin = currentUser?.role === 'catcher' && data.winner === currentUser.username;
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-slate-800 rounded-2xl border border-red-400/50 shadow-lg shadow-red-500/20 w-full max-w-md mx-4 animate-scale-in">
          <div className="p-6 border-b border-red-400/20">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                <Target className="w-8 h-8 text-red-400" />
                <span>Game Over!</span>
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors text-xl"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-6 text-center">
            <div className={`text-2xl font-bold mb-4 ${isCatcherWin ? 'text-red-400' : 'text-green-400'}`}>
              {isCatcherWin ? 'The Catcher Won!' : 'The Guessers Won!'}
            </div>
            <div className="text-white mb-6">
              <p className="mb-2">Winner: <span className={isCatcherWin ? 'text-red-400' : 'text-green-400'}>{data.winner}</span></p>
              <p>Correct Answer: <span className={isCatcherWin ? 'text-red-400' : 'text-green-400'}>{data.correct_answer}</span></p>
            </div>
            <button
              onClick={onClose}
              className={`w-full py-4 bg-gradient-to-r ${isCatcherWin ? 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700' : 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'} text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  if (currentPage === 'signin') {
    return <SignIn onJoinRoom={handleJoinRoom} onCreateRoom={handleCreateRoom} setResetLoading={setSignInResetLoading} error={signInError} clearError={() => setSignInError(null)} creatingRoom={creatingRoom} />;
  }

  // if (currentPage === 'lobby' && currentUser) {
  //   return (
  //     <Lobby
  //       user={currentUser}
  //       roomId={roomId}
  //       users={users.map(u => ({
  //         id: u.name,
  //         username: u.name,
  //         isReady: u.ready
  //       }))}
  //       chatMessages={messages.map((msg, index) => ({
  //         id: index.toString(),
  //         username: msg.split(':')[0] || 'System',
  //         message: msg.split(':')[1] || msg,
  //         timestamp: new Date()
  //       }))}
  //       onToggleReady={handleToggleReady}
  //       onSendMessage={handleSendMessage}
  //       onStartGame={assignRoles} // Handled by server
  //     />
  //   );
  // }
  
  const NotFound = () => {
    return <h1>404 - Page Not Found</h1>;
  };


  return (
    <Routes>
      {/* <Route
      path='/catcher_game'
      element={
        
      } */}

      <Route
        path="/game"
        element={currentUser?.role=='normal'? <Game
            user={currentUser}
            roomId={roomId}
            users={users.map(u => ({
              id: u.name,
              username: u.name,
              isReady: u.ready
            }))}
            chatMessages={messages.map((msg, index) => ({
              id: index.toString(),
              username: msg.split(':')[0] || 'System',
              message: msg.split(':')[1] || msg,
              timestamp: new Date()
            }))}
            onSendMessage={handleSendMessage}
            onLeaveGame={handleLeaveGame}
            question={question}
            clues={clues}
            socket={socket!}
            gameOverData={gameOverData}
          />:      <CatcherGame
          user={currentUser}
          roomId={roomId}
          users={users.map(u => ({
            id: u.name,
            username: u.name,
            isReady: u.ready
          }))}
          chatMessages={messages.map((msg, index) => ({
            id: index.toString(),
            username: msg.split(':')[0] || 'System',
            message: msg.split(':')[1] || msg,
            timestamp: new Date()
          }))}
          onSendMessage={handleSendMessage}
          onLeaveGame={handleLeaveGame}
          question={question}
          clues={clues}
          answer={answer}
          socket={socket!}
          gameOverData={gameOverData}
        />
        }
      />

      <Route path="/" element={<App/>} />

      <Route path="/Lobby" element={<Lobby
        user={currentUser}
        roomId={roomId}
        users={users.map(u => ({
          id: u.name,
          username: u.name,
          isReady: u.ready
        }))}
        chatMessages={messages.map((msg, index) => ({
          id: index.toString(),
          username: msg.split(':')[0] || 'System',
          message: msg.split(':')[1] || msg,
          timestamp: new Date()
        }))}
        onToggleReady={handleToggleReady}
        onSendMessage={handleSendMessage}
        onStartGame={assignRoles} // Handled by server
      />
      }
      />

    </Routes>
  );
  
//   if (currentPage === 'game' && currentUser && currentUser.role=='normal') {
//     return (
//       <Game
//         user={currentUser}
//         roomId={roomId}
//         users={users.map(u => ({
//           id: u.name,
//           username: u.name,
//           isReady: u.ready
//         }))}
//         chatMessages={messages.map((msg, index) => ({
//           id: index.toString(),
//           username: msg.split(':')[0] || 'System',
//           message: msg.split(':')[1] || msg,
//           timestamp: new Date()
//         }))}
//         onSendMessage={handleSendMessage}
//         onLeaveGame={handleLeaveGame}
//         question={question}
//         clues={clues}
//         socket={socket!}
//         gameOverData={gameOverData}
//       />
//     );
//   }
  
//   if (currentPage === 'game' && currentUser && currentUser.role=='catcher'){
//     return (
      // <CatcherGame
      //   user={currentUser}
      //   roomId={roomId}
      //   users={users.map(u => ({
      //     id: u.name,
      //     username: u.name,
      //     isReady: u.ready
      //   }))}
      //   chatMessages={messages.map((msg, index) => ({
      //     id: index.toString(),
      //     username: msg.split(':')[0] || 'System',
      //     message: msg.split(':')[1] || msg,
      //     timestamp: new Date()
      //   }))}
      //   onSendMessage={handleSendMessage}
      //   onLeaveGame={handleLeaveGame}
      //   question={question}
      //   clues={clues}
      //   answer={answer}
      //   socket={socket!}
      //   gameOverData={gameOverData}
      // />
//     );
//   }

  return null;
};

export default App;