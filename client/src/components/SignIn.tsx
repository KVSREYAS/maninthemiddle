import React, { useState } from 'react';
import { User, Gamepad2, Users, Sparkles, Search, Fingerprint, Puzzle } from 'lucide-react';
import Lottie from 'lottie-react';
import animationData from '../assets/Loading animation.json';

interface SignInProps {
  onJoinRoom: (username: string, roomId: string) => void;
  onCreateRoom?: (username: string) => void;
  setResetLoading?: (resetFn: () => void) => void;
  error?: string | null;
  clearError?: () => void;
  creatingRoom?: boolean;
}

const SignIn: React.FC<SignInProps> = ({ onJoinRoom, onCreateRoom, setResetLoading, error, clearError, creatingRoom }) => {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isLoadingRef = React.useRef(setIsLoading);
  React.useEffect(() => {
    isLoadingRef.current = setIsLoading;
  }, [setIsLoading]);
  React.useEffect(() => {
    if (setResetLoading) {
      setResetLoading(() => () => isLoadingRef.current(false));
    }
  }, [setResetLoading]);
  // fallback: clear loading if error changes
  React.useEffect(() => {
    if (error) setIsLoading(false);
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !roomId.trim()) return;
    
    setIsLoading(true);
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1500));
    onJoinRoom(username.trim(), roomId.trim());
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  const handleCreateRoom = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!username.trim() || !onCreateRoom) return;
    console.log(username.trim());
    onCreateRoom(username.trim());
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-cyan-400/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-2xl mb-4 shadow-lg shadow-cyan-500/25">
            <Lottie
              animationData={animationData}
              loop={true}
              style={{ height: 100, width: 120 }}
            />
          </div>
          <h1 className="text-4xl font-[Oswald] text-white mb-2 bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent neon-glow">
            Misclue
          </h1>

          <p className="text-lg text-amber-300 italic mb-2">Put on your hat, follow the clues, and crack the case.</p>
        </div>

        {/* Sign In Form */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 animate-slide-up">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative group">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (clearError) clearError();
                  }}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                  required
                />
              </div>

              <div className="relative group">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  type="text"
                  placeholder="Enter room ID"
                  value={roomId}
                  onChange={(e) => {
                    setRoomId(e.target.value);
                    if (clearError) clearError();
                  }}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || creatingRoom || !username.trim() || !roomId.trim()}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-amber-500/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 relative overflow-hidden group"
            >
              {(isLoading && !creatingRoom) ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Joining Investigation...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Search className="w-5 h-5" />
                  <span>Join Investigation</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
            <button
              type="button"
              disabled={isLoading || creatingRoom || !username.trim()}
              onClick={handleCreateRoom}
              className="w-full mt-2 bg-gradient-to-r from-amber-600 to-yellow-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-yellow-500/25 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 relative overflow-hidden group"
            >
              {creatingRoom ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Opening New Case...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Fingerprint className="w-5 h-5" />
                  <span>Open New Case</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            </button>
            {error && (
              <div className="mt-3 text-center text-red-500 text-sm font-semibold animate-fade-in">
                {error}
              </div>
            )}
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              New to Misclue? Ask for a Case ID from your partner, or open a new case to begin the investigation.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.8s ease-out 0.3s both;
        }
      `}</style>
    </div>
  );
};

export default SignIn;