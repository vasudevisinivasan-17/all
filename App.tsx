import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GameState } from './types';
import { getRandomLetter, LETTER_SCORES, getLevelConfig, GRID_SIZE_INITIAL, THEMES } from './constants';
import WordGrid from './components/WordGrid';
import GameHeader from './components/GameHeader';
import { getHintFromGemini, checkWordWithGemini } from './services/geminiService';

type GamePhase = 'LOBBY' | 'PLAYING' | 'RESULT';

const App: React.FC = () => {
  const [phase, setPhase] = useState<GamePhase>('LOBBY');
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
    currentThemeId: 'sunset'
  });

  const currentTheme = THEMES[gameState.currentThemeId] || THEMES.classic;

  const [gridSize, setGridSize] = useState(GRID_SIZE_INITIAL);
  const [minWordLength, setMinWordLength] = useState(3);
  const [grid, setGrid] = useState<string[][]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [currentWord, setCurrentWord] = useState("");
  const [hint, setHint] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [msg, setMsg] = useState<{ text: string, type: 'info' | 'error' | 'success' } | null>(null);
  const [scorePopups, setScorePopups] = useState<{ id: number, points: number }[]>([]);
  
  const scorePopupIdCounter = useRef(0);

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
    setPhase('PLAYING');
    setMsg({ text: `LEVEL ${level} START!`, type: 'info' });
    setTimeout(() => setMsg(null), 2000);
  }, []);

  // Timer Effect
  useEffect(() => {
    if (phase !== 'PLAYING' || gameState.isGameOver || gameState.isLevelComplete || gameState.isPaused) return;

    const interval = setInterval(() => {
      setGameState(prev => {
        if (prev.timer <= 1) {
          clearInterval(interval);
          setPhase('RESULT');
          return { ...prev, timer: 0, isGameOver: true };
        }
        return { ...prev, timer: prev.timer - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, gameState.isGameOver, gameState.isLevelComplete, gameState.isPaused]);

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
    if (gameState.isPaused || phase !== 'PLAYING') return;
    
    if (currentWord.length < minWordLength) {
      setMsg({ text: `Need ${minWordLength}+ letters!`, type: 'error' });
      setTimeout(() => setMsg(null), 1000);
      return;
    }

    if (gameState.foundWords.includes(currentWord)) {
      setMsg({ text: "Already found!", type: 'error' });
      setTimeout(() => setMsg(null), 1000);
      setSelectedIndices([]);
      setCurrentWord("");
      return;
    }

    setIsAiLoading(true);
    const isValid = await checkWordWithGemini(currentWord);
    setIsAiLoading(true); // Artificial small delay for UX
    setTimeout(async () => {
      setIsAiLoading(false);
      if (isValid) {
        const points = calculateWordScore(currentWord);
        
        // Add floating popup
        const id = scorePopupIdCounter.current++;
        setScorePopups(prev => [...prev, { id, points }]);
        setTimeout(() => {
          setScorePopups(prev => prev.filter(p => p.id !== id));
        }, 1000);

        setGameState(prev => {
          const newScore = prev.score + points;
          const newFoundWords = [...prev.foundWords, currentWord];
          const complete = newScore >= prev.targetScore && newFoundWords.length >= prev.minWordsRequired;
          
          if (complete) {
            setTimeout(() => setPhase('RESULT'), 1000);
          }

          return {
            ...prev,
            score: newScore,
            foundWords: newFoundWords,
            isLevelComplete: complete
          };
        });
        setMsg({ text: `Excellent: ${currentWord}!`, type: 'success' });
      } else {
        setMsg({ text: "Not a valid word!", type: 'error' });
        setGameState(prev => ({ ...prev, score: Math.max(0, prev.score - 5) }));
      }
      
      setSelectedIndices([]);
      setCurrentWord("");
      setTimeout(() => setMsg(null), 1500);
    }, 400);
  };

  const onLetterClick = (index: number, row: number, col: number) => {
    if (gameState.isGameOver || gameState.isLevelComplete || isAiLoading || gameState.isPaused || phase !== 'PLAYING') return;

    if (selectedIndices.length > 0 && selectedIndices[selectedIndices.length - 1] === index) {
      setSelectedIndices(prev => prev.slice(0, -1));
      setCurrentWord(prev => prev.slice(0, -1));
      return;
    }

    if (selectedIndices.includes(index)) {
      return;
    }

    setSelectedIndices(prev => [...prev, index]);
    setCurrentWord(prev => prev + grid[row][col]);
  };

  const getHint = async () => {
    if (gameState.isPaused || phase !== 'PLAYING') return;
    
    const hintCost = 20 + (gameState.level * 10);
    if (gameState.score < hintCost) {
      setMsg({ text: `Need ${hintCost} pts for hint!`, type: 'error' });
      setTimeout(() => setMsg(null), 1500);
      return;
    }
    
    setIsAiLoading(true);
    const aiHint = await getHintFromGemini(grid);
    setIsAiLoading(false);

    if (aiHint && aiHint !== "HINT_ERROR") {
      setHint(aiHint);
      setGameState(prev => ({ ...prev, score: prev.score - hintCost }));
    } else {
      setMsg({ text: "No more words found!", type: 'error' });
    }
    setTimeout(() => setMsg(null), 2000);
  };

  const clearSelection = () => {
    if (gameState.isPaused || phase !== 'PLAYING') return;
    setSelectedIndices([]);
    setCurrentWord("");
  };

  const togglePause = () => {
    if (gameState.isGameOver || gameState.isLevelComplete) return;
    setGameState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  const setTheme = (themeId: string) => {
    setGameState(prev => ({ ...prev, currentThemeId: themeId }));
  };

  const startNewGame = () => {
    setGameState(prev => ({ ...prev, score: 0 }));
    initLevel(1);
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-all duration-700 ${currentTheme.bgClass} overflow-hidden`}>
      
      {/* Background Shapes for Aesthetics */}
      <div className="fixed inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-br from-white to-transparent blur-3xl animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tl from-black to-transparent blur-3xl opacity-10"></div>
      </div>

      <div className={`w-full max-w-lg p-6 md:p-10 rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] relative overflow-hidden border-t-[10px] transition-all duration-500 transform ${currentTheme.cardClass}`}>
        
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6 relative z-30">
           {/* Theme Selector */}
          <div className="flex gap-2 bg-black/5 p-1.5 rounded-full border border-white/20 backdrop-blur-sm">
            {Object.values(THEMES).map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`w-5 h-5 rounded-full border-2 transition-all ${t.id === gameState.currentThemeId ? 'scale-125 border-white ring-2 ring-black/10' : 'border-transparent opacity-40 hover:opacity-100'}`}
                style={{ backgroundColor: t.primaryBtn.split(' ')[0].replace('bg-', '') }}
              />
            ))}
          </div>

          {phase === 'PLAYING' && (
             <button 
                onClick={togglePause}
                className={`flex items-center gap-2 px-4 py-2 bg-black/5 hover:bg-black/10 rounded-full transition-all font-bold text-[10px] uppercase tracking-widest border border-black/5 ${currentTheme.accentText}`}
            >
                {gameState.isPaused ? "▶ Resume" : "⏸ Pause"}
            </button>
          )}
        </div>

        {phase === 'LOBBY' && (
          <div className="flex flex-col items-center text-center py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl rotate-12 flex items-center justify-center shadow-xl mb-8">
              <span className="text-5xl -rotate-12">📝</span>
            </div>
            <h1 className={`text-5xl font-black mb-4 ${currentTheme.accentText} ${currentTheme.fontFamily} tracking-tight`}>LexiQuest</h1>
            <p className="text-slate-500 font-medium mb-10 max-w-xs text-sm leading-relaxed">
              Connect letters to uncover words and journey through increasingly difficult stages!
            </p>
            <button 
              onClick={startNewGame}
              className={`w-full py-6 text-white rounded-[2rem] font-black text-2xl shadow-xl transition-all active:scale-95 border-b-8 hover:brightness-110 ${currentTheme.primaryBtn}`}
            >
              START JOURNEY
            </button>
            <div className="mt-8 grid grid-cols-3 gap-4 w-full">
              {['3+ Letters', 'AI Hints', 'Themes'].map((feat, i) => (
                <div key={i} className="bg-black/5 p-3 rounded-2xl flex flex-col items-center">
                  <span className="text-lg">{(['📏', '✨', '🎨'])[i]}</span>
                  <span className="text-[9px] font-black uppercase tracking-tighter opacity-50 mt-1">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {phase === 'PLAYING' && (
          <>
            <GameHeader 
              score={gameState.score} 
              level={gameState.level} 
              timer={gameState.timer} 
              targetScore={gameState.targetScore}
              theme={currentTheme}
            />

            <div className="relative z-10">
              <div className="flex justify-between items-center mb-6 px-2">
                <div className="flex flex-col">
                  <span className={`text-[10px] font-black uppercase tracking-widest opacity-40 ${currentTheme.accentText}`}>Goal Progress</span>
                  <span className={`text-xs font-bold transition-colors ${gameState.foundWords.length >= gameState.minWordsRequired ? 'text-green-500' : 'opacity-70'}`}>
                    {gameState.foundWords.length} / {gameState.minWordsRequired} Words
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-black/5 flex items-center gap-1.5">
                    <span className="text-xs">📏</span>
                    <span className={`text-[10px] font-bold uppercase ${currentTheme.accentText}`}>Min: {minWordLength}</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <WordGrid 
                  grid={grid} 
                  selectedIndices={selectedIndices} 
                  onLetterClick={onLetterClick} 
                  size={gridSize}
                  theme={currentTheme}
                />
                
                {/* Floating Score Popups */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                   {scorePopups.map(popup => (
                     <div key={popup.id} className="animate-float-up text-3xl font-black text-green-500 drop-shadow-md">
                        +{popup.points}
                     </div>
                   ))}
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center gap-6">
                <div className={`h-16 flex flex-col items-center justify-center transition-transform duration-300 ${msg?.type === 'error' ? 'animate-shake' : ''}`}>
                   <span className={`text-4xl font-black tracking-[0.2em] uppercase transition-all duration-300 ${currentTheme.fontFamily} ${isAiLoading ? 'opacity-30 scale-95' : `scale-110 ${currentTheme.accentText}`}`}>
                      {currentWord || "TAP LETTERS"}
                   </span>
                   {isAiLoading && (
                     <div className="flex gap-1 mt-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"></div>
                     </div>
                   )}
                </div>

                <div className="flex gap-4 w-full">
                  <button 
                    onClick={clearSelection}
                    className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-[1.5rem] font-bold hover:bg-slate-200 transition-all active:scale-95 border-b-4 border-slate-300"
                  >
                    CLR
                  </button>
                  <button 
                    onClick={submitWord}
                    disabled={isAiLoading || currentWord.length < minWordLength || gameState.isPaused}
                    className={`flex-[3] py-4 rounded-[1.5rem] font-black text-white shadow-xl transition-all active:scale-95 border-b-8 ${
                      isAiLoading || currentWord.length < minWordLength || gameState.isPaused
                        ? 'bg-slate-200 border-slate-300 cursor-not-allowed text-slate-400' 
                        : `${currentTheme.primaryBtn} hover:-translate-y-1`
                    }`}
                  >
                    {isAiLoading ? 'CHECKING...' : 'SUBMIT'}
                  </button>
                </div>

                <div className="flex flex-col items-center gap-3 w-full">
                  <button 
                    onClick={getHint}
                    disabled={isAiLoading || gameState.isPaused}
                    className={`group flex items-center gap-2 text-xs font-black transition-all uppercase tracking-widest disabled:opacity-50 opacity-60 hover:opacity-100 ${currentTheme.accentText} bg-black/5 px-6 py-3 rounded-full hover:bg-black/10`}
                  >
                    <span className="text-base group-hover:rotate-12 transition-transform">✨</span>
                    Get AI Hint ({20 + (gameState.level * 10)} PTS)
                  </button>

                  {hint && (
                    <div className={`px-8 py-3 bg-white border-2 rounded-2xl text-sm font-black animate-in zoom-in duration-300 shadow-lg ${currentTheme.accentText} border-black/5 flex items-center gap-2`}>
                      <span className="opacity-40">TRY:</span>
                      <span className="uppercase tracking-[0.2em] text-lg underline decoration-wavy decoration-indigo-300">{hint}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Collection Section */}
            <div className="mt-10 pt-8 border-t border-black/5">
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] opacity-30 ${currentTheme.accentText}`}>Dictionary ({gameState.foundWords.length})</h3>
              </div>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto pr-2 scrollbar-hide">
                {gameState.foundWords.map((w, idx) => (
                  <span key={idx} className={`bg-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase shadow-sm border border-black/5 animate-in zoom-in duration-200 ${currentTheme.accentText}`}>
                    {w}
                  </span>
                ))}
                {gameState.foundWords.length === 0 && (
                  <div className={`w-full text-center py-2 opacity-20 ${currentTheme.accentText}`}>
                    <span className="text-[10px] font-bold uppercase italic tracking-widest">No words collected yet</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {phase === 'RESULT' && (
           <div className="absolute inset-0 z-[100] bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-10 text-center animate-in fade-in zoom-in duration-500">
            <div className={`mb-8 p-8 rounded-[3rem] ${gameState.isLevelComplete ? 'bg-green-100 rotate-6 shadow-green-100' : 'bg-red-100 -rotate-6 shadow-red-100'} shadow-2xl transition-transform duration-700`}>
              <span className="text-8xl">{gameState.isLevelComplete ? '✨' : '⌛'}</span>
            </div>
            <h2 className={`text-6xl font-black text-slate-900 font-fredoka mb-2 leading-tight tracking-tighter`}>
              {gameState.isLevelComplete ? 'STAGE CLEAR' : 'TIME UP'}
            </h2>
            <p className="text-slate-400 font-bold mb-10 max-w-[280px] uppercase text-[10px] tracking-[0.3em]">
              {gameState.isLevelComplete 
                ? `You reached Stage ${gameState.level} target!` 
                : `Stage ${gameState.level} was tough.`}
            </p>
            
            <div className="grid grid-cols-2 gap-4 w-full mb-12">
              <div className="bg-slate-50 p-6 rounded-[2.5rem] border-2 border-slate-100 flex flex-col items-center">
                <span className="text-[9px] uppercase text-slate-400 font-black tracking-widest mb-1">Found</span>
                <span className="text-4xl font-black text-slate-900">{gameState.foundWords.length}</span>
              </div>
              <div className="bg-slate-50 p-6 rounded-[2.5rem] border-2 border-slate-100 flex flex-col items-center">
                <span className="text-[9px] uppercase text-slate-400 font-black tracking-widest mb-1">Score</span>
                <span className="text-4xl font-black text-slate-900">{gameState.score}</span>
              </div>
            </div>

            {gameState.isLevelComplete ? (
              <button 
                onClick={() => initLevel(gameState.level + 1)}
                className={`w-full py-6 text-white rounded-[2rem] font-black text-2xl shadow-2xl transition-all active:scale-95 border-b-8 ${currentTheme.primaryBtn}`}
              >
                NEXT STAGE
              </button>
            ) : (
              <div className="w-full flex flex-col gap-4">
                <button 
                  onClick={startNewGame}
                  className="w-full py-6 bg-slate-900 text-white rounded-[2rem] font-black text-2xl shadow-2xl hover:bg-slate-800 transition-all active:scale-95 border-b-8 border-slate-950"
                >
                  RETRY JOURNEY
                </button>
                <button 
                  onClick={() => setPhase('LOBBY')}
                  className="text-slate-400 text-xs font-black uppercase tracking-widest hover:text-slate-600 transition-colors"
                >
                  BACK TO MENU
                </button>
              </div>
            )}
          </div>
        )}

        {/* HUD Feedback Messages */}
        {msg && (
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[90] pointer-events-none px-10 py-6 rounded-[2.5rem] font-black text-2xl shadow-2xl animate-in fade-in zoom-in duration-300 whitespace-nowrap border-4
            ${msg.type === 'error' ? 'bg-red-600 text-white border-red-800' : 
              msg.type === 'success' ? 'bg-green-600 text-white border-green-800' : 
              'bg-slate-900 text-white border-slate-800'}`}>
            {msg.text}
          </div>
        )}

        {/* Pause Overlay */}
        {gameState.isPaused && (
          <div className="absolute inset-0 z-[80] bg-white/60 backdrop-blur-xl flex flex-col items-center justify-center p-10 text-center animate-in fade-in duration-300">
            <div className={`p-10 rounded-[4rem] shadow-2xl flex flex-col items-center w-full max-w-[300px] border-4 ${currentTheme.cardClass} bg-white`}>
                <div className="w-24 h-24 bg-black/5 rounded-full flex items-center justify-center mb-8">
                    <span className="text-5xl animate-pulse">⏸</span>
                </div>
                <h2 className={`text-3xl font-black mb-8 ${currentTheme.accentText} ${currentTheme.fontFamily}`}>REST TIME</h2>
                <button 
                    onClick={togglePause}
                    className={`w-full py-5 text-white rounded-[2rem] font-black text-xl shadow-xl transition-all active:scale-95 border-b-8 ${currentTheme.primaryBtn}`}
                >
                    CONTINUE
                </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-8 flex flex-col items-center gap-1 opacity-40">
         <p className="font-black text-slate-400 text-[10px] uppercase tracking-[0.4em]">LexiQuest v1.2</p>
         <p className="text-[9px] text-slate-400 uppercase tracking-widest">Powered by Gemini AI Intelligence</p>
      </div>
    </div>
  );
};

export default App;