import React, { useState, useEffect, useCallback, useRef } from 'react';

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const BIRD_SIZE = 34;
const PIPE_WIDTH = 60;
const PIPE_GAP = 150;
const PIPE_SPEED = 3;
const GRAVITY = 0.5;
const JUMP_FORCE = -8;

const GameFlappyBird: React.FC = () => {
  const [birdY, setBirdY] = useState(CANVAS_HEIGHT / 2 - BIRD_SIZE / 2);
  const [birdVelocity, setBirdVelocity] = useState(0);
  const [pipes, setPipes] = useState<{ x: number; topHeight: number; passed?: boolean }[]>([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const gameLoopRef = useRef<number>();
  const scoreRef = useRef(0);

  const jump = useCallback(() => {
    if (gameOver) return;
    setBirdVelocity(JUMP_FORCE);
  }, [gameOver]);

  const startGame = useCallback(() => {
    setBirdY(CANVAS_HEIGHT / 2 - BIRD_SIZE / 2);
    setBirdVelocity(0);
    setPipes([{ x: CANVAS_WIDTH, topHeight: Math.random() * (CANVAS_HEIGHT / 2 - PIPE_GAP) + 50 }]);
    setScore(0);
    scoreRef.current = 0;
    setGameOver(false);
    setIsStarted(true);
  }, []);

  useEffect(() => {
    if (!isStarted || gameOver) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStarted, gameOver, jump]);

  useEffect(() => {
    if (!isStarted || gameOver) return;

    const gameLoop = () => {
      setBirdVelocity(v => v + GRAVITY);
      setBirdY(y => {
        const newY = y + birdVelocity;
        if (newY >= CANVAS_HEIGHT - BIRD_SIZE || newY <= 0) {
          setGameOver(true);
          return Math.max(0, Math.min(CANVAS_HEIGHT - BIRD_SIZE, newY));
        }
        return newY;
      });

      setPipes(prevPipes => {
        const newPipes = prevPipes
          .map(pipe => ({ ...pipe, x: pipe.x - PIPE_SPEED }))
          .filter(pipe => pipe.x > -PIPE_WIDTH);

        const birdX = CANVAS_WIDTH / 3;
        const birdCenterY = birdY + BIRD_SIZE / 2;

        for (const pipe of prevPipes) {
          if (
            birdX + BIRD_SIZE > pipe.x &&
            birdX < pipe.x + PIPE_WIDTH &&
            (birdCenterY - BIRD_SIZE / 2 < pipe.topHeight ||
              birdCenterY + BIRD_SIZE / 2 > pipe.topHeight + PIPE_GAP)
          ) {
            setGameOver(true);
          }

          if (pipe.x + PIPE_WIDTH < birdX && !pipe.passed) {
            scoreRef.current += 1;
            setScore(scoreRef.current);
            pipe.passed = true;
          }
        }

        const lastPipe = newPipes[newPipes.length - 1];
        if (!lastPipe || lastPipe.x < CANVAS_WIDTH - 200) {
          newPipes.push({
            x: CANVAS_WIDTH,
            topHeight: Math.random() * (CANVAS_HEIGHT / 2 - PIPE_GAP) + 50,
          });
        }

        return newPipes;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    gameLoopRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, [isStarted, gameOver, birdVelocity, birdY]);

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex items-center gap-8 mb-2">
        <h2 className="font-display text-2xl font-bold text-white neon-glow">飞翔的小鸟</h2>
        <div className="bg-[#1a1a2e] px-4 py-2 rounded-lg neon-border">
          <span className="text-gray-400 text-sm">分数</span>
          <p className="font-display text-xl text-[#fbbf24] neon-glow-gold">{score}</p>
        </div>
      </div>

      <div
        className="relative rounded-lg neon-border overflow-hidden cursor-pointer"
        style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}
        onClick={() => {
          if (!isStarted) startGame();
          else jump();
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #87CEEB 0%, #98D8C8 50%, #90EE90 100%)',
          }}
        >
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#228B22]" />
        </div>

        {pipes.map((pipe, i) => (
          <React.Fragment key={i}>
            <div
              className="absolute"
              style={{
                left: pipe.x,
                top: 0,
                width: PIPE_WIDTH,
                height: pipe.topHeight,
                background: 'linear-gradient(90deg, #32CD32, #228B22)',
                borderBottom: `4px solid #006400`,
              }}
            />
            <div
              className="absolute"
              style={{
                left: pipe.x,
                top: pipe.topHeight + PIPE_GAP,
                width: PIPE_WIDTH,
                height: CANVAS_HEIGHT - pipe.topHeight - PIPE_GAP - 80,
                background: 'linear-gradient(90deg, #32CD32, #228B22)',
                borderTop: `4px solid #006400`,
              }}
            />
          </React.Fragment>
        ))}

        <div
          className="absolute transition-transform"
          style={{
            left: CANVAS_WIDTH / 3 - BIRD_SIZE / 2,
            top: birdY,
            width: BIRD_SIZE,
            height: BIRD_SIZE,
          }}
        >
          <svg viewBox="0 0 34 34" className="w-full h-full">
            <circle cx="17" cy="17" r="15" fill="#FFD700" />
            <circle cx="22" cy="14" r="3" fill="#000" />
            <circle cx="23" cy="13" r="1" fill="#fff" />
            <path d="M 28 17 L 34 17 L 28 20 Z" fill="#FF6B00" />
            <path d="M 10 8 Q 17 0 24 8" stroke="#FF6B00" strokeWidth="2" fill="none" />
          </svg>
        </div>

        {!isStarted && (
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
            <p className="font-display text-2xl text-white neon-glow mb-6">飞翔的小鸟</p>
            <p className="text-white/80 mb-4">点击屏幕或按空格开始</p>
            <button
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="px-8 py-3 bg-gradient-to-r from-[#fbbf24] to-[#f97316] rounded-lg font-bold text-black hover:scale-105 transition"
            >
              开始游戏
            </button>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center">
            <p className="font-display text-2xl text-[#ef4444] neon-glow mb-4">游戏结束</p>
            <p className="text-white text-xl mb-2">得分: {score}</p>
            <button
              onClick={(e) => { e.stopPropagation(); startGame(); }}
              className="px-6 py-2 bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] rounded-lg font-bold hover:scale-105 transition mt-4"
            >
              再来一局
            </button>
          </div>
        )}
      </div>

      <p className="text-gray-500 text-xs">点击屏幕或按空格键让小鸟向上飞</p>
    </div>
  );
};

export default GameFlappyBird;
