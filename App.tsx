
import React, { useState, useEffect, useCallback } from 'react';
import { GameState } from './types';
import { getRandomLetter, LETTER_SCORES, getLevelConfig, GRID_SIZE_INITIAL } from './constants';
import WordGrid from './components/WordGrid';
import GameHeader from './components/GameHeader';
import { getHintFromGemini, checkWordWithGemini } from './services/geminiService';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState & { minWordsRequired: number }>({
    score: 0,
    level: 1,
    timer: 90,
    isGameOver: false,
    isLevelComplete: false,
    isPaused: false,
    targetScore: 150,
    foundWords: [],
    minWordsRequired: 3,
  });

  const [gridSize, setGridSize] = useState(GRID_SIZE_INITIAL);
  const [minWordLength, setMinWordLength] = useState(3);
  const [grid, setGrid] = useState<string[][]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [currentWord, setCurrentWord] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  // Initialize Level
  const initLevel = useCallback((level: number) => {
    const config = getLevelConfig(level);
    setGridSize(config.size);
    setMinWordLength(config.minWordLength);
    
    const newGrid: string[][] = [];
    for (let r = 0; r < config.size; r++) {
      const row = [];
      for (let c = 0; c < config.size; c++) {
        row.push(getRandomLetter(level));
      }
      newGrid.push(row);
    }
    
    setGrid(newGrid);
    setGameState(prev => ({
      ...prev,
      level,
      timer: config.timer,
      isLevelComplete: false,
      isGameOver: false,
      isPaused: false,
      targetScore: config.targetScore,
      minWordsRequired: config.minWordsRequired,
      foundWords: []
    }));
    setSelectedIndices([]);
    setCurrentWord("");
    setHint(null);
    setMsg(`LEVEL ${level} START!`);
    setTimeout(() => setMsg(""), 2000);
  }, []);

  useEffect(() => {
    initLevel(1);
  }, [initLevel]);

  // Timer Effect
  useEffect(() => {
    if (gameState.isGameOver || gameState.isLevelComplete || gameState.isPaused) return;

    const interval = setInterval(() => {
      setGameState(prev => {
        if (prev.timer <= 1) {
          clearInterval(interval);
          return { ...prev, timer: 0, isGameOver: true };
        }
        return { ...prev, timer: prev.timer - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState.isGameOver, gameState.isLevelComplete, gameState.isPaused]);

  const calculateWordScore = useCallback((word: string) => {
    let score = 0;
    for (const char of word) {
      score += LETTER_SCORES[char] || 0;
    }
    const lengthBonus = word.length > 4 ? word.length * 20 : 0;
    return (score + lengthBonus) * gameState.level;
  }, [gameState.level]);

  // Submission Logic
  const submitWord = async () => {
    if (gameState.isPaused) return;
    
    if (currentWord.length < minWordLength) {
      setMsg(`Min ${minWordLength} letters!`);
      setTimeout(() => setMsg(""), 1000);
      return;
    }

    if (gameState.foundWords.includes(currentWord)) {
      setMsg("Already found!");
      setTimeout(() => setMsg(""), 1000);
      setSelectedIndices([]);
      setCurrentWord("");
      return;
    }

    setIsAiLoading(true);
    const isValid = await checkWordWithGemini(currentWord);
    setIsAiLoading(false);

    if (isValid) {
      const points = calculateWordScore(currentWord);
      setGameState(prev => {
        const newScore = prev.score + points;
        const newFoundWords = [...prev.foundWords, currentWord];
        const complete = newScore >= prev.targetScore && newFoundWords.length >= prev.minWordsRequired;
        
        return {
          ...prev,
          score: newScore,
          foundWords: newFoundWords,
          isLevelComplete: complete
        };
      });
      setMsg(`+${points} Pts!`);
    } else {
      setMsg("Not a word!");
      setGameState(prev => ({ ...prev, score: Math.max(0, prev.score - 5) }));
    }
    
    setSelectedIndices([]);
    setCurrentWord("");
    setTimeout(() => setMsg(""), 1200);
  };

  // Handle Letter Click
  const onLetterClick = (index: number, row: number, col: number) => {
    if (gameState.isGameOver || gameState.isLevelComplete || isAiLoading || gameState.isPaused) return;

    if (selectedIndices.length > 0 && selectedIndices[selectedIndices.length - 1] === index) {
      setSelectedIndices(prev => prev.slice(0, -1));
      setCurrentWord(prev => prev.slice(0, -1));
      return;
    }

    if (selectedIndices.includes(index)) {
      setMsg("Cell used!");
      setTimeout(() => setMsg(""), 800);
      return;
    }

    setSelectedIndices(prev => [...prev, index]);
    setCurrentWord(prev => prev + grid[row][col]);
  };

  const getHint = async () => {
    if (gameState.isPaused) return;
    
    const hintCost = 20 + (gameState.level * 10);
    if (gameState.score < hintCost) {
      setMsg(`Need ${hintCost} pts!`);
      setTimeout(() => setMsg(""), 1500);
      return;
    }
    
    setIsAiLoading(true);
    const aiHint = await getHintFromGemini(grid);
    setIsAiLoading(false);

    if (aiHint && aiHint !== "HINT_ERROR") {
      setHint(aiHint);
      setGameState(prev => ({ ...prev, score: prev.score - hintCost }));
    } else {
      setMsg("No words found!");
    }
    setTimeout(() => setMsg(""), 2000);
  };

  const clearSelection = () => {
    if (gameState.isPaused) return;
    setSelectedIndices([]);
    setCurrentWord("");
  };

  const togglePause = () => {
    if (gameState.isGameOver || gameState.isLevelComplete) return;
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white p-6 md:p-8 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative overflow-hidden border-t-8 border-indigo-500">
        
        {/* Aesthetic Gradients */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100 rounded-full blur-[100px] opacity-40 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-100 rounded-full blur-[100px] opacity-40 translate-y-1/2 -translate-x-1/2" />

        <div className="relative z-20 mb-4 flex justify-center">
            <button 
                onClick={togglePause}
                className="group flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-indigo-100 text-slate-600 hover:text-indigo-600 rounded-full transition-all duration-300 font-bold text-[10px] uppercase tracking-widest border border-slate-200 hover:border-indigo-200"
            >
                {gameState.isPaused ? (
                    <><span className="text-sm">▶</span> Resume Game</>
                ) : (
                    <><span className="text-sm">⏸</span> Pause Timer</>
                )}
            </button>
        </div>

        <GameHeader 
          score={gameState.score} 
          level={gameState.level} 
          timer={gameState.timer} 
          targetScore={gameState.targetScore}
        />

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6 px-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stage Goal</span>
              <span className={`text-xs font-bold transition-colors ${gameState.foundWords.length >= gameState.minWordsRequired ? 'text-green-500' : 'text-slate-600'}`}>
                {gameState.foundWords.length} / {gameState.minWordsRequired} Words
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full uppercase">
                 Grid: {gridSize}x{gridSize}
              </span>
              <span className="text-[10px] font-bold text-purple-500 bg-purple-50 px-3 py-1 rounded-full uppercase">
                 Min: {minWordLength}
              </span>
            </div>
          </div>

          <WordGrid 
            grid={grid} 
            selectedIndices={selectedIndices} 
            onLetterClick={onLetterClick} 
            size={gridSize}
          />

          <div className="mt-8 flex flex-col items-center gap-6">
            <div className="h-16 flex flex-col items-center justify-center">
               <span className={`text-4xl font-black tracking-[0.2em] font-fredoka uppercase transition-all duration-300 ${isAiLoading ? 'opacity-40 scale-95' : 'text-indigo-600 scale-110'}`}>
                  {currentWord || "Find Words"}
               </span>
               {isAiLoading && (
                 <span className="text-[10px] font-black text-purple-500 uppercase tracking-[0.3em] animate-bounce mt-2">
                   Verifying...
                 </span>
               )}
            </div>

            <div className="flex gap-4 w-full max-w-sm">
              <button 
                onClick={clearSelection}
                className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-[1.5rem] font-bold hover:bg-slate-200 transition-all active:scale-95 shadow-sm border-b-4 border-slate-300"
              >
                Reset
              </button>
              <button 
                onClick={submitWord}
                disabled={isAiLoading || currentWord.length < minWordLength || gameState.isPaused}
                className={`flex-[2] py-4 rounded-[1.5rem] font-black text-white shadow-xl transition-all active:scale-95 border-b-4 ${
                  isAiLoading || currentWord.length < minWordLength || gameState.isPaused
                    ? 'bg-slate-200 border-slate-300 cursor-not-allowed text-slate-400' 
                    : 'bg-indigo-600 border-indigo-800 hover:bg-indigo-700 hover:-translate-y-0.5'
                }`}
              >
                {isAiLoading ? 'CHECKING...' : 'SUBMIT WORD'}
              </button>
            </div>

            <div className="flex flex-col items-center gap-3">
              <button 
                onClick={getHint}
                disabled={isAiLoading || gameState.isPaused}
                className="group flex items-center gap-2 text-xs font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest disabled:opacity-50"
              >
                <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">✨</span>
                AI Hint ({20 + (gameState.level * 10)} PTS)
              </button>

              {hint && (
                <div className="px-6 py-3 bg-amber-50 border-2 border-amber-100 rounded-[1.5rem] text-amber-700 text-sm font-black animate-bounce shadow-md">
                  TRY: <span className="uppercase tracking-widest text-lg ml-1">{hint}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* HUD Messaging */}
        {msg && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black text-2xl shadow-[0_30px_60px_rgba(0,0,0,0.3)] animate-in fade-in zoom-in duration-300 whitespace-nowrap">
            {msg}
          </div>
        )}

        {/* Collection Section */}
        <div className="mt-10 pt-8 border-t border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Found Words</h3>
          </div>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto pr-2 scrollbar-hide">
            {gameState.foundWords.map((w, idx) => (
              <span key={idx} className="bg-gradient-to-br from-indigo-50 to-white text-indigo-600 px-4 py-2 rounded-[1rem] text-xs font-black uppercase shadow-sm border border-indigo-100 animate-in slide-in-from-bottom-2 duration-300">
                {w}
              </span>
            ))}
            {gameState.foundWords.length === 0 && (
              <div className="w-full flex flex-col items-center py-4 text-slate-300 opacity-50">
                <span className="text-[10px] font-bold uppercase tracking-wider italic">Tap letters to begin</span>
              </div>
            )}
          </div>
        </div>

        {/* Pause Overlay */}
        {gameState.isPaused && (
          <div className="absolute inset-0 z-[80] bg-indigo-900/40 backdrop-blur-md flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-300">
            <div className="bg-white p-8 rounded-[3rem] shadow-2xl flex flex-col items-center max-w-[280px]">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                    <span className="text-4xl">⏸</span>
                </div>
                <h2 className="text-3xl font-black text-slate-900 font-fredoka mb-6">GAME PAUSED</h2>
                <button 
                    onClick={togglePause}
                    className="w-full py-4 bg-indigo-600 text-white rounded-[1.5rem] font-black text-xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95 border-b-4 border-indigo-900"
                >
                    RESUME
                </button>
            </div>
          </div>
        )}

        {/* End Game Screens */}
        {(gameState.isGameOver || gameState.isLevelComplete) && (
          <div className="absolute inset-0 z-[100] bg-white flex flex-col items-center justify-center p-10 text-center animate-in fade-in zoom-in duration-500">
            <div className={`mb-8 p-6 rounded-full ${gameState.isLevelComplete ? 'bg-green-50' : 'bg-red-50'} shadow-inner`}>
              <span className="text-7xl">{gameState.isLevelComplete ? '🌟' : '💀'}</span>
            </div>
            <h2 className="text-6xl font-black text-slate-900 font-fredoka mb-3 leading-tight">
              {gameState.isLevelComplete ? 'VICTORY' : 'DEFEAT'}
            </h2>
            <p className="text-slate-400 font-bold mb-10 max-w-[280px] uppercase text-xs tracking-[0.1em]">
              {gameState.isLevelComplete 
                ? `Stage ${gameState.level} conquered!` 
                : `Final Score: ${gameState.score}`}
            </p>
            
            <div className="grid grid-cols-2 gap-6 w-full mb-12">
              <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 flex flex-col gap-1">
                <span className="text-[10px] uppercase text-slate-400 font-black tracking-widest">Words</span>
                <span className="text-4xl font-black text-slate-900">{gameState.foundWords.length}</span>
              </div>
              <div className="bg-slate-50 p-6 rounded-[2rem] border-2 border-slate-100 flex flex-col gap-1">
                <span className="text-[10px] uppercase text-slate-400 font-black tracking-widest">Points</span>
                <span className="text-4xl font-black text-slate-900">{gameState.score}</span>
              </div>
            </div>

            {gameState.isLevelComplete ? (
              <button 
                onClick={() => initLevel(gameState.level + 1)}
                className="w-full py-6 bg-indigo-600 text-white rounded-[2rem] font-black text-2xl shadow-2xl hover:bg-indigo-700 transition-all active:scale-95 border-b-8 border-indigo-900"
              >
                NEXT STAGE
              </button>
            ) : (
              <button 
                onClick={() => initLevel(1)}
                className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-2xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95 border-b-8 border-slate-950"
              >
                TRY AGAIN
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-10 flex flex-col items-center gap-2">
         <p className="font-black text-slate-300 text-[10px] uppercase tracking-[0.2em]">Manual Submission</p>
         <p className="text-[10px] text-slate-300 uppercase tracking-tighter opacity-70">Tap SUBMIT WORD to check your word</p>
      </div>
    </div>
  );
};

export default App;
