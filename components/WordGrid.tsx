
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
      className={`grid gap-2 p-2 rounded-2xl shadow-xl border-4 border-white/50 ${theme.gridBg}`}
      style={{ 
        gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
        maxWidth: '400px',
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
                aspect-square flex items-center justify-center text-2xl md:text-3xl font-bold rounded-xl transition-all duration-200
                ${isSelected 
                  ? `${theme.cellSelectedClass} animate-pop-selection` 
                  : `${theme.cellClass} active:scale-90`}
                ${isLastSelected ? 'ring-4 ring-white/50 ring-offset-2 animate-ring-pulse' : ''}
              `}
            >
              {letter}
            </button>
          );
        })
      )}
    </div>
  );
};

export default WordGrid;
