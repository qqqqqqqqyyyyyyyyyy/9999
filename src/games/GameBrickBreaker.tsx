import React, { useState, useEffect, useCallback, useRef } from 'react';

const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 12;
const BALL_SIZE = 12;
const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_HEIGHT = 24;
const BRICK_GAP = 4;

const COLORS = ['#ef4444', '#f97316', '#fbbf24', '#22c55e', '#3b82f6'];

const GameBrickBreaker: React.FC = () => {
  const [paddleX, setPaddleX] = useState(150);
  const [ball, setBall] = useState({ x: 200, y: 300, dx: 3, dy: -3 });
  const [bricks, setBricks] = useState<{ x: number; y: number; color: string; visible: boolean }[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const gameLoopRef = useRef<number>();
  const canvasWidth = 400;
  const canvasHeight = 500;

  const initBricks = useCallback(() => {
    const newBricks: { x: number; y: number; color: string; visible: boolean }[] = [];
    for (let row = 0; row < BRICK_ROWS; row++) {
      for (let col = 0; col < BRICK_COLS; col++) {
        newBricks.push({
          x: col * (canvasWidth / BRICK_COLS),
          y: 60 + row * (BRICK_HEIGHT + BRICK_GAP),
          color: COLORS[row % COLORS.length],
          visible: true,
        });
      }
    }
    return newBricks;
  }, []);

  useEffect(() => {
    setBricks(initBricks());
  }, [initBricks]);

  const movePaddle = useCallback((clientX: number, canvasRect: DOMRect) => {
    const relativeX = clientX - canvasRect.left;
    const newX = Math.max(0, Math.min(canvasWidth - PADDLE_WIDTH, relativeX - PADDLE_WIDTH / 2));
    setPaddleX(newX);
  }, []);

  const gameLoop = useCallback(() => {
    if (gameOver || won || isPaused) return;

    setBall(prevBall => {
      let newX = prevBall.x + prevBall.dx;
      let newY = prevBall.y + prevBall.dy;
      let newDx = prevBall.dx;
      let newDy = prevBall.dy;

      if (newX <= 0 || newX >= canvasWidth - BALL_SIZE) {
        newDx = -newDx;
        newX = Math.max(0, Math.min(canvasWidth - BALL_SIZE, newX));
      }
      if (newY <= 0) {
        newDy = -newDy;
        newY = 0;
      }

      if (
        newY >= canvasHeight - PADDLE_HEIGHT - BALL_SIZE &&
        newX + BALL_SIZE >= paddleX &&
        newX <= paddleX + PADDLE_WIDTH
      ) {
        newDy = -Math.abs(newDy);
        const hitPos = (newX + BALL_SIZE / 2 - paddleX) / PADDLE_WIDTH;
        newDx = (hitPos - 0.5) * 8;
      }

      setBricks(prevBricks => {
        let bricksHit = false;
        const newBricks = prevBricks.map(brick => {
          if (
            !brick.visible ||
            newX + BALL_SIZE < brick.x ||
            newX > brick.x + canvasWidth / BRICK_COLS - BRICK_GAP ||
            newY + BALL_SIZE < brick.y ||
            newY > brick.y + BRICK_HEIGHT
          ) {
            return brick;
          }
          bricksHit = true;
          setScore(s => s + 10);
          return { ...brick, visible: false };
        });

        if (bricksHit) {
          newDy = -newDy;
        }

        return newBricks;
      });

      if (newY >= canvasHeight) {
        setLives(l => {
          if (l <= 1) {
            setGameOver(true);
            return 0;
          }
          return l - 1;
        });
        return { x: canvasWidth / 2, y: canvasHeight - 100, dx: 3, dy: -3 };
      }

      if (bricks.every(b => !b.visible)) {
        setWon(true);
      }

      return { x: newX, y: newY, dx: newDx, dy: newDy };
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameOver, won, isPaused, paddleX, canvasWidth, bricks]);

  useEffect(() => {
    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameLoop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'p' || e.key === 'P') {
        setIsPaused(p => !p);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const resetGame = () => {
    setPaddleX(150);
    setBall({ x: 200, y: 300, dx: 3, dy: -3 });
    setBricks(initBricks());
    setScore(0);
    setLives(3);
    setGameOver(false);
    setWon(false);
    setIsPaused(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    movePaddle(e.clientX, rect);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex items-center gap-8 mb-2">
        <h2 className="font-display text-2xl font-bold text-white neon-glow">打砖块</h2>
        <div className="bg-[#1a1a2e] px-4 py-2 rounded-lg neon-border">
          <span className="text-gray-400 text-sm">分数</span>
          <p className="font-display text-xl text-[#fbbf24] neon-glow-gold">{score}</p>
        </div>
        <div className="bg-[#1a1a2e] px-4 py-2 rounded-lg neon-border-cyan">
          <span className="text-gray-400 text-sm">生命</span>
          <p className="font-display text-xl text-[#ef4444]">{lives}</p>
        </div>
        {isPaused && <span className="text-[#ec4899] neon-glow-pink font-display">已暂停</span>}
      </div>

      <div
        className="relative rounded-lg neon-border overflow-hidden cursor-none"
        style={{ width: canvasWidth, height: canvasHeight }}
        onMouseMove={handleMouseMove}
      >
        <div className="absolute inset-0 bg-[#0f0f23]">
          {bricks.map((brick, i) =>
            brick.visible && (
              <div
                key={i}
                className="absolute rounded transition-all"
                style={{
                  left: brick.x,
                  top: brick.y,
                  width: canvasWidth / BRICK_COLS - BRICK_GAP,
                  height: BRICK_HEIGHT,
                  backgroundColor: brick.color,
                  boxShadow: `0 0 10px ${brick.color}80`,
                }}
              />
            )
          )}

          <div
            className="absolute rounded-full"
            style={{
              left: ball.x,
              top: ball.y,
              width: BALL_SIZE,
              height: BALL_SIZE,
              backgroundColor: '#fff',
              boxShadow: '0 0 15px #fff',
            }}
          />

          <div
            className="absolute rounded-lg"
            style={{
              left: paddleX,
              top: canvasHeight - PADDLE_HEIGHT,
              width: PADDLE_WIDTH,
              height: PADDLE_HEIGHT,
              background: 'linear-gradient(180deg, #8b5cf6, #ec4899)',
              boxShadow: '0 0 20px #8b5cf680',
            }}
          />
        </div>

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <p className="font-display text-2xl text-[#ef4444] neon-glow mb-4">游戏结束</p>
            <p className="text-gray-400 mb-4">最终分数: {score}</p>
            <button
              onClick={resetGame}
              className="px-6 py-2 bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] rounded-lg font-bold hover:scale-105 transition"
            >
              再来一局
            </button>
          </div>
        )}

        {won && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <p className="font-display text-2xl text-[#fbbf24] neon-glow-gold mb-4">你赢了！</p>
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

      <p className="text-gray-500 text-xs">移动鼠标控制挡板 | 按 P 暂停</p>
    </div>
  );
};

export default GameBrickBreaker;
