import React, { useState, useRef, useEffect } from 'react';
import { Send, Users, Crown, Check, X, MessageCircle, Gamepad2, Info } from 'lucide-react';
import briefcaseImg from '../assets/free-briefcase-icon-1965-thumb.png';
import { User, ChatMessage } from '../types';

interface LobbyProps {
  user: User;
  roomId: string;
  users: User[];
  chatMessages: ChatMessage[];
  onToggleReady: () => void;
  onSendMessage: (message: string) => void;
  onStartGame: () => void;
}

const Lobby: React.FC<LobbyProps> = ({
  user,
  roomId,
  users,
  chatMessages,
  onToggleReady,
  onSendMessage,
  onStartGame,
}) => {
  const [message, setMessage] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  const [particleImageUrl] = useState<string | null>(briefcaseImg);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSendMessage(message.trim());
    setMessage('');
  };

  const allUsersReady = users.every(u => u.isReady);
  const readyCount = users.filter(u => u.isReady).length;

  return (
    <div className="min-h-screen bg-black p-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-amber-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Floating particles (detective briefcase by default) */}
      <div className="absolute inset-0 pointer-events-none">
        {particleImageUrl
          ? [...Array(16)].map((_, i) => {
              const size = 28 + Math.floor(Math.random() * 36);
              return (
                <img
                  key={`lobby-img-${i}`}
                  src={particleImageUrl}
                  alt=""
                  className="absolute opacity-20 animate-float"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: `${size}px`,
                    height: 'auto',
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${3 + Math.random() * 2}s`,
                    filter: 'grayscale(25%)'
                  }}
                />
              );
            })
          : null}
      </div>

      {/* Instructions Popup */}
      {showInstructions && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-slate-800 rounded-2xl border border-cyan-400/50 shadow-lg shadow-cyan-500/20 w-full max-w-2xl mx-4 animate-scale-in">
            <div className="p-6 border-b border-cyan-400/20 flex items-center justify-between">
              <h2 className="text-xl font-bold text-cyan-300 flex items-center space-x-2">
                <Info className="w-5 h-5" />
                <span>Game Instructions</span>
              </h2>
              <button onClick={() => setShowInstructions(false)} className="text-gray-400 hover:text-white transition-colors text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4 text-white text-lg">
              <p><span className="text-cyan-400 font-semibold">Goal:</span> Survive as a normal player or deceive as the Catcher (impostor)!</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>At least 3 players are needed for an impostor to be present.</li>
                <li>One player is randomly assigned as the Catcher (impostor), others are Survivors.</li>
                <li>Survivors must answer questions and use clues to guess the correct answer.</li>
                <li>The Catcher can create fake AI responses to mislead Survivors.</li>
                <li>Use chat and power-ups to communicate and strategize.</li>
                <li>If a Survivor guesses the answer, Survivors win. If the Catcher deceives everyone, the Catcher wins.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-lg rounded-2xl px-6 py-3 border border-white/20">
            <Gamepad2 className="w-6 h-6 text-amber-400" />
            <span className="text-xl font-bold text-white">Case ID: {roomId}</span>
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <Users className="w-4 h-4" />
              <span>{users.length} detectives</span>
            </div>
            <button
              className="ml-4 px-3 py-1 bg-amber-500/20 rounded-full border border-amber-400/30 flex items-center space-x-2 text-amber-300 hover:bg-amber-500/40 transition-all duration-200"
              onClick={() => setShowInstructions(true)}
            >
              <Info className="w-4 h-4" />
              <span>Instructions</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Users Panel */}
          <div className="lg:col-span-1 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 animate-slide-left">
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span>Players</span>
                </h2>
                <div className="text-sm text-gray-300">
                  {readyCount}/{users.length} ready
                </div>
              </div>
              <div className="mt-4 text-center text-amber-300 text-sm font-semibold">
                You need at least 3 players to play with an impostor.<br/>Otherwise, you can enjoy a regular game!
              </div>
            </div>

            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {users.map((u, index) => (
                <div
                  key={u.id}
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    u.id === user.id
                      ? 'bg-amber-500/20 border-amber-400/50 shadow-lg shadow-amber-500/10'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        u.id === user.id ? 'bg-amber-500 text-white' : 'bg-gray-600 text-gray-200'
                      }`}>
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-white">{u.username}</span>
                          {index === 0 && <Crown className="w-4 h-4 text-yellow-400" />}
                          {u.id === user.id && <span className="text-xs text-amber-400">(You)</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center">
                      {u.isReady ? (
                        <div className="flex items-center space-x-1 text-green-400">
                          <Check className="w-4 h-4" />
                          <span className="text-sm font-medium">Ready</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1 text-gray-400">
                          <X className="w-4 h-4" />
                          <span className="text-sm">Not Ready</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Ready Button */}
            <div className="p-4 border-t border-white/20">
              <button
                onClick={onToggleReady}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                  user.isReady
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/25'
                    : 'bg-gray-700 hover:bg-gray-600 text-white'
                } hover:scale-105`}
              >
                {user.isReady ? 'Ready!' : 'Mark as Ready'}
              </button>

              {users[0]?.id === user.id && allUsersReady && users.length >= 2 && (
                <button
                  onClick={onStartGame}
                  className="w-full mt-3 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-amber-500/25"
                >
                  Start Investigation
                </button>
              )}
            </div>
          </div>

          {/* Chat Panel */}
          <div className="lg:col-span-2 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 flex flex-col animate-slide-right">
            <div className="p-6 border-b border-white/20">
              <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-amber-400" />
                <span>Chat</span>
              </h2>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto max-h-96 space-y-3">
              {chatMessages.length === 0 ? (
                <div className="text-center text-gray-400 py-8">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-xl max-w-xs ${
                      msg.username === user.username
                        ? 'bg-cyan-500/20 border border-cyan-400/30 ml-auto'
                        : 'bg-white/5 border border-white/10'
                    } animate-message-in`}
                  >
                    <div className="text-xs text-gray-400 mb-1">{msg.username}</div>
                    <div className="text-white">{msg.message}</div>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-white/20">
              <form onSubmit={handleSendMessage} className="flex space-x-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 shadow-lg shadow-cyan-500/25"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-left {
          from { opacity: 0; transform: translateX(-40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slide-right {
          from { opacity: 0; transform: translateX(40px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes message-in {
          from { opacity: 0; transform: scale(0.9) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-left {
          animation: slide-left 0.6s ease-out;
        }
        .animate-slide-right {
          animation: slide-right 0.6s ease-out 0.1s both;
        }
        .animate-message-in {
          animation: message-in 0.3s ease-out;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
        .animate-float { animation: float 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default Lobby;