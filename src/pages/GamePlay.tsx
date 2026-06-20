import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Maximize2, Minimize2, Home } from 'lucide-react';
import { games } from '../data/games';
import { Game2048, GameTetris, GameSnake, GameBrickBreaker, GameFlappyBird } from '../games';

const gameComponents: Record<string, React.FC> = {
  '2048': Game2048,
  'tetris': GameTetris,
  'snake': GameSnake,
  'brickbreaker': GameBrickBreaker,
  'flappybird': GameFlappyBird,
};

const GamePlay: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const gameContainerRef = React.useRef<HTMLDivElement>(null);

  const game = games.find(g => g.id === id);
  const GameComponent = id ? gameComponents[id] : null;

  const toggleFullscreen = async () => {
    if (!gameContainerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await gameContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.log('Fullscreen error:', err);
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!game || !GameComponent) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-3xl text-white neon-glow mb-4">游戏未找到</h1>
          <Link
            to="/"
            className="px-6 py-3 bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] rounded-xl text-white font-bold hover:scale-105 transition"
          >
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f23] flex flex-col">
      <header className="flex-shrink-0 bg-[#0f0f23]/90 backdrop-blur-md border-b border-[#8b5cf6]/20">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 py-2 bg-[#1a1a2e] rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <Home className="w-4 h-4" />
            </button>
            <div>
              <h1 className="font-display text-lg text-white">{game.nameCn}</h1>
              <p className="text-xs text-gray-400">{game.category} · 游戏进行中</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(`/game/${id}`)}
              className="hidden sm:flex items-center gap-2 px-3 py-2 bg-[#1a1a2e] rounded-lg text-gray-400 hover:text-white transition-colors"
            >
              <span className="text-sm">游戏详情</span>
            </button>
            <button
              onClick={toggleFullscreen}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] rounded-lg text-white hover:scale-105 transition"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              <span className="hidden sm:inline text-sm">{isFullscreen ? '退出全屏' : '全屏'}</span>
            </button>
          </div>
        </div>
      </header>

      <main
        ref={gameContainerRef}
        className="flex-1 flex items-center justify-center p-4 overflow-auto"
      >
        <div className="bg-[#1a1a2e] rounded-2xl p-4 md:p-6">
          <GameComponent />
        </div>
      </main>
    </div>
  );
};

export default GamePlay;
