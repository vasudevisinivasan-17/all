import React from 'react';
import { Theme } from '../types';

interface WordGridProps {
  grid: string[][];
  selectedIndices: number[];
  onLetterClick: (index: number, row: number, col: number) => void;
  size: number;
  theme: Theme;
}

const WordGrid: React.FC<WordGridProps> = ({ grid, selectedIndices, onLetterClick, size, theme }) => {
  return (
    <div 
      className={`grid gap-2.5 p-3 rounded-[2rem] shadow-inner border-4 border-black/5 ${theme.gridBg} word-grid-container`}
      style={{ 
        gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
        maxWidth: '420px',
        margin: '0 auto'
      }}
    >
      {grid.map((row, rIdx) => 
        row.map((letter, cIdx) => {
          const index = rIdx * size + cIdx;
          const isSelected = selectedIndices.includes(index);
          const isLastSelected = selectedIndices[selectedIndices.length - 1] === index;

          return (
            <button
              key={index}
              onClick={() => onLetterClick(index, rIdx, cIdx)}
              className={`
                cell-button aspect-square flex items-center justify-center text-2xl md:text-4xl font-black rounded-[1.25rem] transition-all duration-200 select-none
                ${isSelected 
                  ? `${theme.cellSelectedClass} animate-pop-selection scale-[0.9] border-b-0` 
                  : `${theme.cellClass} border-b-4 border-black/10 active:translate-y-1 active:border-b-0`}
                ${isLastSelected ? 'ring-4 ring-white/70 ring-offset-2 animate-ring-pulse' : ''}
              `}
            >
              <span className={isSelected ? 'scale-110' : ''}>{letter}</span>
            </button>
          );
        })
      )}
    </div>
  );
};

export default WordGrid;