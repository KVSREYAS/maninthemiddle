import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import Game from "./Game";
import "./SocketTest.css";

const SERVER_URL = "http://localhost:3000";

const SocketTest: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [username, setUsername] = useState("");
  const [joined, setJoined] = useState(false);
  const [users, setUsers] = useState<{name: string, ready: boolean}[]>([]);
  const [ready, setReady] = useState(false);
  const [Gamestart, setGamestart] = useState(false);
  const [roomid, setRoomid] = useState("");
  const [invalid_roomid, setInvalidroomid] = useState(false);

  useEffect(() => {
    const newSocket = io(SERVER_URL, { transports: ["websocket"] });
    setSocket(newSocket);

    newSocket.on("all_users_ready", () => setGamestart(true));
    newSocket.on("user_list", (users_list: {name: string, ready: boolean}[]) => setUsers(users_list));
    newSocket.on("connect", () => {
      console.log("Connected to server with id:", newSocket.id);
      setMessages((msgs) => [...msgs, "Connected to server"]);
    });
    newSocket.on("message", (msg: string) => {
      console.log("Received message:", msg);
      setMessages((msgs) => [...msgs, `${msg}`]);
    });
    newSocket.on("disconnect", () =>
      setMessages((msgs) => [...msgs, "Disconnected from server"])
    );
    newSocket.on("valid_room_id", (valid) => {
      if (valid) setJoined(true);
      else setInvalidroomid(true);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const joinChat = () => {
    if (username.trim()) {
      setMessages((msgs) => [...msgs, `You joined as ${username}`]);
      socket?.emit("connect_msg", `${username}`, roomid);
    }
  };

  const sendMessage = () => {
    if (socket && input.trim() !== "") {
      socket.emit("send_message", input, username);
      setMessages((msgs) => [...msgs, `You: ${input}`]);
      setInput("");
    }
  };

  const userReady = () => {
    if (socket) {
      setReady(true);
      socket.emit("user_ready");
    }
  };

  return (
    <div className="min-h-screen">
      {!Gamestart && socket ? (
        <div className="flex flex-col items-center">
          {!joined ? (
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-8 rounded-xl shadow-xl w-full max-w-lg mt-24 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none"></div>
              <div className="relative z-10">
                <h2 className="text-3xl font-bold text-center mb-8 text-white">
                  Join a Room
                </h2>
                <div className="space-y-4">
                  <input
                    className="w-full p-3 bg-[#141414]/30 rounded-lg outline-none text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/30 transition-all backdrop-blur-sm"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your name"
                  />
                  <input
                    className="w-full p-3 bg-[#141414]/30 rounded-lg outline-none text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/30 transition-all backdrop-blur-sm"
                    type="text"
                    value={roomid}
                    onChange={(e) => setRoomid(e.target.value)}
                    placeholder="Room ID"
                  />
                  <button
                    onClick={joinChat}
                    className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-3 rounded-lg font-medium text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-blue-500/25"
                  >
                    Join
                  </button>
                  {invalid_roomid && (
                    <p className="text-red-400 text-center mt-2">
                      Invalid Room ID
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full">
              <style>
                {`
                  @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-10px); }
                    100% { transform: translateY(0px); }
                  }
                  .title-container {
                    animation: float 6s ease-in-out infinite;
                  }
                `}
              </style>
              <div className="text-center mb-12 title-container">
                <h1 className="text-7xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 bg-clip-text text-transparent tracking-wider">
                  Scroll of Snark
                </h1>
                <p className="text-gray-400 mt-4 text-lg italic font-light tracking-wide">
                  Where Wit Meets Wisdom in the Realm of Banter
                </p>
              </div>
              <div className="flex flex-col md:flex-row justify-center w-full mt-8 gap-6">
                {/* Chat Section */}
                <div className="flex flex-col flex-1 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-6 rounded-xl shadow-xl relative overflow-hidden">
                  <style>
                    {`
                      @keyframes pulse {
                        0% { box-shadow: 0 0 30px rgba(0, 123, 255, 0.3); }
                        50% { box-shadow: 0 0 50px rgba(0, 123, 255, 0.5); }
                        100% { box-shadow: 0 0 30px rgba(0, 123, 255, 0.3); }
                      }
                      @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                      }
                      .chat-container {
                        animation: pulse 2s infinite;
                      }
                      .message {
                        animation: slideIn 0.3s ease-out;
                      }
                    `}
                  </style>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none"></div>
                  <div className="h-80 overflow-y-auto p-4 rounded-lg mb-4 bg-[#141414]/30 backdrop-blur-sm">
                    {messages.map((msg, i) => (
                      <div key={i} className="mb-2 text-sm message">
                        <div className="bg-blue-500/10 p-2 rounded-lg text-white">
                          {msg}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col space-y-3">
                    <input
                      className="p-3 bg-[#2c2c2c]/30 rounded-lg outline-none text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500/30 transition-all"
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type a message"
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <button
                      onClick={sendMessage}
                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-blue-500/25"
                    >
                      Send
                    </button>
                    {!ready ? (
                      <button
                        onClick={userReady}
                        className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded-lg font-medium text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-yellow-500/25"
                      >
                        Ready
                      </button>
                    ) : (
                      <p className="text-center text-red-400 text-lg font-medium mt-2 animate-pulse">
                        Waiting for other users to get ready...
                      </p>
                    )}
                  </div>
                </div>

                {/* User List Section */}
                <div className="w-full md:w-64 bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-4 rounded-xl shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none"></div>
                  <h3 className="text-xl font-semibold mb-4 text-white relative z-10 flex items-center">
                    <span className="mr-2">👥</span>
                    Active Users
                    <span className="ml-2 text-sm text-blue-400">({users.length})</span>
                  </h3>
                  <ul className="space-y-3 text-sm relative z-10">
                    {users.map((user, i) => (
                      <li key={i} className="user-item bg-[#141414]/30 p-3 rounded-lg flex items-center justify-between text-white backdrop-blur-sm">
                        <div className="flex items-center">
                          <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                          <span className="font-medium">{user.name}</span>
                        </div>
                        <span className={`status-badge px-3 py-1 rounded-full text-xs font-medium ${
                          user.ready 
                            ? 'bg-gradient-to-r from-green-600 to-green-500 text-white' 
                            : 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white'
                        }`}>
                          {user.ready ? 'Ready' : 'Not Ready'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Game socket={socket} />
      )}
    </div>
  );
};

export default SocketTest;
