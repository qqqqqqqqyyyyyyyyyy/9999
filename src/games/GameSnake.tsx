import React, { useState, useEffect, useCallback, useRef } from 'react';

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

const GameSnake: React.FC = () => {
  const [snake, setSnake] = useState<{ x: number; y: number }[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<{ x: number; y: number }>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<{ x: number; y: number }>({ x: 1, y: 0 });
  const [nextDirection, setNextDirection] = useState<{ x: number; y: number }>({ x: 1, y: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef<number>();

  const generateFood = useCallback((snake: { x: number; y: number }[]): { x: number; y: number } => {
    let newFood: { x: number; y: number };
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (snake.some(s => s.x === newFood.x && s.y === newFood.y));
    return newFood;
  }, []);

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setDirection(nextDirection);
    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = {
        x: head.x + direction.x,
        y: head.y + direction.y,
      };

      if (
        newHead.x < 0 || newHead.x >= GRID_SIZE ||
        newHead.y < 0 || newHead.y >= GRID_SIZE ||
        prevSnake.some(s => s.x === newHead.x && s.y === newHead.y)
      ) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, nextDirection, food, gameOver, isPaused, generateFood]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        setIsPaused(p => !p);
        return;
      }
      if (isPaused || gameOver) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y !== 1) setNextDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y !== -1) setNextDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x !== 1) setNextDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x !== -1) setNextDirection({ x: 1, y: 0 });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, isPaused, gameOver]);

  useEffect(() => {
    const speed = Math.max(50, INITIAL_SPEED - score * 2);
    gameLoopRef.current = window.setInterval(moveSnake, speed);
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [moveSnake, score]);

  const resetGame = () => {
    setSnake([{ x: 10, y: 10 }]);
    setFood({ x: 15, y: 15 });
    setDirection({ x: 1, y: 0 });
    setNextDirection({ x: 1, y: 0 });
    setScore(0);
    setGameOver(false);
    setIsPaused(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex items-center gap-8 mb-2">
        <h2 className="font-display text-2xl font-bold text-white neon-glow">贪吃蛇</h2>
        <div className="bg-[#1a1a2e] px-4 py-2 rounded-lg neon-border">
          <span className="text-gray-400 text-sm">分数</span>
          <p className="font-display text-xl text-[#fbbf24] neon-glow-gold">{score}</p>
        </div>
        {isPaused && <span className="text-[#ec4899] neon-glow-pink font-display">已暂停</span>}
      </div>

      <div
        className="relative bg-[#1a1a2e] p-1 rounded-lg neon-border"
        style={{
          width: GRID_SIZE * CELL_SIZE + 8,
          height: GRID_SIZE * CELL_SIZE + 8,
        }}
      >
        <div className="grid gap-0" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)` }}>
          {Array(GRID_SIZE * GRID_SIZE).fill(0).map((_, i) => {
            const x = i % GRID_SIZE;
            const y = Math.floor(i / GRID_SIZE);
            const isSnakeHead = snake[0].x === x && snake[0].y === y;
            const isSnakeBody = snake.slice(1).some(s => s.x === x && s.y === y);
            const isFood = food.x === x && food.y === y;

            return (
              <div
                key={i}
                className="rounded-sm transition-all"
                style={{
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  backgroundColor: isFood ? '#ef4444' : isSnakeHead ? '#22c55e' : isSnakeBody ? '#16a34a' : 'transparent',
                  boxShadow: isFood ? '0 0 10px #ef444480' : isSnakeHead ? '0 0 8px #22c55e80' : 'none',
                }}
              />
            );
          })}
        </div>

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

      <div className="text-xs text-gray-500 mt-2 text-center">
        <p>使用方向键控制蛇的移动方向</p>
        <p>按 P 键暂停</p>
      </div>
    </div>
  );
};

export default GameSnake;
