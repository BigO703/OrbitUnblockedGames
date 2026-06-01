import React from 'react';
import { motion } from 'motion/react';
import { Star, Gamepad, Heart, Trash } from 'lucide-react';
import LucideIcon from './LucideIcon';

export default function GameCard({ game, isFavorite, onSelect, onToggleFavorite, onDeleteCustom }) {
  return (
    <motion.div
      layoutId={`card-${game.id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      whileHover={{ y: -3 }}
      className="bg-[#0f172a] border border-[#1e293b] rounded-none overflow-hidden hover:border-[#38bdf8] transition-all flex flex-col h-full group relative"
    >
      {/* Visual cover card graphic placeholder */}
      <div 
        onClick={onSelect}
        className="h-32 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617] flex items-center justify-center relative cursor-pointer transition-all overflow-hidden border-b border-[#1e293b]"
      >
        {/* Retro style style grid design lines */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px]"></div>
        
        {/* Sky geometric line overlay footer */}
        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-sky-400/0 via-sky-450/40 to-sky-400/0"></div>

        {/* Dynamic center icon overlay */}
        <div className="p-3 bg-[#020617]/80 rounded-none border border-[#1e293b] transition-all text-slate-400 group-hover:text-sky-400 group-hover:border-sky-500/50 group-hover:scale-105">
          <LucideIcon name={game.icon} size={28} />
        </div>

        {/* Hover quick play action button flag overlay */}
        <div className="absolute inset-0 bg-slate-950/75 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
          <span className="px-4 py-1.5 bg-sky-400 text-[#020617] text-[10px] font-black uppercase tracking-widest rounded-none flex items-center gap-1.5 shadow-lg">
            <Gamepad size={12} fill="currentColor" /> CORE.START
          </span>
        </div>

        {/* Top bar rating badge overlay */}
        <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-none bg-[#020617]/90 border border-[#1e293b] text-[9px] text-slate-300 font-mono flex items-center gap-1">
          <Star size={9} className="text-sky-400" fill="currentColor" /> {game.rating.toFixed(1)}
        </span>

        {/* Category tag badges */}
        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-none bg-[#020617]/90 border border-[#1e293b] text-[8px] text-sky-400 uppercase tracking-widest font-mono font-bold">
          {game.category}
        </span>
      </div>

      {/* Title & Description Details */}
      <div className="p-4 flex flex-col flex-grow bg-[#0f172a]">
        <div className="flex items-start justify-between gap-1 mb-2">
          <h4 
            onClick={onSelect}
            className="font-black text-white text-sm hover:text-sky-400 tracking-tight transition-all cursor-pointer truncate max-w-[170px] uppercase"
            title={game.title}
          >
            {game.title}
          </h4>

          {/* Action Row */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Delete button (only for user-created custom items) */}
            {game.isCustom && onDeleteCustom && (
              <button
                type="button"
                onClick={(e) => onDeleteCustom(game.id, e)}
                className="p-1 rounded-none hover:bg-slate-800 text-slate-550 hover:text-rose-400 transition-all border border-[#1e293b]"
                title="Delete this custom game link"
              >
                <Trash size={11} />
              </button>
            )}

            {/* Favorite toggle button */}
            <button
              type="button"
              onClick={onToggleFavorite}
              className={`p-1 rounded-none border transition-all ${
                isFavorite
                  ? 'bg-pink-500/10 border-pink-500/20 text-pink-400'
                  : 'bg-[#020617] border-[#1e293b] text-slate-500 hover:text-pink-400 hover:border-slate-700'
              }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Heart size={11} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed flex-grow mb-4 font-sans">
          {game.description}
        </p>

        {/* Footer Statistics */}
        <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between text-[9px] text-slate-500 font-mono uppercase tracking-wider">
          <span className="truncate max-w-[110px]">{game.developer || 'OPEN PORT'}</span>
          <span>{game.plays.toLocaleString()} PLAYS</span>
        </div>
      </div>
    </motion.div>
  );
}
