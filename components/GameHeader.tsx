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
  const maxInitialTime = 90; // Approx baseline for visual reference
  const timerPercentage = Math.min((timer / maxInitialTime) * 100, 100);
  const progressPercentage = Math.min((score / targetScore) * 100, 100);

  return (
    <div className="w-full max-w-md mx-auto mb-8 flex flex-col gap-4 relative z-10">
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-50 ${theme.accentText}`}>Stage</h2>
          <p className={`text-5xl font-black ${theme.accentText} ${theme.fontFamily} -mt-1 tracking-tighter`}>{level}</p>
        </div>
        
        <div className="text-center">
          <div className="relative w-20 h-20 flex items-center justify-center">
             <svg className="absolute w-full h-full -rotate-90 drop-shadow-sm">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-black/5"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="transparent"
                  strokeDasharray={213}
                  strokeDashoffset={213 - (213 * timerPercentage) / 100}
                  className={`${timer < 15 ? 'text-red-500' : theme.timerColor} transition-all duration-1000 ease-linear`}
                />
             </svg>
             <div className="flex flex-col items-center">
               <span className={`text-2xl font-black ${timer < 15 ? 'text-red-600 animate-pulse' : theme.accentText}`}>{timer}</span>
               <span className="text-[8px] font-bold uppercase tracking-widest opacity-40 -mt-1">Sec</span>
             </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-50 ${theme.accentText}`}>Score</h2>
          <p className={`text-5xl font-black ${theme.accentText} ${theme.fontFamily} -mt-1 tracking-tighter`}>{score}</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 mt-2">
        <div className="w-full bg-black/5 h-3 rounded-full overflow-hidden p-0.5 border border-black/5">
          <div 
            className={`h-full transition-all duration-700 ease-out rounded-full shadow-sm ${theme.primaryBtn.split(' ')[0]}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between px-1">
          <span className={`text-[9px] font-black uppercase tracking-widest opacity-30 ${theme.accentText}`}>Level Progress</span>
          <span className={`text-[9px] font-black uppercase tracking-widest opacity-50 ${theme.accentText}`}>Target: {targetScore}</span>
        </div>
      </div>
    </div>
  );
};

export default GameHeader;