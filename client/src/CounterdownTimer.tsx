import React, { useEffect, useState } from "react";

interface CountdownTimerProps {
  start: number;             // optional start value, e.g. 3
  onComplete: () => void;    // callback when countdown finishes
}
const CountdownTimer: React.FC<CountdownTimerProps> = ({start=3,onComplete}) => {
  const [counter, setCounter] = useState(start); // start from 3

  useEffect(() => {
    if (counter === 0) {
        onComplete();
        return;
    }; // stop when it reaches 0

    const timer = setTimeout(() => {
      setCounter((prev) => prev - 1);
    }, 1000); // decrease every 1 second

    return () => clearTimeout(timer); // cleanup on unmount
  }, [counter,onComplete]);

  return (
    <div>
      <h1>{counter > 0 ? `Starting in ${counter}...` : "Go!"}</h1>
    </div>
  );
};

export default CountdownTimer;
