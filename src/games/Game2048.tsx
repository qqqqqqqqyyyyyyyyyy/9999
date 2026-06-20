import React, { useState, useEffect, useCallback } from 'react';

const GRID_SIZE = 4;
const CELL_SIZE = 80;
const CELL_GAP = 8;

type Direction = 'up' | 'down' | 'left' | 'right';

const Game2048: React.FC = () => {
  const [grid, setGrid] = useState<number[][]>(() => createEmptyGrid());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);

  function createEmptyGrid(): number[][] {
    return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0));
  }

  function addRandomTile(grid: number[][]): number[][] {
    const emptyCells: [number, number][] = [];
    grid.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell === 0) emptyCells.push([i, j]);
      });
    });
    if (emptyCells.length === 0) return grid;
    const [i, j] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newGrid = grid.map(row => [...row]);
    newGrid[i][j] = Math.random() < 0.9 ? 2 : 4;
    return newGrid;
  }

  function canMove(grid: number[][]): boolean {
    for (let i = 0; i < GRID_SIZE; i++) {
      for (let j = 0; j < GRID_SIZE; j++) {
        if (grid[i][j] === 0) return true;
        if (j < GRID_SIZE - 1 && grid[i][j] === grid[i][j + 1]) return true;
        if (i < GRID_SIZE - 1 && grid[i][j] === grid[i + 1][j]) return true;
      }
    }
    return false;
  }

  function move(grid: number[][], direction: Direction): { grid: number[][], score: number } {
    let newGrid = grid.map(row => [...row]);
    let moveScore = 0;

    const rotate = (g: number[][], times: number) => {
      let result = g;
      for (let t = 0; t < times; t++) {
        result = result[0].map((_, i) => result.map(row => row[i]).reverse());
      }
      return result;
    };

    const mergeRow = (row: number[]): { row: number[], score: number } => {
      let newRow = row.filter(x => x !== 0);
      let score = 0;
      for (let i = 0; i < newRow.length - 1; i++) {
        if (newRow[i] === newRow[i + 1]) {
          newRow[i] *= 2;
          score += newRow[i];
          newRow.splice(i + 1, 1);
        }
      }
      while (newRow.length < GRID_SIZE) newRow.push(0);
      return { row: newRow, score };
    };

    let rotations = { up: 0, right: 1, down: 2, left: 3 }[direction];
    newGrid = rotate(newGrid, rotations);

    for (let i = 0; i < GRID_SIZE; i++) {
      const { row, score: rowScore } = mergeRow(newGrid[i]);
      newGrid[i] = row;
      moveScore += rowScore;
    }

    newGrid = rotate(newGrid, (4 - rotations) % 4);

    return { grid: newGrid, score: moveScore };
  }

  const handleMove = useCallback((direction: Direction) => {
    if (gameOver) return;
    const { grid: newGrid, score: moveScore } = move(grid, direction);
    if (JSON.stringify(newGrid) === JSON.stringify(grid)) return;
    const gridWithTile = addRandomTile(newGrid);
    setGrid(gridWithTile);
    setScore(s => s + moveScore);
    if (moveScore > 0) {
      const has2048 = newGrid.some(row => row.some(cell => cell >= 2048));
      if (has2048 && !won) setWon(true);
    }
    if (!canMove(gridWithTile)) setGameOver(true);
  }, [grid, gameOver, won]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap: Record<string, Direction> = {
        ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
        w: 'up', s: 'down', a: 'left', d: 'right',
      };
      if (keyMap[e.key]) {
        e.preventDefault();
        handleMove(keyMap[e.key]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove]);

  useEffect(() => {
    setGrid(addRandomTile(addRandomTile(createEmptyGrid())));
  }, []);

  const resetGame = () => {
    setGrid(addRandomTile(addRandomTile(createEmptyGrid())));
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  const getTileColor = (value: number): string => {
    const colors: Record<number, string> = {
      2: '#eee4da', 4: '#ede0c8', 8: '#f2b179', 16: '#f59563',
      32: '#f67c5f', 64: '#f65e3b', 128: '#edcf72', 256: '#edcc61',
      512: '#edc850', 1024: '#edc53f', 2048: '#edc22e',
    };
    return colors[value] || '#3c3a32';
  };

  const getTextColor = (value: number): string => {
    return value <= 4 ? '#776e65' : '#f9f6f2';
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex items-center gap-8 mb-4">
        <h2 className="font-display text-2xl font-bold text-white neon-glow">2048</h2>
        <div className="bg-[#1a1a2e] px-4 py-2 rounded-lg neon-border">
          <span className="text-gray-400 text-sm">分数</span>
          <p className="font-display text-xl text-[#fbbf24] neon-glow-gold">{score}</p>
        </div>
      </div>

      <div
        className="relative bg-[#1a1a2e] p-2 rounded-lg neon-border"
        style={{ width: GRID_SIZE * CELL_SIZE + (GRID_SIZE - 1) * CELL_GAP + 16 }}
      >
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)` }}>
          {grid.map((row, i) =>
            row.map((cell, j) => (
              <div
                key={`${i}-${j}`}
                className="rounded flex items-center justify-center font-bold transition-all duration-100"
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  backgroundColor: cell ? getTileColor(cell) : '#0f0f23',
                  color: cell ? getTextColor(cell) : 'transparent',
                  fontSize: cell >= 100 ? '1.5rem' : '2rem',
                }}
              >
                {cell || ''}
              </div>
            ))
          )}
        </div>

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
            <p className="font-display text-2xl text-[#ec4899] neon-glow-pink mb-4">游戏结束</p>
            <button
              onClick={resetGame}
              className="px-6 py-2 bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] rounded-lg font-bold hover:scale-105 transition"
            >
              再来一局
            </button>
          </div>
        )}

        {won && !gameOver && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center rounded-lg">
            <p className="font-display text-2xl text-[#fbbf24] neon-glow-gold mb-4">你赢了！</p>
            <button
              onClick={resetGame}
              className="px-6 py-2 bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] rounded-lg font-bold hover:scale-105 transition"
            >
              再来一局
            </button>
          </div>
        )}
      </div>

      <p className="text-gray-400 text-sm mt-2">使用方向键或WASD移动方块</p>
    </div>
  );
};

export default Game2048;
