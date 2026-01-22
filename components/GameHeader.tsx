
import React from 'react';

interface GameHeaderProps {
  score: number;
  level: number;
  timer: number;
  targetScore: number;
}

const GameHeader: React.FC<GameHeaderProps> = ({ score, level, timer, targetScore }) => {
  const timerPercentage = (timer / 90) * 100;
  const progressPercentage = Math.min((score / targetScore) * 100, 100);

  return (
    <div className="w-full max-w-md mx-auto mb-8 flex flex-col gap-4">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-500">Level</h2>
          <p className="text-4xl font-black text-indigo-900 font-fredoka">{level}</p>
        </div>
        <div className="text-center">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-500">Timer</h2>
          <div className="relative w-16 h-16 flex items-center justify-center">
             <svg className="absolute w-full h-full -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  strokeDasharray={175}
                  strokeDashoffset={175 - (175 * timerPercentage) / 100}
                  className={`${timer < 15 ? 'text-red-500' : 'text-indigo-600'} transition-all duration-1000 ease-linear`}
                />
             </svg>
             <span className={`text-xl font-bold ${timer < 15 ? 'text-red-600' : 'text-indigo-900'}`}>{timer}</span>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-500">Score</h2>
          <p className="text-4xl font-black text-indigo-900 font-fredoka">{score}</p>
        </div>
      </div>

      <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden shadow-inner">
        <div 
          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <p className="text-center text-xs text-gray-500 font-medium">Target: {targetScore}</p>
    </div>
  );
};

export default GameHeader;
