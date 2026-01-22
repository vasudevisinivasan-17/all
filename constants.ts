import { Theme } from './types';

export const LETTER_SCORES: Record<string, number> = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1, M: 3,
  N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10
};

export const INITIAL_TIME = 90;
export const GRID_SIZE_INITIAL = 5;

export const LETTER_DISTRIBUTION = "EEEEEEEEEEEEEEEEEEAAAAAAAAAAAAAIIIIIIIIIIIIIOOOOOOOOOOOOONNNNNNNNNNNRRRRRRRRRRTTTTTTTTTTLLLLLLLLSSSSSSSSSUDDDDDGGGGBBCCMMPPFFHHWWYYKJVXZQ".split("");
export const HARD_LETTER_DISTRIBUTION = "EEEEEEAAAAAIIIIIOOOOONNNRRRTTTLLSSSSUDGBCMPFHWYKKKKJJJVVVXXXXZZZZQQQQ".split("");

export const getRandomLetter = (level: number) => {
  const dist = level > 4 ? HARD_LETTER_DISTRIBUTION : LETTER_DISTRIBUTION;
  return dist[Math.floor(Math.random() * dist.length)];
};

export const getLevelConfig = (level: number) => {
  const size = 5;
  const targetScore = Math.floor(100 * Math.pow(1.6, level - 1));
  const timer = Math.max(30, 90 - (level - 1) * 8);
  const minWordLength = level >= 6 ? 4 : 3;
  const minWordsRequired = Math.max(3, level + 1); 

  return {
    size,
    timer,
    targetScore,
    minWordLength,
    minWordsRequired,
  };
};

export const THEMES: Record<string, Theme> = {
  sunset: {
    id: 'sunset',
    name: 'Ocean Sunset',
    bgClass: 'bg-orange-50',
    cardClass: 'bg-white border-orange-500 shadow-orange-200',
    gridBg: 'bg-rose-50/50',
    cellClass: 'bg-white text-rose-900 shadow hover:bg-rose-50',
    cellSelectedClass: 'bg-gradient-to-br from-orange-400 to-rose-500 text-white shadow-lg scale-95',
    accentText: 'text-orange-600',
    primaryBtn: 'bg-orange-500 border-orange-800 hover:bg-orange-600',
    timerColor: 'text-orange-500',
    fontFamily: 'font-fredoka'
  },
  classic: {
    id: 'classic',
    name: 'Classic Indigo',
    bgClass: 'bg-slate-50',
    cardClass: 'bg-white border-indigo-500 shadow-indigo-100',
    gridBg: 'bg-indigo-50/50',
    cellClass: 'bg-white text-indigo-900 shadow hover:bg-indigo-50',
    cellSelectedClass: 'bg-indigo-600 text-white shadow-md scale-95',
    accentText: 'text-indigo-600',
    primaryBtn: 'bg-indigo-600 border-indigo-900 hover:bg-indigo-700',
    timerColor: 'text-indigo-600',
    fontFamily: 'font-sans'
  },
  cyberpunk: {
    id: 'cyberpunk',
    name: 'Cyber Neon',
    bgClass: 'bg-zinc-950',
    cardClass: 'bg-zinc-900 border-fuchsia-500 shadow-[0_0_30px_rgba(217,70,239,0.2)]',
    gridBg: 'bg-black/40',
    cellClass: 'bg-zinc-800 text-cyan-400 border border-cyan-900/50 hover:bg-zinc-700 hover:border-cyan-400',
    cellSelectedClass: 'bg-fuchsia-600 text-white shadow-[0_0_20px_rgba(217,70,239,0.6)] border-fuchsia-400 scale-95',
    accentText: 'text-fuchsia-400',
    primaryBtn: 'bg-fuchsia-600 border-fuchsia-950 hover:bg-fuchsia-500',
    timerColor: 'text-fuchsia-500',
    fontFamily: 'font-mono'
  },
  nature: {
    id: 'nature',
    name: 'Forest Zen',
    bgClass: 'bg-emerald-50',
    cardClass: 'bg-white border-emerald-600 shadow-emerald-100',
    gridBg: 'bg-emerald-100/30',
    cellClass: 'bg-white text-emerald-900 shadow hover:bg-emerald-50 border border-emerald-100/50',
    cellSelectedClass: 'bg-emerald-700 text-white shadow-lg scale-95',
    accentText: 'text-emerald-800',
    primaryBtn: 'bg-emerald-700 border-emerald-900 hover:bg-emerald-800',
    timerColor: 'text-emerald-600',
    fontFamily: 'font-serif'
  }
};