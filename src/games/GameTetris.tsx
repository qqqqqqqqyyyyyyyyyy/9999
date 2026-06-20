import React, { useState, useEffect, useCallback, useRef } from 'react';

const COLS = 10;
const ROWS = 20;
const CELL_SIZE = 24;
const PREVIEW_SIZE = 4;

type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

const SHAPES: Record<TetrominoType, number[][][]> = {
  I: [[[1,1,1,1]]],
  O: [[[1,1],[1,1]]],
  T: [[[0,1,0],[1,1,1]], [[1,0],[1,1],[1,0]], [[1,1,1],[0,1,0]], [[0,1],[1,1],[0,1]]],
  S: [[[0,1,1],[1,1,0]], [[1,0],[1,1],[0,1]]],
  Z: [[[1,1,0],[0,1,1]], [[0,1],[1,1],[1,0]]],
  J: [[[1,0,0],[1,1,1]], [[1,1],[1,0],[1,0]], [[1,1,1],[0,0,1]], [[0,1],[0,1],[1,1]]],
  L: [[[0,0,1],[1,1,1]], [[1,0],[1,0],[1,1]], [[1,1,1],[1,0,0]], [[1,1],[0,1],[0,1]]],
};

const COLORS: Record<TetrominoType, string> = {
  I: '#06b6d4', O: '#fbbf24', T: '#8b5cf6', S: '#22c55e', Z: '#ef4444', J: '#3b82f6', L: '#f97316',
};

