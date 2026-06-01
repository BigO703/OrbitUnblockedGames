import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { 
  Maximize2, RotateCcw, Heart, Star, 
  Info, Gamepad, Award, BookOpen, ShieldAlert,
  ChevronLeft, Layout, Plus, Trash
} from 'lucide-react';
import LucideIcon from './LucideIcon';

export default function GamePlayer({ game, isFavorite, onToggleFavorite, onBackToDirectory }) {
  const [cinemaMode, setCinemaMode] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [iframeKey, setIframeKey] = useState(0); // For reloading the game
  const [hasLoaded, setHasLoaded] = useState(false);
  
  // Local high scores & personal diaries
  const [records, setRecords] = useState([]);
  const [newScore, setNewScore] = useState('');
  const [newNotes, setNewNotes] = useState('');
  
  const iframeContainerRef = useRef(null);
  const panicRedirect = localStorage.getItem('games_panic_redirect') || 'https://classroom.google.com';

  // Load local score logs for this specific game
  useEffect(() => {
    const saved = localStorage.getItem(`scores_${game.id}`);
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        setRecords([]);
      }
    } else {
      setRecords([]);
    }
    setHasLoaded(false);
  }, [game]);

  const handleAddRecord = (e) => {
    e.preventDefault();
    if (!newScore.trim()) return;

    const newRec = {
      id: crypto.randomUUID(),
      score: newScore,
      notes: newNotes,
      date: new Date().toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    const updated = [newRec, ...records];
    setRecords(updated);
    localStorage.setItem(`scores_${game.id}`, JSON.stringify(updated));
    setNewScore('');
    setNewNotes('');
  };

  const handleDeleteRecord = (id) => {
    const updated = records.filter(r => r.id !== id);
    setRecords(updated);
    localStorage.setItem(`scores_${game.id}`, JSON.stringify(updated));
  };

  const handleReload = () => {
    setIframeKey(prev => prev + 1);
    setHasLoaded(false);
  };

  const toggleFullscreen = () => {
    if (iframeContainerRef.current) {
      if (!document.fullscreenElement) {
        iframeContainerRef.current.requestFullscreen().catch((err) => {
          alert(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  // Immediate escape panic button click
  const triggerPanic = () => {
    window.location.href = panicRedirect;
  };

  return (
    <div className={`transition-all duration-300 ${cinemaMode ? 'bg-[#020617] p-2 md:p-6' : 'bg-transparent'}`}>
      {/* Upper Action Bar */}
      <div className={`flex flex-wrap items-center justify-between mb-4 gap-3 ${cinemaMode ? 'max-w-6xl mx-auto' : ''}`}>
        <button
          onClick={onBackToDirectory}
          className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400 hover:text-white bg-[#0f172a] border border-[#1e293b] rounded-none transition-all uppercase font-mono font-bold tracking-wider"
        >
          <ChevronLeft size={14} className="text-sky-400" /> EXIT TO LOBBY
        </button>

        {/* Sneaky Panic Overlay Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={triggerPanic}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-black tracking-wider uppercase rounded-none transition-all shadow-md group relative cursor-pointer"
          >
            <ShieldAlert size={13} className="animate-pulse" />
            <span>PANIC ACTIVATOR</span>
            <div className="absolute top-full right-0 mt-2 bg-[#0f172a] border border-[#1e293b] text-[9px] text-slate-400 p-2 rounded-none hidden group-hover:block z-50 whitespace-nowrap shadow-xl font-mono">
              [ALT MESH] EXIT FRAME WINDOW INSTANTLY
            </div>
          </button>

          <button
            onClick={() => setCinemaMode(!cinemaMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-none border font-mono uppercase font-bold tracking-wider transition-all ${
              cinemaMode 
                ? 'bg-sky-505/10 border-sky-400 text-sky-400' 
                : 'bg-[#0f172a] border-[#1e293b] text-slate-400 hover:text-white'
            }`}
          >
            <Layout size={13} />
            <span>{cinemaMode ? 'Disable Theatre' : 'Theatre Screen'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 ${cinemaMode ? 'max-w-6xl mx-auto' : ''}`}>
        
        {/* Play Port Component */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div 
            ref={iframeContainerRef}
            className="relative aspect-video w-full bg-[#020617] rounded-none border border-[#1e293b] shadow-2xl flex flex-col group overflow-hidden"
            style={{ minHeight: '450px' }}
          >
            {/* Status indicator during loading */}
            {!hasLoaded && (
              <div className="absolute inset-0 bg-[#020617] flex flex-col items-center justify-center text-center p-6 z-10">
                <div className="relative mb-4">
                  <div className="w-10 h-10 border-2 border-sky-400/20 border-t-sky-400 rounded-none animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Gamepad className="text-sky-400 text-xs animate-bounce" size={14} />
                  </div>
                </div>
                <h4 className="text-xs font-black uppercase text-white tracking-widest mb-1">CONNECTING SIMULATOR PORT...</h4>
                <p className="text-[10px] uppercase font-mono text-slate-500 max-w-xs leading-relaxed">
                  Securing active unblocked frame from sandbox nodes.
                </p>
                
                {/* Instant force skip loads indicator */}
                <button 
                  onClick={() => setHasLoaded(true)}
                  className="mt-4 px-3 py-1 bg-[#0f172a] border border-[#1e293b] text-[9px] uppercase font-mono text-slate-350 hover:text-white transition-all rounded-none"
                >
                  Force Render Wrapper Frame
                </button>
              </div>
            )}

            {/* Sandbox iframe wrapper */}
            <iframe
              key={iframeKey}
              src={game.iframeUrl}
              className="w-full grow h-full border-0 bg-[#020617]"
              title={game.title}
              onLoad={() => setHasLoaded(true)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
              sandbox="allow-same-origin allow-scripts allow-pointer-lock allow-forms allow-popups"
            />

            {/* In-Arcade Control Footer */}
            <div className="bg-[#0f172a] border-t border-[#1e293b] px-4 py-3 flex items-center justify-between text-slate-400 text-xs backdrop-blur-sm">
              <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-wider">
                <span className="w-2 h-2 bg-sky-400 rotate-45 animate-pulse"></span>
                <span className="font-extrabold text-white">{game.title}</span>
                {game.isCustom && (
                  <span className="text-[8px] bg-sky-500/10 text-sky-400 font-bold px-1.5 py-0.5 rounded-none border border-sky-400/20">
                    USER ADDED
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleReload}
                  className="p-1 px-2.5 bg-[#020617] border border-[#1e293b] text-slate-300 hover:text-white hover:border-sky-505 rounded-none transition-all flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold"
                  title="Reload Game Iframe"
                >
                  <RotateCcw size={10} />
                  <span>RESTAGE</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleFavorite(game.id)}
                  className={`p-1 px-2.5 bg-[#020617] border rounded-none transition-all flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold ${
                    isFavorite 
                      ? 'border-pink-500/30 text-pink-400 bg-pink-500/5' 
                      : 'border-[#1e293b] text-slate-400 hover:text-pink-400 hover:border-slate-700'
                  }`}
                  title={isFavorite ? "Remove Fav" : "Bookmark Game"}
                >
                  <Heart size={10} fill={isFavorite ? "currentColor" : "none"} />
                  <span>{isFavorite ? 'SAVED' : 'FAVORITE'}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="p-1 px-2.5 bg-[#020617] border border-[#1e293b] text-slate-355 hover:text-white hover:border-sky-505 rounded-none transition-all flex items-center gap-1.5 text-[10px] font-mono uppercase font-bold"
                  title="Fullscreen Game"
                >
                  <Maximize2 size={10} />
                  <span>FULLSCREEN</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick controls help panel inside main stream */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-none p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-sky-400 text-sm mt-0.5 font-bold font-mono">▶</span>
              <div>
                <h5 className="text-[11px] font-black uppercase text-slate-200 tracking-wider">Lobby Sandbox Execution Notice</h5>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                  Click directly inside the window frame above to activate input mapping focus. All game variables run fully unblocked.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 self-end md:self-auto shrink-0 text-[10px] text-slate-500 bg-[#020617] border border-[#1e293b] px-3 py-1 font-mono uppercase tracking-wider">
              <span>RATING SCORE:</span>
              <span className="text-yellow-400 font-extrabold flex items-center gap-0.5">
                <Star size={10} fill="currentColor" /> {game.rating.toFixed(1)}
              </span>
            </div>
          </div>
        </div>

        {/* Sidebar Tabs & Information Panel */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="bg-[#0f172a] w-full rounded-none border border-[#1e293b] text-white overflow-hidden shadow-xl">
            {/* Tab Headers */}
            <div className="flex border-b border-[#1e293b] bg-[#020617]">
              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className={`flex-1 py-3 text-center text-[10px] uppercase tracking-widest font-black border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'info'
                    ? 'border-sky-450 text-white bg-sky-500/5'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Info size={12} /> DETAILS
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('controls')}
                className={`flex-1 py-3 text-center text-[10px] uppercase tracking-widest font-black border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'controls'
                    ? 'border-sky-450 text-white bg-sky-500/5'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Gamepad size={12} /> CONTROLS
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tracker')}
                className={`flex-1 py-3 text-center text-[10px] uppercase tracking-widest font-black border-b-2 transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'tracker'
                    ? 'border-sky-450 text-white bg-sky-500/5'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Award size={12} /> RECORD LOG
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-5 min-h-[350px] flex flex-col bg-[#0f172a]">
              
              {/* Tab 1: Info */}
              {activeTab === 'info' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] bg-sky-500/10 text-sky-400 border border-sky-550/20 font-mono font-bold px-2 py-0.5 uppercase tracking-widest">
                      {game.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {game.plays.toLocaleString()} SEEDING PLAYS
                    </span>
                  </div>

                  <h3 className="text-md font-black text-white uppercase flex items-center gap-2">
                    <LucideIcon name={game.icon} className="text-sky-400" size={16} />
                    {game.title}
                  </h3>

                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    {game.description}
                  </p>

                  <div className="pt-2">
                    <div className="bg-[#020617] p-3 border border-[#1e293b] space-y-1">
                      <span className="text-slate-500 text-[9px] font-bold block uppercase tracking-widest font-mono">
                        SERVER SOURCE CONTRIB
                      </span>
                      <p className="text-slate-300 font-bold text-xs uppercase font-mono">{game.developer || 'Open Source Port'}</p>
                    </div>
                  </div>

                  <div className="pt-2 bg-sky-400/5 border border-sky-505/10 p-3">
                    <h5 className="text-[10px] font-black text-sky-400 flex items-center gap-1 uppercase tracking-widest font-mono">
                      <BookOpen size={11} /> Sandbox Safe Port
                    </h5>
                    <p className="text-[10.5px] text-slate-400 mt-1 leading-relaxed font-sans">
                      This game sandbox is strictly isolated from parent container frames. Adware and background analytic networks remain blocked during session life.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: Controls */}
              {activeTab === 'controls' && (
                <div className="space-y-4 animate-fadeIn flex flex-col h-full grow">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest font-mono block">
                      CELL MOVEMENT KEYBOARD MAPPINGS
                    </span>
                    <p className="text-xs text-slate-400">
                      Standard keyboard layouts map down to these commands:
                    </p>
                  </div>

                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 grow">
                    {game.controls?.map((control, idx) => (
                      <div 
                        key={idx} 
                        className="p-2.5 bg-[#020617] border border-[#1e293b] text-xs font-mono text-slate-300 flex items-start gap-1.5"
                      >
                        <span className="text-sky-400 font-bold mt-0.5">▪</span>
                        <span>{control}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-[#020617] p-3 border border-[#1e293b] flex items-center gap-2.5 text-[9.5px] text-slate-500 leading-tight uppercase font-mono tracking-wider mt-auto">
                    <span className="text-sky-450">●</span>
                    <span>Supports direct WebGamepad mapping coordinates, in supported browser nodes.</span>
                  </div>
                </div>
              )}

              {/* Tab 3: Tracker */}
              {activeTab === 'tracker' && (
                <div className="space-y-4 flex flex-col h-full grow animate-fadeIn">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest font-mono block">
                      PERSONAL LEDGER RECORDS
                    </span>
                    <p className="text-xs text-slate-400">
                      Locally catalog your custom scores on this computer.
                    </p>
                  </div>

                  {/* Submission Form */}
                  <form onSubmit={handleAddRecord} className="space-y-2 bg-[#020617] p-3 border border-[#1e293b]">
                    <div className="grid grid-cols-1 gap-2">
                      <input
                        type="text"
                        placeholder="SCORE/RECORD (e.g. 5,020 points)"
                        value={newScore}
                        onChange={(e) => setNewScore(e.target.value)}
                        className="bg-[#0f172a] border border-[#1e293b] rounded-none px-2.5 py-1.5 text-xs text-white uppercase font-mono placeholder-slate-600 focus:outline-none focus:border-sky-505"
                        required
                      />
                      <input
                        type="text"
                        placeholder="CAMPAIGN NOTES (e.g. Speedrun 2min)"
                        value={newNotes}
                        onChange={(e) => setNewNotes(e.target.value)}
                        className="bg-[#0f172a] border border-[#1e293b] rounded-none px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-505 font-mono text-[11px]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-1.5 bg-sky-450 hover:bg-sky-450 text-[#020617] text-[10px] font-black uppercase tracking-wider rounded-none transition-all flex items-center justify-center gap-1"
                    >
                      <Plus size={12} /> ENTER RECORD
                    </button>
                  </form>

                  {/* Saved List */}
                  <div className="space-y-2 min-h-0 overflow-y-auto max-h-[160px] pr-1">
                    {records.length === 0 ? (
                      <div className="py-8 text-center text-[10px] text-slate-500 border border-dashed border-[#1e293b] rounded-none flex flex-col items-center justify-center gap-1.5 uppercase font-mono">
                        <Award size={16} className="text-slate-750" />
                        <span>NO HIGH SCORES SAVED YET.</span>
                      </div>
                    ) : (
                      records.map((rec) => (
                        <div 
                          key={rec.id} 
                          className="bg-[#020617] border border-[#1e293b] p-2.5 flex items-start justify-between gap-2 group hover:border-slate-700 transition-all text-xs"
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-sky-400 font-mono text-xs">{rec.score}</span>
                              <span className="text-[8.5px] text-slate-550 font-mono tracking-wider uppercase">{rec.date}</span>
                            </div>
                            {rec.notes && (
                              <p className="text-[10px] text-slate-400 font-mono leading-relaxed">{rec.notes}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteRecord(rec.id)}
                            className="p-1 text-slate-605 hover:text-rose-450 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                            title="Delete record"
                          >
                            <Trash size={10} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
