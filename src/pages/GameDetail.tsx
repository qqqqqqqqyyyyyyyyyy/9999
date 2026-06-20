import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Play, Info, Keyboard, Mouse, Move } from 'lucide-react';
import { games, categories } from '../data/games';

const GameDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const game = games.find(g => g.id === id);

  if (!game) {
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

  const categoryName = categories.find(c => c.id === game.category)?.name;

  return (
    <div className="min-h-screen gradient-bg">
      <header className="sticky top-0 z-50 bg-[#0f0f23]/90 backdrop-blur-md border-b border-[#8b5cf6]/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">返回</span>
            </button>
            <div className="flex-1" />
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] flex items-center justify-center">
                <span className="font-display font-black text-xs text-white">99</span>
              </div>
              <span className="font-display text-lg text-white neon-glow">9999</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="relative group">
              <div className="aspect-video rounded-2xl overflow-hidden neon-border">
                <img
                  src={game.cover}
                  alt={game.nameCn}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://via.placeholder.com/400x225/1a1a2e/8b5cf6?text=${encodeURIComponent(game.nameCn)}`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <span className="px-3 py-1.5 text-sm font-medium bg-[#8b5cf6]/80 text-white rounded-full backdrop-blur">
                  {categoryName}
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-center">
              <h1 className="font-display text-4xl font-bold text-white neon-glow mb-4">
                {game.nameCn}
              </h1>
              <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                {game.description}
              </p>

              <div className="bg-[#1a1a2e]/50 backdrop-blur rounded-2xl p-6 neon-border mb-6">
                <h3 className="font-display text-sm text-gray-400 mb-4 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  游戏说明
                </h3>
                <ul className="space-y-3">
                  {game.instructions.map((instruction, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300">
                      <span className="w-6 h-6 rounded-full bg-[#8b5cf6]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-[#8b5cf6] text-sm font-bold">{i + 1}</span>
                      </span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => navigate(`/play/${game.id}`)}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-[#8b5cf6] to-[#ec4899] rounded-xl text-white font-display text-lg font-bold hover:scale-105 transition-all neon-glow"
              >
                <Play className="w-6 h-6" />
                开始游戏
              </button>
            </div>
          </div>

          <div className="mt-12">
            <h2 className="font-display text-xl text-white mb-6">操作方式</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-[#1a1a2e]/30 backdrop-blur rounded-xl p-5 border border-[#8b5cf6]/10 hover:border-[#8b5cf6]/30 transition">
                <div className="w-12 h-12 rounded-xl bg-[#8b5cf6]/20 flex items-center justify-center mb-4">
                  <Keyboard className="w-6 h-6 text-[#8b5cf6]" />
                </div>
                <h3 className="font-medium text-white mb-1">键盘控制</h3>
                <p className="text-gray-400 text-sm">使用方向键或WASD进行操作</p>
              </div>
              <div className="bg-[#1a1a2e]/30 backdrop-blur rounded-xl p-5 border border-[#ec4899]/10 hover:border-[#ec4899]/30 transition">
                <div className="w-12 h-12 rounded-xl bg-[#ec4899]/20 flex items-center justify-center mb-4">
                  <Mouse className="w-6 h-6 text-[#ec4899]" />
                </div>
                <h3 className="font-medium text-white mb-1">鼠标操作</h3>
                <p className="text-gray-400 text-sm">部分游戏支持鼠标点击和移动</p>
              </div>
              <div className="bg-[#1a1a2e]/30 backdrop-blur rounded-xl p-5 border border-[#06b6d4]/10 hover:border-[#06b6d4]/30 transition">
                <div className="w-12 h-12 rounded-xl bg-[#06b6d4]/20 flex items-center justify-center mb-4">
                  <Move className="w-6 h-6 text-[#06b6d4]" />
                </div>
                <h3 className="font-medium text-white mb-1">触屏支持</h3>
                <p className="text-gray-400 text-sm">移动设备点击屏幕操作</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GameDetail;
