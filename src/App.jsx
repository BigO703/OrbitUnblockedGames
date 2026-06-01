import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, Shield, Plus, Heart, Gamepad2, 
  Sparkles, Layers, SlidersHorizontal
} from 'lucide-react';
import defaultGames from './data/games.json';
import GameCard from './components/GameCard';
import GamePlayer from './components/GamePlayer';
import CamoSettings, { CLOAK_PRESETS } from './components/CamoSettings';

export default function App() {
  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState(null);
  
  // Local states
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [sortBy, setSortBy] = useState('plays');
  
  // Favorites storage
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('games_favorites_list');
    return saved ? JSON.parse(saved) : [];
  });

  // Dialog overlays toggle
  const [showCamoModal, setShowCamoModal] = useState(false);

  // High Stats Banner
  const [totalPlayCounter, setTotalPlayCounter] = useState(0);

  // Tab Load Cloaking Trigger
  useEffect(() => {
    const savedPresetId = localStorage.getItem('games_camo_preset') || 'normal';
    const preset = CLOAK_PRESETS.find(p => p.id === savedPresetId) || CLOAK_PRESETS[0];
    
    // Apply Title
    if (savedPresetId === 'normal') {
      document.title = 'Unblocked Games Hub';
    } else {
      document.title = preset.title;
    }

    // Apply Favicon URL
    let favicon = document.querySelector("link[rel~='icon']");
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(favicon);
    }
    favicon.href = preset.iconUrl;
  }, []);

  // Global Panic key listener
  useEffect(() => {
    const handlePanicKey = (e) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      const savedPanicKey = localStorage.getItem('games_panic_key') || '`';
      const redirectUrl = localStorage.getItem('games_panic_redirect') || 'https://classroom.google.com';

      if (e.key === savedPanicKey) {
        window.location.href = redirectUrl;
      }
    };

    window.addEventListener('keydown', handlePanicKey);
    return () => window.removeEventListener('keydown', handlePanicKey);
  }, []);

  // Re-load initial list and local-added list
  useEffect(() => {
    const loadGamesList = () => {
      const customSaved = localStorage.getItem('games_user_custom_list');
      let customGames = [];
      if (customSaved) {
        try {
          customGames = JSON.parse(customSaved);
        } catch (e) {
          customGames = [];
        }
      }
      
      const allMerged = [...defaultGames, ...customGames];
      setGames(allMerged);

      // Sum all simulated play count
      const sumPlays = allMerged.reduce((acc, current) => acc + current.plays, 0);
      setTotalPlayCounter(sumPlays);
    };

    loadGamesList();
  }, []);

  // Save favorites to storage
  const handleToggleFavorite = (id) => {
    const updated = favorites.includes(id)
      ? favorites.filter(favId => favId !== id)
      : [...favorites, id];
    
    setFavorites(updated);
    localStorage.setItem('games_favorites_list', JSON.stringify(updated));
  };

  // Add custom unblocked URL
  const handleAddCustomGame = (newGame) => {
    const customSaved = localStorage.getItem('games_user_custom_list');
    let customGames = [];
    if (customSaved) {
      try {
        customGames = JSON.parse(customSaved);
      } catch (e) {
        customGames = [];
      }
    }
    const updatedCustoms = [...customGames, newGame];
    localStorage.setItem('games_user_custom_list', JSON.stringify(updatedCustoms));
    
    // Update main state array
    setGames(prev => [...prev, newGame]);
  };

  // Delete custom added game item
  const handleDeleteCustomGame = (id, e) => {
    e.stopPropagation(); // Avoid triggering card click selection
    
    const customSaved = localStorage.getItem('games_user_custom_list');
    if (!customSaved) return;

    try {
      const customGames = JSON.parse(customSaved);
      const filteredCustoms = customGames.filter(g => g.id !== id);
      localStorage.setItem('games_user_custom_list', JSON.stringify(filteredCustoms));
      
      // Update games array without reload
      setGames(prev => prev.filter(g => g.id !== id));
      if (selectedGame?.id === id) {
        setSelectedGame(null);
      }
    } catch (_) {}
  };

  const handleSelectGame = (game) => {
    // Increment local plays
    const updatedGames = games.map(g => {
      if (g.id === game.id) {
        return { ...g, plays: g.plays + 1 };
      }
      return g;
    });
    setGames(updatedGames);
    setSelectedGame({ ...game, plays: game.plays + 1 });
  };

  // Pre-filter variables
  const categoriesList = ['All', 'Arcade', 'Puzzle', 'Strategy', 'Classic', 'Creative', 'Favorites'];

  const filteredGames = games
    .filter(g => {
      // Category matches
      if (activeCategory === 'All') return true;
      if (activeCategory === 'Favorites') return favorites.includes(g.id);
      if (activeCategory === 'Custom') return g.isCustom === true;
      return g.category.toLowerCase() === activeCategory.toLowerCase();
    })
    .filter(g => {
      // Search matches
      if (!search.trim()) return true;
      const term = search.toLowerCase();
      return g.title.toLowerCase().includes(term) || g.description.toLowerCase().includes(term);
    })
    .sort((a, b) => {
      // Apply Sort Options
      if (sortBy === 'plays') return b.plays - a.plays;
      if (sortBy === 'rating') return b.rating - a.rating;
      return a.title.localeCompare(b.title);
    });

  // Hourly Dynamic Greeting
  const getDailyGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'GOOD MORNING, PLAYER!';
    if (hour < 18) return 'WELCOME BACK, PLAYER!';
    return 'GOOD EVENING, PLAYER!';
  };

  const panicRedirect = localStorage.getItem('games_panic_redirect') || 'https://classroom.google.com';

  return (
    <div className="min-h-screen bg-[#020617] text-[#f1f5f9] font-sans flex flex-col antialiased">
      
      {/* Top Header Navigation bar */}
      <header className="border-b border-[#1e293b] bg-[#020617]/95 sticky top-0 backdrop-blur-xl z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div 
            onClick={() => setSelectedGame(null)}
            className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-all select-none"
          >
            <div className="p-2 bg-sky-400 text-[#020617] rounded-none rotate-45 flex items-center justify-center">
              <Gamepad2 size={18} className="-rotate-45" />
            </div>
            <div className="pl-1">
              <span className="font-black text-sm tracking-widest text-white uppercase block">
                UNBLOCKED<span className="text-sky-400 ml-1.5 px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 font-black text-[9px]">HUB</span>
              </span>
              <p className="text-[9px] text-slate-500 font-mono tracking-wider uppercase">SECURE SANDBOX EMULATION STATION</p>
            </div>
          </div>

          {/* Quick Config Button Row */}
          <div className="flex items-center gap-2">
            {/* Quick manual emergency panic bar trigger */}
            <button
              onClick={() => window.location.href = panicRedirect}
              className="py-1.5 px-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest rounded-none flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
              title="Instantly exit page to classroom search page"
            >
              <span className="w-1.5 h-1.5 rounded-none bg-white animate-ping"></span>
              <span className="hidden sm:inline">PANIC EXIT</span>
            </button>

            {/* Custom school cloaker settings */}
            <button
              onClick={() => setShowCamoModal(true)}
              className="p-1.5 px-3 rounded-none bg-[#0f172a] border border-[#1e293b] hover:text-sky-400 hover:border-sky-500/50 hover:bg-slate-900 text-slate-400 transition-all flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider"
              title="Setup tab cloaking mask"
            >
              <Shield size={12} />
              <span className="hidden md:inline font-bold">Cloaker</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Layout Wrapper */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grow flex flex-col w-full">
        <AnimatePresence mode="wait">
          {selectedGame ? (
            // Full play screen panel
            <motion.div
              key="player-view"
              initial={{ opacity: 0, scale: 0.99 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.15 }}
              className="w-full"
            >
              <GamePlayer
                game={selectedGame}
                isFavorite={favorites.includes(selectedGame.id)}
                onToggleFavorite={handleToggleFavorite}
                onBackToDirectory={() => setSelectedGame(null)}
              />
            </motion.div>
          ) : (
            // Central Games Directory grids selector
            <motion.div
              key="directory-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 flex flex-col"
            >
              {/* Daily Hero Banner Card */}
              <div className="bg-[#0f172a] border border-[#1e293b] rounded-none relative p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
                {/* Background grid line balance effect */}
                <div className="absolute top-0 right-0 w-[40%] h-full opacity-10 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-sky-400 via-transparent to-transparent"></div>
                <div className="absolute inset-0 opacity-5 pointer-events-none bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:16px_16px]"></div>

                <div className="space-y-2.5 relative z-10 max-w-xl">
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] bg-sky-505/10 text-sky-400 font-mono tracking-widest font-extrabold uppercase px-2 py-0.5 rounded-none border border-sky-400/20 flex items-center gap-1">
                      <span className="w-1 h-1 bg-sky-400 rotate-45 inline-block"></span> OFFLINE STATE CACHED
                    </span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-black text-white tracking-tight uppercase">
                    {getDailyGreeting()}
                  </h1>
                  <p className="text-slate-400 text-xs leading-relaxed max-w-md font-sans">
                    Execute robust emulation nodes immediately within safe school network sandboxes. Keep stats records locally and toggle camo masks easily.
                  </p>
                </div>

                {/* Simulated quick dashboard values */}
                <div className="grid grid-cols-3 gap-2.5 lg:w-96 relative z-10">
                  <div className="bg-[#020617] p-2.5 rounded-none border border-[#1e293b] text-center">
                    <span className="text-slate-500 text-[8px] block font-mono font-black uppercase tracking-wider">INDEX SLOTS</span>
                    <span className="text-base md:text-lg font-black text-white mt-0.5 block font-mono">
                      {games.length}
                    </span>
                  </div>
                  <div className="bg-[#020617] p-2.5 rounded-none border border-[#1e293b] text-center">
                    <span className="text-slate-500 text-[8px] block font-mono font-black uppercase tracking-wider">SAVED FAVS</span>
                    <span className="text-base md:text-lg font-black text-pink-500 mt-0.5 block font-mono">
                      {favorites.length}
                    </span>
                  </div>
                  <div className="bg-[#020617] p-2.5 rounded-none border border-[#1e293b] text-center">
                    <span className="text-slate-500 text-[8px] block font-mono font-black uppercase tracking-wider">LOBBY PLAYS</span>
                    <span className="text-base md:text-lg font-black text-sky-400 mt-0.5 block font-mono">
                      {(totalPlayCounter + favorites.length).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Categorization and filters row */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between pt-2">
                {/* Scrollable Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                  {categoriesList.map((cat) => {
                    const isActive = activeCategory.toLowerCase() === cat.toLowerCase();
                    return (
                      <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-3.5 py-1.5 text-[10px] uppercase font-black rounded-none border whitespace-nowrap transition-all flex items-center gap-1.5 tracking-wider cursor-pointer ${
                          isActive
                            ? 'bg-sky-400 border-sky-400 text-[#020617] font-black'
                            : 'bg-[#0f172a] border-[#1e293b] text-slate-400 hover:text-white hover:border-slate-650'
                        }`}
                      >
                        {cat === 'All' && <Layers size={11} />}
                        {cat === 'Favorites' && <Heart size={11} fill={isActive ? "currentColor" : "none"} className={isActive ? "text-[#020617]" : "text-pink-400"} />}
                        {cat === 'Custom' && <Plus size={11} />}
                        {cat !== 'All' && cat !== 'Favorites' && cat !== 'Custom' && <Sparkles size={11} />}
                        <span>{cat}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Sorter Dropdown Selection */}
                <div className="flex items-center gap-2 w-full md:w-auto shrink-0 self-end md:self-auto justify-end">
                  <div className="text-slate-500 text-[10px] flex items-center gap-1 uppercase font-mono font-black">
                    <SlidersHorizontal size={11} />
                    <span>SORT FILTER:</span>
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-[#0f172a] border border-[#1e293b] text-[10px] text-slate-350 font-black px-2.5 py-1.5 rounded-none focus:outline-none focus:border-sky-450 uppercase font-mono cursor-pointer"
                  >
                    <option value="plays">MOST PLAYED SLOTS</option>
                    <option value="rating">TOP CRITIC RATINGS</option>
                    <option value="title">ALPHABETICAL (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Grid search query inputs */}
              <div className="relative">
                <Search className="absolute left-3.5 top-3 text-slate-500" size={14} />
                <input
                  type="text"
                  placeholder="Query unblocked sandbox indexes (Classic Pac Doodle, 2048, Game portal slots)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#0f172a] border border-[#1e293b] rounded-none pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-505 shadow-inner"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-2.5 text-[8px] text-slate-400 hover:text-white bg-[#020617] border border-[#1e293b] px-2 py-0.5 rounded-none font-mono uppercase font-black"
                  >
                    RESET
                  </button>
                )}
              </div>

              {/* Infinite Main Directory Grid list */}
              <AnimatePresence mode="popLayout">
                {filteredGames.length > 0 ? (
                  <motion.div 
                    layout
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                  >
                    {filteredGames.map((game) => (
                      <div key={game.id}>
                        <GameCard
                          game={game}
                          isFavorite={favorites.includes(game.id)}
                          onSelect={() => handleSelectGame(game)}
                          onToggleFavorite={(e) => {
                            e.stopPropagation(); // Avoid card click
                            handleToggleFavorite(game.id);
                          }}
                          onDeleteCustom={handleDeleteCustomGame}
                        />
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  // Empty results feedback panel
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="py-16 text-center text-slate-500 border border-dashed border-[#1e293b] rounded-none max-w-sm mx-auto w-full flex flex-col items-center justify-center p-6 space-y-4"
                  >
                    <div className="p-4 bg-[#0f172a] border border-[#1e293b] text-slate-605">
                      <Gamepad2 size={24} className="text-sky-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-black text-xs uppercase tracking-wider">No Lobby items Found</h4>
                      <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                        We could not find any sandbox games matching the active query or filter index.
                      </p>
                    </div>
                    {search && (
                      <button
                        onClick={() => {
                          setSearch('');
                          setActiveCategory('All');
                        }}
                        className="px-3 py-1.5 bg-[#0f172a] border border-[#1e293b] text-slate-300 hover:text-white rounded-none text-[10px] font-mono uppercase font-bold"
                      >
                        RESET FILTERS
                      </button>
                    )}
                    {activeCategory === 'Favorites' && !search && (
                      <p className="text-[10px] text-slate-500 font-mono tracking-wide">
                        Tip: Open any game and click the <span className="text-pink-400 font-bold">♥ Favorite</span> button to bookmark here.
                      </p>
                    )}

                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer layout parameters */}
      <footer className="mt-auto border-t border-[#1e293b] text-slate-600 py-6 text-center text-[10px] bg-[#020617] uppercase tracking-wide">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="leading-relaxed font-mono">
            Unblocked Games Hub is an open port directory designed for static offline emulation tests. Sourced via static frames.
          </p>
          <div className="flex justify-center items-center gap-3 text-slate-500 font-mono">
            <span>Decoy Active: <strong className="text-sky-400 font-mono">TRUE</strong></span>
            <span>•</span>
            <span>Emergency Hotkey Redirect: <strong className="text-sky-400 font-mono">[{localStorage.getItem('games_panic_key') || '`'}]</strong></span>
          </div>
        </div>
      </footer>

      {/* Camo Settings Overlay Modal */}
      {showCamoModal && (
        <div className="fixed inset-0 z-50 bg-[#020617]/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setShowCamoModal(false)}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.98, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative z-10 w-full max-w-md"
          >
            <CamoSettings onClose={() => setShowCamoModal(false)} />
          </motion.div>
        </div>
      )}

    </div>
  );
}
