import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Gamepad2, Zap, Coffee, Puzzle, Crosshair, Car } from 'lucide-react';
import { games, categories, GameCategory } from '../data/games';

const iconMap: Record<string, React.ReactNode> = {
  Gamepad2: <Gamepad2 className="w-4 h-4" />,
  Zap: <Zap className="w-4 h-4" />,
  Coffee: <Coffee className="w-4 h-4" />,
  Puzzle: <Puzzle className="w-4 h-4" />,
  Crosshair: <Crosshair className="w-4 h-4" />,
  Car: <Car className="w-4 h-4" />,
};

const Home: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<GameCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGames = games.filter(game => {
    const matchesCategory = selectedCategory === 'all' || game.category === selectedCategory;
    const matchesSearch = game.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      game.nameCn.includes(searchQuery);
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen gradient-bg">
      <header className="sticky top-0 z-50 bg-[#0f0f23]/90 backdrop-blur-md border-b border-[#8b5cf6]/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] flex items-center justify-center transform group-hover:scale-110 transition">
                <span className="font-display font-black text-xl text-white">99</span>
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold text-white neon-glow">9999</h1>
                <p className="text-xs text-[#8b5cf6]">小游戏</p>
              </div>
            </Link>

            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索游戏..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#1a1a2e] border border-[#8b5cf6]/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#8b5cf6] focus:ring-2 focus:ring-[#8b5cf6]/20 transition"
                />
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <span className="text-gray-400 text-sm">精选游戏</span>
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse" />
                <span className="text-[#22c55e] text-sm font-medium">{games.length}款游戏</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <aside className="hidden lg:block w-48 flex-shrink-0">
            <div className="sticky top-24 bg-[#1a1a2e]/50 backdrop-blur rounded-2xl p-4 neon-border">
              <h3 className="font-display text-sm text-gray-400 mb-4 px-2">游戏分类</h3>
              <nav className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`category-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                      selectedCategory === category.id
                        ? 'active'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {iconMap[category.icon]}
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <main className="flex-1">
            <div className="mb-6">
              <h2 className="font-display text-xl text-white mb-1">
                {selectedCategory === 'all' ? '全部游戏' : categories.find(c => c.id === selectedCategory)?.name}
              </h2>
              <p className="text-gray-400 text-sm">
                共 {filteredGames.length} 款游戏
              </p>
            </div>

            {filteredGames.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-20 h-20 rounded-full bg-[#1a1a2e] flex items-center justify-center mb-4">
                  <Search className="w-10 h-10 text-gray-600" />
                </div>
                <p className="text-gray-400 text-lg">未找到匹配的游戏</p>
                <p className="text-gray-500 text-sm mt-1">换个关键词试试吧</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredGames.map((game, index) => (
                  <Link
                    key={game.id}
                    to={`/game/${game.id}`}
                    className="game-card game-grid-item animate-slide-up opacity-0 bg-[#1a1a2e] rounded-2xl overflow-hidden group cursor-pointer"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={game.cover}
                        alt={game.nameCn}
                        className="game-card-image w-full h-full object-cover transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://via.placeholder.com/300x200/1a1a2e/8b5cf6?text=${encodeURIComponent(game.nameCn)}`;
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute top-2 right-2">
                        <span className="px-2 py-1 text-xs font-medium bg-[#8b5cf6]/80 text-white rounded-full backdrop-blur">
                          {categories.find(c => c.id === game.category)?.name}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-display text-lg text-white group-hover:text-[#8b5cf6] transition-colors">
                        {game.nameCn}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                        {game.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      <footer className="border-t border-[#8b5cf6]/20 mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8b5cf6] to-[#ec4899] flex items-center justify-center">
                <span className="font-display font-black text-sm text-white">99</span>
              </div>
              <span className="text-gray-400 text-sm">9999小游戏 · 经典重现</span>
            </div>
            <p className="text-gray-500 text-xs">
              © 2024 9999小游戏 · 仅供娱乐
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
