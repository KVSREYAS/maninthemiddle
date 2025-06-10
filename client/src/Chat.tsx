import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'socket.io-client';

interface ChatProps {
    socket: Socket | null;
    userRole: string;
}

interface Message {
    id: string;
    text: string;
    sender: string;
    timestamp: number;
}

const Chat: React.FC<ChatProps> = ({ socket, userRole }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isCatcher = userRole === 'Catcher';

    const theme = {
        normal: {
            gradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            accent: '#007bff',
            glow: 'rgba(0, 123, 255, 0.8)',
            shadow: 'rgba(0, 123, 255, 0.3)'
        },
        catcher: {
            gradient: 'linear-gradient(135deg, #2e1a1a 0%, #3e1616 100%)',
            accent: '#ff3b3b',
            glow: 'rgba(255, 59, 59, 0.8)',
            shadow: 'rgba(255, 59, 59, 0.3)'
        }
    };

    const currentTheme = isCatcher ? theme.catcher : theme.normal;

    useEffect(() => {
        if (!socket) return;

        socket.on('chat_message', (message: Message) => {
            setMessages(prev => [...prev, message]);
        });

        return () => {
            socket.off('chat_message');
        };
    }, [socket]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket) return;

        const message: Message = {
            id: Date.now().toString(),
            text: newMessage,
            sender: userRole,
            timestamp: Date.now()
        };

        socket.emit('chat_message', message);
        setNewMessage('');
    };

    return (
        <div style={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            width: '400px',
            height: '600px',
            background: currentTheme.gradient,
            borderRadius: '20px',
            boxShadow: `0 0 30px ${currentTheme.shadow}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            border: `2px solid ${currentTheme.accent}`,
            animation: 'pulse 2s infinite'
        }}>
            <style>
                {`
                    @keyframes pulse {
                        0% { box-shadow: 0 0 30px ${currentTheme.shadow}; }
                        50% { box-shadow: 0 0 50px ${currentTheme.shadow}; }
                        100% { box-shadow: 0 0 30px ${currentTheme.shadow}; }
                    }
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                `}
            </style>

            <div style={{
                padding: '1rem',
                background: `rgba(${isCatcher ? '255, 59, 59' : '0, 123, 255'}, 0.2)`,
                borderBottom: `1px solid ${currentTheme.accent}`,
                textAlign: 'center'
            }}>
                <h3 style={{
                    color: '#fff',
                    margin: 0,
                    fontSize: '1.2rem',
                    fontWeight: 'bold',
                    textShadow: `0 0 10px ${currentTheme.glow}`
                }}>
                    Game Chat
                </h3>
            </div>

            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                {messages.map((message) => (
                    <div
                        key={message.id}
                        style={{
                            alignSelf: message.sender === userRole ? 'flex-end' : 'flex-start',
                            maxWidth: '80%',
                            animation: 'slideIn 0.3s ease-out'
                        }}
                    >
                        <div style={{
                            background: message.sender === userRole 
                                ? currentTheme.accent 
                                : `rgba(${isCatcher ? '255, 59, 59' : '0, 123, 255'}, 0.2)`,
                            padding: '0.8rem 1rem',
                            borderRadius: '15px',
                            color: '#fff',
                            boxShadow: `0 0 10px ${currentTheme.shadow}`
                        }}>
                            <div style={{
                                fontSize: '0.8rem',
                                marginBottom: '0.3rem',
                                opacity: 0.8
                            }}>
                                {message.sender}
                            </div>
                            <div style={{ fontSize: '1rem' }}>
                                {message.text}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={{
                padding: '1rem',
                background: `rgba(${isCatcher ? '255, 59, 59' : '0, 123, 255'}, 0.1)`,
                borderTop: `1px solid ${currentTheme.accent}`,
                display: 'flex',
                gap: '0.5rem'
            }}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    style={{
                        flex: 1,
                        padding: '0.8rem',
                        borderRadius: '10px',
                        border: `1px solid ${currentTheme.accent}`,
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: '#fff',
                        fontSize: '1rem',
                        outline: 'none'
                    }}
                />
                <button
                    type="submit"
                    style={{
                        padding: '0.8rem 1.5rem',
                        borderRadius: '10px',
                        border: 'none',
                        background: currentTheme.accent,
                        color: '#fff',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        boxShadow: `0 0 10px ${currentTheme.shadow}`,
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default Chat; 