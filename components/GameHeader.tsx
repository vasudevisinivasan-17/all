
import React from 'react';
import { Theme } from '../types';

interface GameHeaderProps {
  score: number;
  level: number;
  timer: number;
  targetScore: number;
  theme: Theme;
}

const GameHeader: React.FC<GameHeaderProps> = ({ score, level, timer, targetScore, theme }) => {
  const timerPercentage = (timer / 90) * 100;
  const progressPercentage = Math.min((score / targetScore) * 100, 100);

  return (
    <div className="w-full max-w-md mx-auto mb-8 flex flex-col gap-4 relative z-10">
      <div className="flex justify-between items-end">
        <div>
          <h2 className={`text-[10px] font-black uppercase tracking-widest opacity-60 ${theme.accentText}`}>Level</h2>
          <p className={`text-4xl font-black ${theme.accentText} ${theme.fontFamily}`}>{level}</p>
        </div>
        <div className="text-center">
          <h2 className={`text-[10px] font-black uppercase tracking-widest opacity-60 ${theme.accentText}`}>Timer</h2>
          <div className="relative w-16 h-16 flex items-center justify-center mt-1">
             <svg className="absolute w-full h-full -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="6"
                  fill="transparent"
                  className="text-black/10"
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
                  className={`${timer < 15 ? 'text-red-500' : theme.timerColor} transition-all duration-1000 ease-linear`}
                />
             </svg>
             <span className={`text-xl font-bold ${timer < 15 ? 'text-red-600' : theme.accentText}`}>{timer}</span>
          </div>
        </div>
        <div className="text-right">
          <h2 className={`text-[10px] font-black uppercase tracking-widest opacity-60 ${theme.accentText}`}>Score</h2>
          <p className={`text-4xl font-black ${theme.accentText} ${theme.fontFamily}`}>{score}</p>
        </div>
      </div>

      <div className="w-full bg-black/5 h-2 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${theme.primaryBtn.split(' ')[0]}`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
      <p className={`text-center text-[10px] font-bold uppercase tracking-widest opacity-40 ${theme.accentText}`}>Target: {targetScore}</p>
    </div>
  );
};

export default GameHeader;
