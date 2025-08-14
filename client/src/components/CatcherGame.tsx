import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, Eye, Target, Shield, Users, Timer, Brain, Info, FileText, ChevronDown } from 'lucide-react';
import { User, ChatMessage, CatcherGameProps } from '../types';

// AI Chat Popup Component for Catcher
const AIChatPopup: React.FC<{ onClose: () => void; onUse: () => void; remainingUses: number ,handle_fake_answer:(question:string,answer:string)=>void}> = ({ 
  onClose, 
  onUse,
  remainingUses,
  handle_fake_answer 
}) => {
  const [question, setQuestion] = useState('');
  const [fakeAnswer, setFakeAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [answer, setAnswer] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !fakeAnswer.trim()) return;

    setIsLoading(true);
    handle_fake_answer(question,fakeAnswer);
    onClose(); // Close the popup immediately after submitting

    // TODO: Replace with actual API call to your LLM
    setTimeout(() => {
      setAnswer(fakeAnswer);
      setIsLoading(false);
      onUse(); // Decrement the usage count
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-slate-800 rounded-2xl border border-red-400/50 shadow-lg shadow-red-500/20 w-full max-w-3xl mx-4 animate-scale-in">
        <div className="p-6 border-b border-red-400/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                <Brain className="w-8 h-8 text-red-400" />
                <span>Create Fake AI Response</span>
              </h2>
              <div className="ml-4 px-3 py-1 bg-red-500/20 rounded-full border border-red-400/30">
                <span className="text-red-400 font-semibold">{remainingUses} uses remaining</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors text-xl"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="question" className="block text-lg font-medium text-gray-300 mb-3">
                Question to Answer
              </label>
              <textarea
                id="question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Enter the question you want to answer..."
                className="w-full h-32 px-6 py-4 bg-slate-700/50 border-2 border-red-400/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all duration-300 text-lg"
              />
            </div>

            <div>
              <label htmlFor="fakeAnswer" className="block text-lg font-medium text-gray-300 mb-3">
                Your Fake Answer
              </label>
              <textarea
                id="fakeAnswer"
                value={fakeAnswer}
                onChange={(e) => setFakeAnswer(e.target.value)}
                placeholder="Enter the fake answer you want to give..."
                className="w-full h-32 px-6 py-4 bg-slate-700/50 border-2 border-red-400/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all duration-300 text-lg"
              />
            </div>

            <button
              type="submit"
              disabled={!question.trim() || !fakeAnswer.trim() || isLoading || remainingUses <= 0}
              className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-red-500/20"
            >
              {isLoading ? (
                <span className="flex items-center justify-center space-x-2">
                  <Brain className="w-5 h-5 animate-pulse" />
                  <span>Processing...</span>
                </span>
              ) : remainingUses <= 0 ? (
                <span className="flex items-center justify-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>No Uses Remaining</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>Send Fake Response</span>
                </span>
              )}
            </button>
          </form>

          {answer && (
            <div className="mt-6 p-6 bg-red-500/10 border-2 border-red-400/30 rounded-xl">
              <h3 className="text-lg font-medium text-red-400 mb-3 flex items-center space-x-2">
                <Brain className="w-5 h-5" />
                <span>Response Sent</span>
              </h3>
              <p className="text-white text-lg leading-relaxed">{answer}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Submit Answer Popup Component
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
      <div className="bg-slate-800 rounded-2xl border border-red-400/50 shadow-lg shadow-red-500/20 w-full max-w-3xl mx-4 animate-scale-in">
        <div className="p-6 border-b border-red-400/20">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
              <Target className="w-8 h-8 text-red-400" />
              <span>Submit Your Answer</span>
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
                Your Answer
              </label>
              <input
                type="text"
                id="answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Enter your answer..."
                className="w-full px-6 py-4 bg-slate-700/50 border-2 border-red-400/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all duration-300 text-lg"
              />
            </div>

            <button
              type="submit"
              disabled={!answer.trim()}
              className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg shadow-red-500/20"
            >
              Submit Answer
            </button>
          </form>
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
  const isCatcherWin = data.winner === currentUsername;
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

const CatcherGame: React.FC<CatcherGameProps> = ({
  user,
  roomId,
  users,
  chatMessages,
  onSendMessage,
  onLeaveGame,
  question,
  clues,
  answer,
  socket,
  gameOverData
}) => {
  const [message, setMessage] = useState('');
  const [gameTime, setGameTime] = useState(300); // 5 minutes
  const [showAIChat, setShowAIChat] = useState(false);
  const [showSubmitAnswer, setShowSubmitAnswer] = useState(false);
  const [aiResponseUses, setAiResponseUses] = useState(2);
  const [hasSubmittedAnswer, setHasSubmittedAnswer] = useState(false);
  const [showAnswerResult, setShowAnswerResult] = useState(false);
  const [answerResult, setAnswerResult] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [witnessLog, setWitnessLog] = useState<{ id: string; question: string; answer: string }[]>([]);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [isPlayersCollapsed, setIsPlayersCollapsed] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const starttimer=useRef(false);
  
  // Add state for power-up counts
  const [powerUps, setPowerUps] = useState({
    track: 3,
    scan: 3,
    shield: 3,
    slow: 3
  });

  const [showCluesPopup, setShowCluesPopup] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // useEffect(() => {
  //   console.log('Entered')
  //   const timer = setInterval(() => {
  //     setGameTime(prev => Math.max(0, prev - 1));
  //   }, 1000);

  //   return () => clearInterval(timer);
  // }, []);

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
  const clientSentat=useRef<number>(0);
  useEffect(()=>{
    console.log('page opened')
    clientSentat.current=Date.now()
    socket.emit('start_timer_request');
  
  },[]);

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
        start_timer(data.duration-time_elapsed);
      }
    });
  },[socket])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    onSendMessage(message.trim());
    setMessage('');
  };

  const handlefakeresp=(question:string,answer:string)=>{
      socket.emit("handle_fake_answer",question,answer);
      setWitnessLog(prev => [...prev, { id: `${Date.now()}`, question, answer }]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const catcherCount = users.filter(u => u.role === 'catcher').length;
  const normalCount = users.filter(u => u.role === 'normal').length;

  // Function to handle power-up clicks
  const handlePowerUpClick = (powerUp: keyof typeof powerUps) => {
    setPowerUps(prev => {
      if (prev[powerUp] > 0) {
        return {
          ...prev,
          [powerUp]: prev[powerUp] - 1
        };
      }
      return prev;
    });
  };

  const handleAiResponseUse = () => {
    setAiResponseUses(prev => Math.max(0, prev - 1));
  };

  const handleSubmitAnswer = (answer: string) => {
    socket.emit('submit_answer', answer, user.username);
    setHasSubmittedAnswer(true);
    setShowSubmitAnswer(false);
  };

  // Add Answer Result Popup Component
  const AnswerResultPopup: React.FC<{ onClose: () => void; result: { isCorrect: boolean; message: string } }> = ({
    onClose,
    result
  }) => {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-slate-800 rounded-2xl border border-red-400/50 shadow-lg shadow-red-500/20 w-full max-w-md mx-4 animate-scale-in">
          <div className="p-6 border-b border-red-400/20">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center space-x-3">
                <Target className="w-8 h-8 text-red-400" />
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
              className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Clues Popup Component
  const CluesPopup: React.FC<{ onClose: () => void; clues: string[] }> = ({ onClose, clues }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-slate-800 rounded-2xl border border-red-400/50 shadow-lg shadow-red-500/20 w-full max-w-md mx-4 animate-scale-in">
        <div className="p-6 border-b border-red-400/20 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center space-x-3">
            <span>Clues</span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-4">
          {clues.length === 0 ? (
            <div className="text-gray-300">No clues available.</div>
          ) : (
            clues.map((clue, idx) => (
              <div key={idx} className="text-white text-lg">
                <span className="text-red-400 font-semibold">Clue {idx + 1}:</span> {clue}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-black p-3 relative overflow-hidden">
      {/* Dynamic background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-red-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/3 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Game Header */}
        <div className="text-center mb-6 animate-fade-in">
          <div className="inline-flex items-center space-x-6 bg-white/10 backdrop-blur-lg rounded-2xl px-8 py-3 border border-white/20">
            <div className="flex items-center space-x-2">
              <Timer className="w-5 h-5 text-red-400" />
              <span className="text-xl font-bold text-white">{formatTime(gameTime)}</span>
            </div>
            <div className="h-5 w-px bg-white/20"></div>
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <span>Case ID: {roomId}</span>
            </div>
            <button
              className="ml-4 px-3 py-1 bg-red-500/20 rounded-full border border-red-400/30 flex items-center space-x-2 text-red-300 hover:bg-red-500/40 transition-all duration-200"
              onClick={() => setShowInstructions(true)}
            >
              <Info className="w-4 h-4" />
              <span>Instructions</span>
            </button>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* Case File */}
          <div className="lg:col-span-1 h-[calc(100vh-14rem)]">
            <div className="bg-red-50/95 text-slate-800 rounded-2xl border-2 border-red-700 shadow-[0_10px_40px_rgba(239,68,68,0.15)] h-full flex flex-col">
              <div className="p-5 border-b-2 border-red-700 flex items-center justify-between rounded-t-2xl bg-red-100/70">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-red-700" />
                  Case File
                </h2>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="bg-red-100/70 border border-red-700/40 rounded-xl p-4 font-serif shadow-inner">
                  <div className="text-sm uppercase tracking-wide text-red-700 mb-1">Case Brief</div>
                  <div className="text-slate-900 text-lg">{question}</div>
                </div>
                <div className="space-y-3">
                  {clues.map((clue, idx) => (
                    <div key={idx} className="bg-red-100/70 border border-red-700/40 rounded-xl p-4 font-serif shadow-inner">
                      <div className="text-sm uppercase tracking-wide text-red-700 mb-1">Document {idx + 1}</div>
                      <div className="text-slate-900 text-base">{clue}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-red-700/40">
                  <div className="text-xs uppercase tracking-wide text-red-700 mb-2">Secret message to you, don't share</div>
                  <div className="bg-red-100/70 border border-red-700/40 rounded-xl p-4 font-serif shadow-inner">
                    <div className="text-slate-900 text-base">{answer}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deception Desk */}
          <div className="lg:col-span-1 bg-white/10 backdrop-blur-lg rounded-2xl border border-red-400/50 shadow-lg shadow-red-500/20 animate-slide-left h-[calc(100vh-16rem)] flex flex-col">
            <div className="p-4 border-b border-red-400/20">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <Brain className="w-6 h-6 text-red-400" />
                  <span>Deception Desk</span>
                </h2>
                <div className="px-2 py-1 bg-red-500/20 rounded-full border border-red-400/30">
                  <span className="text-red-400 font-semibold">{aiResponseUses} uses remaining</span>
                </div>
              </div>
            </div>

            <div className="flex-1 p-4 space-y-3 overflow-y-auto">
              <p className="text-gray-300 text-sm">
                Craft fake witness responses to mislead detectives.
              </p>
              <button
                onClick={() => setShowAIChat(true)}
                disabled={aiResponseUses <= 0}
                className={`w-full py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3 shadow-lg shadow-red-500/20 ${
                  aiResponseUses <= 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Brain className="w-6 h-6" />
                <span>{aiResponseUses <= 0 ? 'No Uses Remaining' : 'Create Fake Response'}</span>
              </button>

              <button
                onClick={() => setShowSubmitAnswer(true)}
                disabled={hasSubmittedAnswer}
                className={`w-full py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3 shadow-lg shadow-red-500/20 ${
                  hasSubmittedAnswer ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Target className="w-6 h-6" />
                <span>{hasSubmittedAnswer ? 'Answer Submitted' : 'Submit Answer'}</span>
              </button>

              {/* Fake Witness Log */}
              <div className="mt-2 bg-white/5 border border-white/10 rounded-xl p-3">
                <div className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-400" /> Fake Witness Log
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {witnessLog.length === 0 ? (
                    <div className="text-gray-400 text-sm">No fake entries yet.</div>
                  ) : (
                    witnessLog.map((entry) => (
                      <div key={entry.id} className="space-y-1">
                        <div className="flex items-start gap-2">
                          <div className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center text-xs shrink-0">
                            <Target className="w-4 h-4" />
                          </div>
                          <div className="bg-red-500/20 border border-red-400/30 text-white rounded-xl px-3 py-2 text-sm max-w-[80%]">
                            {entry.question}
                          </div>
                        </div>
                        <div className="flex items-start gap-2 justify-end">
                          <div className="bg-red-100/80 border border-red-400/50 text-slate-900 rounded-xl px-3 py-2 text-sm max-w-[80%]">
                            {entry.answer}
                          </div>
                          <div className="w-6 h-6 rounded-full bg-red-200 text-red-800 flex items-center justify-center text-xs shrink-0">
                            <Eye className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Power-ups Section */}
              <div className="mt-4 space-y-3">
                <h3 className="text-lg font-semibold text-red-400">Power-ups</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <button 
                      onClick={() => handlePowerUpClick('track')}
                      disabled={powerUps.track === 0}
                      className={`w-full p-3 bg-red-500/20 border-2 border-red-400/50 rounded-xl hover:bg-red-500/30 transition-all duration-300 hover:scale-105 shadow-lg shadow-red-500/20 backdrop-blur-lg group ${
                        powerUps.track === 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <Target className="w-6 h-6 text-red-400 group-hover:scale-110 transition-transform" />
                        <span className="text-sm text-red-400 mt-1">Track</span>
                      </div>
                    </button>
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                      {powerUps.track}
                    </div>
                  </div>

                  <div className="relative">
                    <button 
                      onClick={() => handlePowerUpClick('scan')}
                      disabled={powerUps.scan === 0}
                      className={`w-full p-3 bg-red-500/20 border-2 border-red-400/50 rounded-xl hover:bg-red-500/30 transition-all duration-300 hover:scale-105 shadow-lg shadow-red-500/20 backdrop-blur-lg group ${
                        powerUps.scan === 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <Eye className="w-6 h-6 text-red-400 group-hover:scale-110 transition-transform" />
                        <span className="text-sm text-red-400 mt-1">Scan</span>
                      </div>
                    </button>
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                      {powerUps.scan}
                    </div>
                  </div>

                  <div className="relative">
                    <button 
                      onClick={() => handlePowerUpClick('shield')}
                      disabled={powerUps.shield === 0}
                      className={`w-full p-3 bg-red-500/20 border-2 border-red-400/50 rounded-xl hover:bg-red-500/30 transition-all duration-300 hover:scale-105 shadow-lg shadow-red-500/20 backdrop-blur-lg group ${
                        powerUps.shield === 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <Shield className="w-6 h-6 text-red-400 group-hover:scale-110 transition-transform" />
                        <span className="text-sm text-red-400 mt-1">Shield</span>
                      </div>
                    </button>
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                      {powerUps.shield}
                    </div>
                  </div>

                  <div className="relative">
                    <button 
                      onClick={() => handlePowerUpClick('slow')}
                      disabled={powerUps.slow === 0}
                      className={`w-full p-3 bg-red-500/20 border-2 border-red-400/50 rounded-xl hover:bg-red-500/30 transition-all duration-300 hover:scale-105 shadow-lg shadow-red-500/20 backdrop-blur-lg group ${
                        powerUps.slow === 0 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center">
                        <Timer className="w-6 h-6 text-red-400 group-hover:scale-110 transition-transform" />
                        <span className="text-sm text-red-400 mt-1">Slow</span>
                      </div>
                    </button>
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white">
                      {powerUps.slow}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chat Panel */}
      <div className="fixed bottom-4 right-4 z-20 w-80 sm:w-96 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl flex flex-col">
        <div className="p-3 border-b border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-red-400" />
            <span className="text-sm font-semibold text-white">Case Chat</span>
          </div>
          <button onClick={() => setIsChatCollapsed(v => !v)} className="text-red-300 hover:text-red-200">
            <ChevronDown className={`w-4 h-4 transition-transform ${isChatCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {!isChatCollapsed && (
        <div className="flex-1 p-3 overflow-y-auto max-h-64 space-y-3">
          {chatMessages.length === 0 ? (
            <div className="text-center text-gray-400 py-4">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Share your plans…</p>
            </div>
          ) : (
            chatMessages.map((msg) => {
              const msgUser = users.find(u => u.username === msg.username);
              return (
                <div
                  key={msg.id}
                  className={`p-2 rounded-xl max-w-[75%] ${
                    msg.username === user.username
                      ? 'bg-red-500/20 border border-red-400/30 ml-auto'
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
        )}
        {!isChatCollapsed && (
        <div className="p-3 border-t border-white/20">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-red-400 focus:ring-2 focus:ring-red-400/20 transition-all duration-300"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-600 text-white rounded-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 shadow-lg shadow-red-500/25"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
        )}
      </div>

      {/* Floating Players Panel */}
      <div className="fixed bottom-4 left-4 z-20 w-72 sm:w-80 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 shadow-xl flex flex-col">
        <div className="p-3 border-b border-white/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-red-400" />
            <span className="text-sm font-semibold text-white">Players</span>
          </div>
          <button onClick={() => setIsPlayersCollapsed(v => !v)} className="text-red-300 hover:text-red-200">
            <ChevronDown className={`w-4 h-4 transition-transform ${isPlayersCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {!isPlayersCollapsed && (
        <div className="flex-1 p-3 overflow-y-auto max-h-56 space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className={`p-2 rounded-xl border text-sm flex items-center justify-between ${
                u.role === 'catcher'
                  ? 'bg-red-500/10 border-red-400/30'
                  : (u.id === user.id
                    ? 'bg-red-500/20 border-red-400/30'
                    : 'bg-white/10 border-white/10')
              }`}
            >
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold ${u.role === 'catcher' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>{u.username.charAt(0).toUpperCase()}</div>
                <div className="flex flex-col leading-tight">
                  <span className="text-white text-[13px]">{u.username} {u.id === user.id && <span className="text-red-300 text-[10px]">(you)</span>}</span>
                  <span className={`text-[10px] ${u.role === 'catcher' ? 'text-red-400' : 'text-amber-300'}`}>{u.role === 'catcher' ? 'Catcher' : 'Detective'}</span>
                </div>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
          ))}
        </div>
        )}
        {!isPlayersCollapsed && (
        <div className="p-3 border-t border-white/20">
          <button
            onClick={onLeaveGame}
            className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-xl text-sm font-semibold transition-all duration-300"
          >
            Leave Case
          </button>
        </div>
        )}
      </div>

      {/* Popups */}
      {showAIChat && (
        <AIChatPopup 
          onClose={() => setShowAIChat(false)} 
          onUse={handleAiResponseUse}
          remainingUses={aiResponseUses}
          handle_fake_answer={handlefakeresp}
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
              <h2 className="text-xl font-bold text-red-300 flex items-center space-x-2">
                <Info className="w-5 h-5" />
                <span>Game Instructions</span>
              </h2>
              <button onClick={() => setShowInstructions(false)} className="text-gray-400 hover:text-white transition-colors text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4 text-white text-lg">
              <p><span className="text-red-400 font-semibold">Goal:</span> Stop them from guessing the answer!</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>You are a Catcher (impostor) trying to deceive the Survivors.</li>
                <li>You can never reveal your identity as the Catcher.</li>
                <li>You must create confusion and mislead the Survivors.</li>
                <li>You can create Fake AI responses to mislead Survivors.</li>
                <li>Use chat and power-ups to cause confusion</li>
                <li>Remember, Chaos is your biggest ally!</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CatcherGame;