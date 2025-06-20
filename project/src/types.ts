import { Socket } from 'socket.io-client';

export interface User {
  id: string;
  username: string;
  isReady: boolean;
  role?: 'catcher' | 'normal';
}

export interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
}

export interface GameRoom {
  id: string;
  users: User[];
  chatMessages: ChatMessage[];
  gameStarted: boolean;
}

export type GamePage = 'signin' | 'lobby' | 'game';

export interface GameProps {
  user: User;
  roomId: string;
  users: User[];
  chatMessages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onLeaveGame: () => void;
  question: string;
  clues: string[];
  socket: typeof Socket;
  gameOverData: { winner: string; correct_answer: string } | null;
}

export interface CatcherGameProps {
  user: User;
  roomId: string;
  users: User[];
  chatMessages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onLeaveGame: () => void;
  question: string;
  clues: string[];
  answer: string;
  socket: typeof Socket;
  gameOverData: { winner: string; correct_answer: string } | null;
}