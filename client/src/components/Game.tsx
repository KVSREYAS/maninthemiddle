import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Eye, Target, Shield, Users, Timer, Info, UserSearch, FileText, Key } from 'lucide-react';
import { User, ChatMessage, GameProps } from '../types';

declare global{
  interface Window{
    serverClockOffset:number;
  }
}

// AI Chat Popup Component for Survivor (Enquire Witness)
const AIChatPopup: React.FC<{ onClose: () => void; onUse: () => void; remainingUses: number; handleAnswerQuestion: (question: string) => void }> = ({ 
  onClose, 
  onUse,
  handleAnswerQuestion,
  remainingUses 
}) => {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setIsLoading(true);

    handleAnswerQuestion(question);
    onClose();
    setTimeout(() => {
      setAnswer('Dummy');
      setIsLoading(false);
      onUse(); // Decrement the usage count
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-slate-900 rounded-2xl border border-amber-400/40 shadow-lg shadow-amber-500/20 w-full max-w-3xl mx-4 animate-scale-in">
        <div className="p-6 border-b border-amber-400/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                <UserSearch className="w-8 h-8 text-amber-400" />
                <span>Enquire Witness</span>
              </h2>
              <div className="ml-4 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-400/30">
                <span className="text-amber-400 font-semibold">{remainingUses} uses remaining</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-black font-bold hover:text-white transition-colors text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="question" className="block text-lg font-bold text-amber-300 mb-3">
                Your Interrogation
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask the witness a yes/no question..."
                className="w-full h-32 px-6 py-4 bg-slate-800/60 border-2 border-amber-400/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300 text-lg"
              />
            </div>

            <button
              type="submit"
              disabled={!question.trim() || isLoading || remainingUses <= 0}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-amber-500/20"
            >
              {isLoading ? (
                <span className="flex items-center justify-center space-x-2">
                  <UserSearch className="w-5 h-5 animate-pulse" />
                  <span>Questioning...</span>
                </span>
              ) : remainingUses <= 0 ? (
                <span className="flex items-center justify-center space-x-2">
                  <UserSearch className="w-5 h-5" />
                  <span>No Uses Remaining</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <UserSearch className="w-5 h-5" />
                  <span>Enquire</span>
                </span>
              )}
            </button>
          </form>

          {answer && (
            <div className="mt-6 p-6 bg-amber-500/10 border-2 border-amber-400/30 rounded-xl">
              <h3 className="text-lg font-medium text-amber-400 mb-3 flex items-center space-x-2">
                <UserSearch className="w-5 h-5" />
                <span>Witness Reply</span>
              </h3>
              <p className="text-white text-lg leading-relaxed">{answer}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Submit Answer Popup Component (Try Enigma Code)
const SubmitAnswerPopup: React.FC<{ onClose: () => void; onSubmit: (answer: string) => void }> = ({
  onClose,
  onSubmit
}) => {
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) return;
    onSubmit(answer.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-slate-900 rounded-2xl border border-amber-400/40 shadow-lg shadow-amber-500/20 w-full max-w-3xl mx-4 animate-scale-in">
        <div className="p-6 border-b border-blue-400/20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
              <Key className="w-8 h-8 text-amber-400" />
              <span>Try Enigma Code</span>
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="answer" className="block text-lg font-medium text-gray-300 mb-3">
                Enter your code
              </label>
              <input
                type="text"
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your final guess..."
                className="w-full px-6 py-4 bg-slate-800/60 border-2 border-amber-400/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300 text-lg"
              />
            </div>

            <button
              type="submit"
              disabled={!answer.trim()}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-amber-500/20"
            >
              Submit Code
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Add Answer Result Popup Component
const AnswerResultPopup: React.FC<{ onClose: () => void; result: { isCorrect: boolean; message: string } }> = ({
  onClose,
  result
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-slate-800 rounded-2xl border border-blue-400/50 shadow-lg shadow-blue-500/20 w-full max-w-md mx-4 animate-scale-in">
        <div className="p-6 border-b border-blue-400/20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
              <Target className="w-8 h-8 text-blue-400" />
              <span>Answer Result</span>
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
          <div className={`text-2xl font-bold mb-4 ${result.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {result.message}
          </div>
          <button
            onClick={onClose}
            className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Game Over Popup Component
const GameOverPopup: React.FC<{ 
  onClose: () => void; 
  data: { winner: string; correct_answer: string };
  currentUsername: string;
}> = ({
  onClose,
  data,
  currentUsername
}) => {
  const isCatcherWin = data.winner === 'Catcher';
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-slate-800 rounded-2xl border border-cyan-400/50 shadow-lg shadow-cyan-500/20 w-full max-w-md mx-4 animate-scale-in">
        <div className="p-6 border-b border-cyan-400/20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
              <Target className="w-8 h-8 text-cyan-400" />
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

// Document-themed Clues Popup
const CluesPopup: React.FC<{ onClose: () => void; clues: string[] }> = ({ onClose, clues }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
    <div className="w-full max-w-2xl mx-4 animate-scale-in">
      <div className="bg-amber-50/95 text-slate-800 rounded-2xl border-2 border-amber-700 shadow-[0_10px_40px_rgba(251,191,36,0.15)]">
        <div className="p-5 border-b-2 border-amber-700 flex items-center justify-between rounded-t-2xl bg-amber-100/70">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-700" />
            Case Documents
          </h2>
          <button onClick={onClose} className="text-amber-800 hover:text-amber-900 transition-colors text-xl">✕</button>
        </div>
        <div className="p-6 space-y-4">
          {clues.length === 0 ? (
            <div className="text-amber-900">No documents recovered.</div>
          ) : (
            clues.map((clue, idx) => (
              <div key={idx} className="bg-amber-100/70 border border-amber-700/40 rounded-xl p-4 font-serif shadow-inner">
                <div className="text-sm uppercase tracking-wide text-amber-700 mb-1">Document {idx + 1}</div>
                <div className="text-slate-900">{clue}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  </div>
);

const Game: React.FC<GameProps> = ({
  user,
  roomId,
  users,
  chatMessages,
  onSendMessage,
  onLeaveGame,
  question,
  clues,
  socket,
  gameOverData
}) => {
  const [message, setMessage] = useState('');
  const [gameTime, setGameTime] = useState(180); // 3 minutes
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiResponseUses, setAiResponseUses] = useState(10);
  const [showSubmitAnswer, setShowSubmitAnswer] = useState(false);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [showAnswerResult, setShowAnswerResult] = useState(false);
  const [answerResult, setAnswerResult] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [showGameOver, setShowGameOver] = useState(false);
  const [witnessLog, setWitnessLog] = useState<{ id: string; question: string; answer?: string }[]>([]);
  const handledWitnessIdsRef = useRef<Set<string>>(new Set());
  const chatEndRef = useRef<HTMLDivElement>(null);
  // 2. Add showCluesPopup state
  const [showCluesPopup, setShowCluesPopup] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [serverStartTime, setServerStartTime] = useState<number | null>(null);
  const [serverDuration, setServerDuration] = useState<number>(300000); // default 5 min
  const [serverTimeOffset, setServerTimeOffset] = useState<number>(0); // ms
  const [localTargetSeconds, setLocalTargetSeconds] = useState<number>(300);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // const [client_sentat,setClientsentat]=useState<number>(0);
  const clientSentat=useRef<number>(0);
  const hasEmittedStartTimer = useRef(false);
  const starttimer=useRef(false);
  // // Helper to get now in server time
  // function nowServer() {
  //   return Date.now() + serverTimeOffset;
  // }

  // // Sync server time offset
  // function syncClock(serverTime: number) {
  //   const clientNow = Date.now();
  //   setServerTimeOffset(serverTime - clientNow);
  // }

  // // Handle timer events from server
  // useEffect(() => {
  //   function handleTimerEvent(data: { startTime: number; duration: number; serverTime: number }) {
  //     syncClock(data.serverTime);
  //     setServerStartTime(data.startTime);
  //     setServerDuration(data.duration);
  //     // Calculate initial seconds left
  //     const now = Date.now() + (data.serverTime - Date.now());
  //     const elapsed = now - data.startTime;
  //     const remaining = Math.max(0, data.duration - elapsed);
  //     setLocalTargetSeconds(Math.ceil(remaining / 1000));
  //   }
  //   socket.on('start_timer', handleTimerEvent);
  //   socket.on('timer_correction', handleTimerEvent);
  //   return () => {
  //     socket.off('start_timer', handleTimerEvent);
  //     socket.off('timer_correction', handleTimerEvent);
  //   };
  // }, [socket]);

  // // Local ticking and smooth correction
  // useEffect(() => {
  //   if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  //   timerIntervalRef.current = setInterval(() => {
  //     if (serverStartTime == null) return;
  //     const now = nowServer();
  //     const elapsed = now - serverStartTime;
  //     const remaining = Math.max(0, serverDuration - elapsed);
  //     const seconds = Math.ceil(remaining / 1000);
  //     // Smooth correction: lerp if off by >1s
  //     setGameTime(prev => {
  //       if (Math.abs(seconds - prev) > 1) {
  //         // Lerp toward correct value
  //         return Math.round(prev + (seconds - prev) * 0.3);
  //       }
  //       return seconds;
  //     });
  //     if (remaining <= 0) {
  //       if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  //       onLeaveGame();
  //     }
  //   }, 1000);
  //   return () => {
  //     if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
  //   };
  // }, [serverStartTime, serverDuration, serverTimeOffset, onLeaveGame]);

const start_timer=(duration:number)=>{
  setGameTime(Math.floor(duration/1000));
  setInterval(()=>{
    setGameTime(prev => Math.max(0, prev - 1));
  }, 1000);
};
useEffect(() => {
  socket.on('penalty', (data: { penalty: number }) => {
    console.log('Penalty received:', data.penalty);
    setGameTime(prev => Math.max(0, prev - data.penalty));
    // Handle penalty (e.g., reduce time)
  });
}, [socket]);


useEffect(()=>{
  console.log('page opened')
  clientSentat.current=Date.now()
  if (hasEmittedStartTimer.current) return; // Prevent multiple emissions
  console.log('Emitting start_timer_request');
  socket.emit('start_timer_request');
  hasEmittedStartTimer.current = true;

},[]);

useEffect(()=>{
  socket.on('start_timer',(data:{startTime:number,duration:number,serverTime:number})=>{
    console.log('server_time_recieved');
    console.log(data.serverTime);
    console.log(data.startTime);
    const client_recieved_at=Date.now();
    console.log("client recieved at"+client_recieved_at);
    console.log("Client sent at"+clientSentat.current);
    const latency=(client_recieved_at-clientSentat.current)/2;
    console.log("Latency"+latency);

    const server_time_now=data.serverTime+latency;
    console.log(server_time_now);
    if(server_time_now>data.startTime){
      const delay=server_time_now-data.startTime;
      setTimeout(()=>{
        console.log(data.duration);
        if(starttimer.current) return; // Prevent multiple starts
        starttimer.current=true;
        start_timer(data.duration);
      },delay)
    }
    else{
      const time_elapsed=server_time_now-data.serverTime
      console.log(data.duration-time_elapsed);
      if(starttimer.current) return; // Prevent multiple starts
      starttimer.current=true;
      start_timer(data.duration-time_elapsed);
    }
  });
},[socket])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(()=>{
    socket.on('witness_answer',(data:{question:string,answer:string})=>{
      setWitnessLog(prev=>[...prev,{id:data.question,question:data.question,answer:data.answer}]);
    });
  },[socket])

  useEffect(() => {
    socket.on('answer_result', (data: { username: string; is_correct: boolean; answer: string }) => {
      if (data.username === user.username) {
        setAnswerResult({
          isCorrect: data.is_correct,
          message: data.is_correct ? 'Correct answer!' : 'Incorrect answer. Try again!'
        });
        setShowAnswerResult(true);
      }
    });
  

    return () => {
      socket.off('answer_result');
    };
  }, [user.username, socket]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSendMessage(message.trim());
    setMessage('');
  };

  const handleAnswerQuestion = (question: string) => {
    socket.emit('answer_question', question);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const catcherCount = users.filter(u => u.role === 'catcher').length;
  const normalCount = users.filter(u => u.role === 'normal').length;

  const handleAiResponseUse = () => {
    setAiResponseUses(prev => Math.max(0, prev - 1));
  };

  const handleSubmitAnswer = (answer: string) => {
    socket.emit('submit_answer', answer, user.username);
    setHasSubmittedAnswer(true);
    setShowSubmitAnswer(false);
  };

  return (
    <div className="min-h-screen bg-black p-4 relative overflow-hidden">
      {/* Dynamic background based on role */}
      <div className="absolute inset-0 overflow-hidden">
        {user.role === 'catcher' ? (
          <>
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </>
        ) : (
          <>
            <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/3 left-1/3 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </>
        )}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Game Header */}
        <div className="text-center mb-6 animate-fade-in">
          <div className="inline-flex items-center space-x-6 bg-white/10 backdrop-blur-lg rounded-2xl px-8 py-3 border border-white/20">
            <div className="flex items-center space-x-2">
              <Timer className="w-5 h-5 text-amber-400" />
              <span className="text-xl font-bold text-white">{formatTime(gameTime)}</span>
            </div>
            <div className="h-6 w-px bg-white/20"></div>
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <span>Case ID: {roomId}</span>
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


        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Column: Case File (top) + Players (bottom) */}
          <div className="lg:col-span-1 h-[calc(100vh-16rem)]">
            {/* Case File Panel */}
            <div className="bg-amber-50/95 text-slate-800 rounded-2xl border-2 border-amber-700 shadow-[0_10px_40px_rgba(251,191,36,0.15)] h-full flex flex-col">
              <div className="p-5 border-b-2 border-amber-700 flex items-center justify-between rounded-t-2xl bg-amber-100/70">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-700" />
                  Case File
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-amber-100/70 border border-amber-700/40 rounded-xl p-4 font-serif shadow-inner">
                  <div className="text-sm uppercase tracking-wide text-amber-700 mb-1">Case Brief</div>
                  <div className="text-slate-900 text-lg">{question}</div>
                </div>
                <div className="space-y-3">
                  {clues.map((clue, idx) => (
                    <div key={idx} className="bg-amber-100/70 border border-amber-700/40 rounded-xl p-4 font-serif shadow-inner">
                      <div className="text-sm uppercase tracking-wide text-amber-700 mb-1">Document {idx + 1}</div>
                      <div className="text-slate-900 text-base">{clue}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>


          </div>

          {/* Witness Desk */}
          <div className="lg:col-span-1 bg-white/10 backdrop-blur-lg rounded-2xl border border-amber-400/40 shadow-lg shadow-amber-500/20 animate-slide-left h-[calc(100vh-16rem)] flex flex-col">
            <div className="p-6 border-b border-amber-400/20">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <UserSearch className="w-6 h-6 text-amber-400" />
                  <span>Witness Desk</span>
                </h2>
                <div className="px-3 py-1 bg-amber-500/10 rounded-full border border-amber-400/30">
                  <span className="text-amber-400 font-semibold">{aiResponseUses} uses remaining</span>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 space-y-4 overflow-y-auto">
              <p className="text-slate-200 font-bold text-sm">
                Enquire the witness for yes/no leads. Use sparingly.
              </p>
              <button
                onClick={() => setShowAIChat(true)}
                disabled={aiResponseUses <= 0}
                className={`w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3 shadow-lg shadow-amber-500/20 ${
                  aiResponseUses <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <UserSearch className="w-6 h-6" />
                <span>{aiResponseUses <= 0 ? 'No Uses Remaining' : 'Enquire Witness'}</span>
              </button>

              <button
                onClick={() => setShowSubmitAnswer(true)}
                className={`w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3 shadow-lg shadow-amber-500/20 `}
              >
                <Key className="w-6 h-6" />
                <span>{'Try Enigma Code'}</span>
              </button>

              {/* Witness Log */}
              <div className="mt-2 bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                  <UserSearch className="w-4 h-4 text-amber-400" /> Witness Log
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {witnessLog.length === 0 ? (
                    <div className="text-gray-400 text-sm">No interrogations yet.</div>
                  ) : (
                    witnessLog.map((entry) => (
                      <div key={entry.id} className="space-y-1">
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs shrink-0">
                            <Shield className="w-4 h-4" />
                          </div>
                          <div className="bg-amber-500/20 border border-amber-400/30 text-white rounded-xl px-3 py-2 text-sm max-w-[80%]">
                            {entry.question}
                          </div>
                        </div>
                        {entry.answer && (
                          <div className="flex items-start gap-2 justify-end">
                            <div className="bg-amber-100/80 border border-amber-400/50 text-slate-900 rounded-xl px-3 py-2 text-sm max-w-[80%]">
                              {entry.answer}
                            </div>
                            <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs shrink-0">
                              <UserSearch className="w-4 h-4" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Chat moved to floating bottom-right panel */}
        </div>
      </div>

      {/* Floating Chat Panel */}
      <div className="fixed bottom-4 right-4 z-20 w-80 sm:w-96 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl flex flex-col">
        <div className="p-3 border-b border-white/20 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-semibold text-white">Case Chat</span>
        </div>
        <div className="flex-1 p-3 overflow-y-auto max-h-64 space-y-3">
          {chatMessages.length === 0 ? (
            <div className="text-center text-gray-400 py-4">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Share your leads here…</p>
            </div>
          ) : (
            chatMessages.map((msg) => {
              const msgUser = users.find(u => u.username === msg.username);
              return (
                <div
                  key={msg.id}
                  className={`p-2 rounded-xl max-w-[75%] ${
                    msg.username === user.username
                      ? 'bg-amber-500/20 border border-amber-400/30 ml-auto'
                      : msgUser?.role === 'catcher'
                      ? 'bg-red-500/20 border border-red-400/30'
                      : 'bg-white/10 border border-white/10'
                  } animate-message-in`}
                >
                  <div className={`text-[10px] mb-1 flex items-center space-x-1 ${
                    msgUser?.role === 'catcher' ? 'text-red-400' : 'text-amber-300'
                  }`}>
                    <span>{msg.username}</span>
                    {msgUser?.role === 'catcher' && <Target className="w-3 h-3" />}
                  </div>
                  <div className="text-white text-sm">{msg.message}</div>
                </div>
              );
            })
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="p-3 border-t border-white/20">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-300"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 shadow-lg shadow-amber-500/25"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Floating Players Panel */}
      <div className="fixed bottom-4 left-4 z-20 w-72 sm:w-80 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl flex flex-col">
        <div className="p-3 border-b border-white/20 flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-400" />
          <span className="text-sm font-semibold text-white">Detectives</span>
        </div>
        <div className="flex-1 p-3 overflow-y-auto max-h-56 space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className={`p-2 rounded-xl border text-sm flex items-center justify-between ${
                u.role === 'catcher'
                  ? 'bg-red-500/10 border-red-400/30'
                  : (u.id === user.id
                    ? 'bg-amber-500/20 border-amber-400/30'
                    : 'bg-white/10 border-white/10')
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${u.role === 'catcher' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>{u.username.charAt(0).toUpperCase()}</div>
                <div className="flex flex-col leading-tight">
                  <span className="text-white text-[13px]">{u.username} {u.id === user.id && <span className="text-amber-300 text-[10px]">(you)</span>}</span>
                  <span className={`text-[10px] ${u.role === 'catcher' ? 'text-red-400' : 'text-amber-300'}`}>{u.role === 'catcher' ? 'Catcher' : 'Detective'}</span>
                </div>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-white/20">
          <button
            onClick={onLeaveGame}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm font-semibold transition-all duration-300"
          >
            Leave Case
          </button>
        </div>
      </div>

      {showAIChat && (
        <AIChatPopup 
          onClose={() => setShowAIChat(false)} 
          onUse={handleAiResponseUse}
          remainingUses={aiResponseUses}
          handleAnswerQuestion={handleAnswerQuestion}
        />
      )}

      {showSubmitAnswer && (
        <SubmitAnswerPopup
          onClose={() => setShowSubmitAnswer(false)}
          onSubmit={handleSubmitAnswer}
        />
      )}

      {showAnswerResult && answerResult && (
        <AnswerResultPopup
          onClose={() => setShowAnswerResult(false)}
          result={answerResult}
        />
      )}

      {gameOverData && (
        <GameOverPopup
          onClose={onLeaveGame}
          data={gameOverData}
          currentUsername={user.username}
        />
      )}
      {showCluesPopup && (
        <CluesPopup onClose={() => setShowCluesPopup(false)} clues={clues} />
      )}
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
              <p><span className="text-cyan-400 font-semibold">Goal:</span>You are a player. Discuss with your peers and get the answer</p>
              <ul className="list-disc pl-6 space-y-2">
              <li>🎯 <strong>One Shot, One Answer:</strong> Each player has only <em>one chance</em> to submit their final answer. Use it wisely!</li>
              <li>❓ <strong>Interrogate the Master:</strong> Each of you may ask the Master up to <em>2 yes/no questions</em> to uncover the truth.</li>
              <li>🕵️‍♂️ <strong>Beware the Impostor:</strong> Among you hides an impostor, skilled at deception — they can even <em>pretend to be the Master</em> and give up to <strong>two fake responses</strong> to mislead you.</li>
              <li>🔥 <strong>Trust No One:</strong> In this game, nothing and no one is what they seem. Stay sharp…</li>

              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;