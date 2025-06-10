import React, { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import CountdownTimer from "./CounterdownTimer";
import Chat from "./Chat";

interface GameProps{
    socket:Socket|null;
}

const Popup: React.FC<{ onClose: () => void; role: string }> = ({ onClose, role }) => {
    const [timeLeft, setTimeLeft] = useState(10);
    const isCatcher = role === 'Catcher';

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
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onClose();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [onClose]);

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: currentTheme.gradient,
            padding: '0rem 5rem 2rem 5rem',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'center',
            animation: 'pulse 2s infinite',
        }}>
            <style>
                {`
                    @keyframes pulse {
                        0% { box-shadow: 0 0 30px ${currentTheme.shadow}; }
                        50% { box-shadow: 0 0 50px ${currentTheme.shadow}; }
                        100% { box-shadow: 0 0 30px ${currentTheme.shadow}; }
                    }
                    @keyframes float {
                        0% { transform: translateY(0px); }
                        50% { transform: translateY(-10px); }
                        100% { transform: translateY(0px); }
                    }
                `}
            </style>

            <div style={{
                position: 'relative',
                marginBottom: '2rem',
                animation: 'float 3s ease-in-out infinite'
            }}>
                <h2 style={{ 
                    marginBottom: '1rem', 
                    color: '#fff',
                    fontSize: '4.5rem',
                    fontWeight: 'bold',
                    textShadow: `0 0 10px ${currentTheme.glow}`,
                    letterSpacing: '2px'
                }}>{role.toUpperCase()}</h2>
                <div style={{
                    position: 'absolute',
                    bottom: '-10px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '80%',
                    height: '4px',
                    background: `linear-gradient(90deg, transparent, ${currentTheme.accent}, transparent)`,
                    borderRadius: '2px'
                }} />
            </div>

            <div style={{
                backgroundColor: `rgba(${isCatcher ? '255, 59, 59' : '0, 123, 255'}, 0.1)`,
                padding: '2rem 6rem',
                borderRadius: '20px',
                border: `1px solid ${currentTheme.accent}`,
                width: '80%',
                maxWidth: '1200px',
                marginBottom: '2rem'
            }}>
                <p style={{ 
                    fontSize: '2.2rem', 
                    color: '#fff',
                    fontWeight: 'bold',
                    textShadow: `0 0 10px ${currentTheme.glow}`,
                    marginBottom: '3rem',
                    lineHeight: '1.6'
                }}>
                    {isCatcher 
                        ? "You have been chosen as the Catcher. Your mission is to eliminate the Normal players before they can complete their objectives."
                        : "You have been assigned the role of a Normal player. Your mission is to survive and help your team win."}
                </p>
                <p style={{ 
                    fontSize: '2.2rem', 
                    color: '#fff',
                    fontWeight: 'bold',
                    textShadow: `0 0 10px ${currentTheme.glow}`,
                    marginBottom: '2rem',
                    lineHeight: '1.6'
                }}>
                    {isCatcher
                        ? "Use your abilities wisely and strike when the time is right. Blend in with the Normal players to avoid detection."
                        : "Stay alert and work together with your teammates to identify and eliminate any threats."}
                </p>
                <p style={{ 
                    fontSize: '2.2rem', 
                    color: '#fff',
                    fontWeight: 'bold',
                    textShadow: `0 0 10px ${currentTheme.glow}`,
                    lineHeight: '1.6'
                }}>
                    {isCatcher
                        ? "Remember, your success depends on your ability to deceive and eliminate without being caught."
                        : "Remember, trust no one completely and always verify your suspicions."}
                </p>
            </div>

            <div style={{
                width: '60%',
                maxWidth: '800px',
                backgroundColor: `rgba(${isCatcher ? '255, 59, 59' : '0, 123, 255'}, 0.15)`,
                padding: '0.8rem 1.5rem',
                borderRadius: '12px',
                border: `2px solid ${currentTheme.accent}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: `0 0 20px ${currentTheme.shadow}`
            }}>
                <p style={{ 
                    fontSize: '1.4rem', 
                    color: '#fff',
                    fontWeight: 'bold',
                    textShadow: `0 0 10px ${currentTheme.glow}`
                }}>Time Remaining</p>
                <p style={{ 
                    fontSize: '2rem', 
                    color: currentTheme.accent,
                    fontWeight: 'bold',
                    textShadow: `0 0 20px ${currentTheme.glow}`,
                    fontFamily: 'monospace'
                }}>{timeLeft}</p>
            </div>
        </div>
    );
};

const Game:React.FC<GameProps>=({socket})=>{
    const [countdownDone,setCountdownDone]=useState(false);
    const [userrole,setUserrole]=useState<String|null>(null);
    const [showPopup, setShowPopup] = useState(false);

    useEffect(()=>{
        if(!socket) return;
        if(socket?.connected){
            socket?.emit("testing","hello")
        } else {
            console.log("socket not connected")
        }

        if(countdownDone){
            socket?.emit('assign_roles')
        }

        socket?.on("role_recieve",(role_recieved)=>{
            setUserrole(role_recieved);
            if (role_recieved === 'Normal' || role_recieved === 'Catcher') {
                setShowPopup(true);
            }
        });

        return () => {
            socket?.off("role_recieve");
        };
    },[socket,countdownDone]);

    return (
        <div>
            {!countdownDone ? (
                <CountdownTimer start={3} onComplete={()=>setCountdownDone(true)}/>
            ) : (
                <>
                    <div>Done</div>
                    <div>{userrole}</div>
                    {showPopup && (userrole === 'Normal' || userrole === 'Catcher') && (
                        <Popup onClose={() => setShowPopup(false)} role={userrole as string} />
                    )}
                    {userrole && (
                        <Chat socket={socket} userRole={userrole as string} />
                    )}
                </>
            )}
        </div>
    );
}

export default Game;
