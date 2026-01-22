
import React from 'react';
import { GridCell } from '../types';

interface WordGridProps {
  grid: string[][];
  selectedIndices: number[];
  onLetterClick: (index: number, row: number, col: number) => void;
  size: number;
}

const WordGrid: React.FC<WordGridProps> = ({ grid, selectedIndices, onLetterClick, size }) => {
  return (
    <div 
      className={`grid gap-2 p-2 bg-white/50 backdrop-blur-sm rounded-2xl shadow-xl border-4 border-white`}
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
                  ? 'bg-indigo-600 text-white shadow-inner animate-pop-selection' 
                  : 'bg-white text-indigo-900 hover:bg-indigo-50 hover:scale-105 active:scale-90 shadow-md'}
                ${isLastSelected ? 'ring-4 ring-indigo-300 ring-offset-2 animate-ring-pulse' : ''}
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
