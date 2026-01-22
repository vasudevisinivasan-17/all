
export interface Theme {
  id: string;
  name: string;
  bgClass: string;
  cardClass: string;
  gridBg: string;
  cellClass: string;
  cellSelectedClass: string;
  accentText: string;
  primaryBtn: string;
  timerColor: string;
  fontFamily: string;
}

export interface GameState {
  score: number;
  level: number;
  timer: number;
  isGameOver: boolean;
  isLevelComplete: boolean;
  isPaused: boolean;
  targetScore: number;
  foundWords: string[];
  currentThemeId: string;
}

export interface GridCell {
  letter: string;
  index: number;
  row: number;
  col: number;
}
