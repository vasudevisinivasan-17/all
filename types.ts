
export interface GameState {
  score: number;
  level: number;
  timer: number;
  isGameOver: boolean;
  isLevelComplete: boolean;
  isPaused: boolean;
  targetScore: number;
  foundWords: string[];
}

export interface GridCell {
  letter: string;
  index: number;
  row: number;
  col: number;
}