const GameTetris: React.FC = () => {
  const [board, setBoard] = useState<number[][]>(() => Array(ROWS).fill(null).map(() => Array(COLS).fill(0)));
  const [current, setCurrent] = useState<{ type: TetrominoType; rotation: number; x: number; y: number } | null>(null);
  const [nextPiece, setNextPiece] = useState<TetrominoType>('T');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const dropIntervalRef = useRef<number>(500);

  const randomPiece = (): TetrominoType => {
    const pieces: TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    return pieces[Math.floor(Math.random() * pieces.length)];
  };

  const getShape = (type: TetrominoType, rotation: number): number[][] => {
    return SHAPES[type][rotation % SHAPES[type].length];
  };

  const canPlace = (board: number[][], type: TetrominoType, rotation: number, x: number, y: number): boolean => {
    const shape = getShape(type, rotation);
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const newX = x + col;
          const newY = y + row;
          if (newX < 0 || newX >= COLS || newY >= ROWS) return false;
          if (newY >= 0 && board[newY][newX]) return false;
        }
      }
    }
    return true;
  };

  const placePiece = (board: number[][], type: TetrominoType, rotation: number, x: number, y: number): number[][] => {
    const newBoard = board.map(row => [...row]);
    const shape = getShape(type, rotation);
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const newY = y + row;
          const newX = x + col;
          if (newY >= 0 && newY < ROWS && newX >= 0 && newX < COLS) {
            newBoard[newY][newX] = 1;
          }
        }
      }
    }
    return newBoard;
  };

  const clearLines = (board: number[][]): { board: number[][], lines: number } => {
    let linesCleared = 0;
    const newBoard = board.filter(row => {
      if (row.every(cell => cell !== 0)) {
        linesCleared++;
        return false;
      }
      return true;
    });
    while (newBoard.length < ROWS) {
      newBoard.unshift(Array(COLS).fill(0));
    }
    return { board: newBoard, lines: linesCleared };
  };

  const spawnPiece = useCallback(() => {
    const type = nextPiece;
    setNextPiece(randomPiece());
    const x = Math.floor((COLS - SHAPES[type][0][0].length) / 2);
    if (!canPlace(board, type, 0, x, 0)) {
      setGameOver(true);
      return null;
    }
    return { type, rotation: 0, x, y: 0 };
  }, [board, nextPiece]);

  const moveDown = useCallback(() => {
    if (!current || gameOver || isPaused) return;
    if (canPlace(board, current.type, current.rotation, current.x, current.y + 1)) {
      setCurrent({ ...current, y: current.y + 1 });
    } else {
      const newBoard = placePiece(board, current.type, current.rotation, current.x, current.y);
      const { board: clearedBoard, lines } = clearLines(newBoard);
      setBoard(clearedBoard);
      if (lines > 0) {
        setScore(s => s + lines * 100 * lines);
        dropIntervalRef.current = Math.max(100, 500 - lines * 20);
      }
      const newPiece = spawnPiece();
      setCurrent(newPiece);
    }
  }, [current, board, gameOver, isPaused, spawnPiece]);

  const moveHorizontal = (dx: number) => {
    if (!current || gameOver || isPaused) return;
    if (canPlace(board, current.type, current.rotation, current.x + dx, current.y)) {
      setCurrent({ ...current, x: current.x + dx });
    }
  };

  const rotate = () => {
    if (!current || gameOver || isPaused) return;
    const newRotation = (current.rotation + 1) % 4;
    if (canPlace(board, current.type, newRotation, current.x, current.y)) {
      setCurrent({ ...current, rotation: newRotation });
    }
  };

  const hardDrop = () => {
    if (!current || gameOver || isPaused) return;
    let newY = current.y;
    while (canPlace(board, current.type, current.rotation, current.x, newY + 1)) {
      newY++;
    }
    const newBoard = placePiece(board, current.type, current.rotation, current.x, newY);
    const { board: clearedBoard, lines } = clearLines(newBoard);
    setBoard(clearedBoard);
    if (lines > 0) setScore(s => s + lines * 100 * lines);
    const newPiece = spawnPiece();
    setCurrent(newPiece);
  };

  useEffect(() => {
    if (gameOver) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        setIsPaused(p => !p);
        return;
      }
      if (isPaused) return;
      switch (e.key) {
        case 'ArrowLeft': moveHorizontal(-1); break;
        case 'ArrowRight': moveHorizontal(1); break;
        case 'ArrowDown': moveDown(); break;
        case 'ArrowUp': rotate(); break;
        case ' ': hardDrop(); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [current, board, gameOver, isPaused]);

  useEffect(() => {
    if (gameOver || isPaused) return;
    const gameLoop = (time: number) => {
      if (time - lastTimeRef.current > dropIntervalRef.current) {
        moveDown();
        lastTimeRef.current = time;
      }
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameOver, isPaused, moveDown]);

  useEffect(() => {
    const newBoard = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    const initialPiece = spawnPiece();
    setCurrent(initialPiece);
    setBoard(newBoard);
  }, []);

  const resetGame = () => {
    const newBoard = Array(ROWS).fill(null).map(() => Array(COLS).fill(0));
    setBoard(newBoard);
    setNextPiece(randomPiece());
    const initialPiece = spawnPiece();
    setCurrent(initialPiece);
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
    dropIntervalRef.current = 500;
  };

  const renderBoard = () => {
    const displayBoard = board.map(row => [...row]);
    if (current) {
      const shape = getShape(current.type, current.rotation);
      for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
          if (shape[row][col]) {
            const y = current.y + row;
            const x = current.x + col;
            if (y >= 0 && y < ROWS && x >= 0 && x < COLS) {
              displayBoard[y][x] = 2;
            }
          }
        }
      }
    }

    return (
      <div className="flex gap-4">
        <div
          className="grid gap-px bg-[#0f0f23] p-1 rounded neon-border"
          style={{
            gridTemplateColumns: `repeat(${COLS}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${ROWS}, ${CELL_SIZE}px)`,
          }}
        >
          {displayBoard.map((row, i) =>
            row.map((cell, j) => (
              <div
                key={`${i}-${j}`}
                className="rounded-sm transition-all"
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  backgroundColor:
                    cell === 2 ? COLORS[current?.type || 'T'] :
                    cell === 1 ? '#8b5cf6' : '#1a1a2e',
                  boxShadow: cell ? `0 0 8px ${cell === 2 ? COLORS[current?.type || 'T'] : '#8b5cf6'}40` : 'none',
                }}
              />
            ))
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-[#1a1a2e] p-2 rounded neon-border-cyan">
            <p className="text-gray-400 text-xs mb-1">下一个</p>
            <div
              className="grid gap-px"
              style={{
                gridTemplateColumns: `repeat(${PREVIEW_SIZE}, 16px)`,
                gridTemplateRows: `repeat(${PREVIEW_SIZE}, 16px)`,
              }}
            >
              {Array(PREVIEW_SIZE * PREVIEW_SIZE).fill(0).map((_, i) => {
                const shape = getShape(nextPiece, 0);
                const row = Math.floor(i / PREVIEW_SIZE);
                const col = i % PREVIEW_SIZE;
                const cellValue = shape[row]?.[col] || 0;
                return (
                  <div
                    key={i}
                    style={{
                      width: 16,
                      height: 16,
                      backgroundColor: cellValue ? COLORS[nextPiece] : 'transparent',
                    }}
                  />
                );
              })}
            </div>
          </div>

          <div className="bg-[#1a1a2e] p-3 rounded neon-border">
            <p className="text-gray-400 text-xs">分数</p>
            <p className="font-display text-xl text-[#fbbf24] neon-glow-gold">{score}</p>
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p>↑ 旋转</p>
            <p>← → 移动</p>
            <p>↓ 加速下落</p>
            <p>空格 硬降</p>
            <p>P 暂停</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex items-center gap-8 mb-2">
        <h2 className="font-display text-2xl font-bold text-white neon-glow">俄罗斯方块</h2>
        {isPaused && <span className="text-[#ec4899] neon-glow-pink font-display">已暂停</span>}
      </div>

      {renderBoard()}

      {gameOver && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg">
          <p className="font-display text-2xl text-[#ec4899] neon-glow-pink mb-4">游戏结束</p>
          <p className="text-gray-400 mb-4">最终分数: {score}</p>
          <button
            onClick={resetGame}
            className="px-6 py-2 bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] rounded-lg font-bold hover:scale-105 transition"
          >
            再来一局
          </button>
        </div>
      )}
    </div>
  );
};

export default GameTetris;
