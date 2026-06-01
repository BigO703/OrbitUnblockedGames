import React, { useState, useEffect } from 'react';
import { Shield, Check } from 'lucide-react';

export const CLOAK_PRESETS = [
  {
    id: 'normal',
    name: 'Normal (None)',
    title: 'Unblocked Games Hub',
    iconUrl: 'https://img.icons8.com/color/48/game-controller.png',
  },
  {
    id: 'gdocs',
    name: 'Google Docs',
    title: 'Focus Proposal.docx - Google Docs',
    iconUrl: 'https://ssl.gstatic.com/docs/documents/images/kix-favicon-2023.ico',
  },
  {
    id: 'gclassroom',
    name: 'Google Classroom',
    title: 'Classes - Google Classroom',
    iconUrl: 'https://ssl.gstatic.com/classroom/favicon.png',
  },
  {
    id: 'gdrive',
    name: 'Google Drive',
    title: 'My Drive - Google Drive',
    iconUrl: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png',
  },
  {
    id: 'canvas',
    name: 'Canvas LMS',
    title: 'Dashboard - Canvas LMS',
    iconUrl: 'https://canvas.instructure.com/favicon.ico',
  },
];

export default function CamoSettings({ onClose }) {
  const [activePreset, setActivePreset] = useState(() => {
    return localStorage.getItem('games_camo_preset') || 'normal';
  });

  const [panicKey, setPanicKey] = useState(() => {
    return localStorage.getItem('games_panic_key') || '`';
  });

  const [panicRedirect, setPanicRedirect] = useState(() => {
    return localStorage.getItem('games_panic_redirect') || 'https://classroom.google.com';
  });

  const [listeningForKey, setListeningForKey] = useState(false);

  // Apply cloaking effect whenever active preset changes
  useEffect(() => {
    const preset = CLOAK_PRESETS.find(p => p.id === activePreset) || CLOAK_PRESETS[0];
    localStorage.setItem('games_camo_preset', activePreset);
    
    // Apply Title
    if (activePreset === 'normal') {
      document.title = 'Unblocked Games Hub';
    } else {
      document.title = preset.title;
    }

    // Apply Favicon
    let favicon = document.querySelector("link[rel~='icon']");
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.getElementsByTagName('head')[0].appendChild(favicon);
    }
    favicon.href = preset.iconUrl;
  }, [activePreset]);

  // Key listening effect for panic redirection
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Don't trigger panic if typing inside inputs
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key === panicKey) {
        window.location.href = panicRedirect;
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [panicKey, panicRedirect]);

  // Listener code for assigning new key
  useEffect(() => {
    if (!listeningForKey) return;

    const handleKeyAssign = (e) => {
      e.preventDefault();
      // Block standard navigation interrupts but save key
      setPanicKey(e.key);
      localStorage.setItem('games_panic_key', e.key);
      setListeningForKey(false);
    };

    window.addEventListener('keydown', handleKeyAssign);
    return () => window.removeEventListener('keydown', handleKeyAssign);
  }, [listeningForKey]);

  const savePanicSettings = (url) => {
    setPanicRedirect(url);
    localStorage.setItem('games_panic_redirect', url);
  };

  return (
    <div className="bg-[#0f172a] border border-[#1e293b] rounded-none p-6 shadow-2xl space-y-6 max-w-md w-full font-sans">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-500/10 text-sky-400 rotate-45 border border-sky-500/20">
            <Shield size={20} className="-rotate-45" />
          </div>
          <div className="pl-2">
            <h3 className="font-extrabold text-white text-md uppercase tracking-wider">Camo & Cloaking</h3>
            <p className="text-[11px] text-slate-400 uppercase tracking-widest font-mono">LOBBY MASK UTILITY</p>
          </div>
        </div>
      </div>

      <hr className="border-[#1e293b]" />

      {/* Preset selection */}
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-sky-400 rotate-45"></span> TAB CLOAK PRESETS
        </label>
        <p className="text-xs text-slate-400 mb-2">
          Change the browser tab title and favicon immediately in classroom.
        </p>
        <div className="grid grid-cols-1 gap-2">
          {CLOAK_PRESETS.map((preset) => {
            const isSelected = activePreset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => setActivePreset(preset.id)}
                className={`flex items-center justify-between p-3 rounded-none border text-left transition-all ${
                  isSelected
                    ? "bg-sky-500/10 border-sky-400 text-white font-semibold"
                    : "bg-[#020617] border-[#1e293b] text-slate-400 hover:border-slate-700 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={preset.iconUrl}
                    alt={preset.name}
                    className="w-4 h-4 object-contain rounded-none"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.src = 'https://img.icons8.com/color/48/game-controller.png';
                    }}
                  />
                  <div>
                    <span className="text-xs font-bold block">{preset.name}</span>
                    <span className="text-[10px] text-slate-500 truncate block max-w-[220px] font-mono">
                      {preset.title}
                    </span>
                  </div>
                </div>
                {isSelected && (
                  <div className="h-4 w-4 bg-sky-400 text-slate-950 flex items-center justify-center font-bold text-[9px] rotate-45">
                    <Check size={10} className="-rotate-45" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-[#1e293b]" />

      {/* Panic Key Setup */}
      <div className="space-y-4">
        <div>
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-sky-400 rotate-45"></span> PANIC KEY REDIRECTION
          </label>
          <p className="text-xs text-slate-400 mt-1">
            Hit this key anytime to instantly redirect your active classroom window.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#020617] p-3 rounded-none border border-[#1e293b] flex flex-col justify-between space-y-2">
            <span className="text-[9px] text-slate-500 uppercase font-black font-mono">PANIC HOTKEY</span>
            <button
              type="button"
              onClick={() => setListeningForKey(true)}
              className={`py-1.5 px-3 rounded-none text-xs font-mono font-black transition-all text-center ${
                listeningForKey
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse'
                  : 'bg-slate-800 text-sky-400 border border-slate-700 hover:bg-slate-700'
              }`}
            >
              {listeningForKey ? 'WAITING...' : panicKey === ' ' ? 'SPACE' : panicKey.toUpperCase()}
            </button>
          </div>

          <div className="bg-[#020617] p-3 rounded-none border border-[#1e293b] flex flex-col justify-between space-y-2">
            <span className="text-[9px] text-slate-500 uppercase font-black font-mono">PRESETS</span>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => setPanicKey('`')}
                className={`py-1 text-[10px] rounded-none transition-all text-center border font-mono ${
                  panicKey === '`' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30 font-bold' : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
                }`}
              >
                Backquote (`)
              </button>
              <button
                type="button"
                onClick={() => setPanicKey('Escape')}
                className={`py-1 text-[10px] rounded-none transition-all text-center border font-mono ${
                  panicKey === 'Escape' ? 'bg-sky-500/10 text-sky-400 border-sky-500/30 font-bold' : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
                }`}
              >
                Escape (Esc)
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] text-slate-500 uppercase font-bold font-mono block">REDIRECT PATH TARGET</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={panicRedirect}
              onChange={(e) => savePanicSettings(e.target.value)}
              placeholder="https://..."
              className="bg-[#020617] border border-[#1e293b] rounded-none px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500 grow font-mono"
            />
            <button
              type="button"
              onClick={() => savePanicSettings('https://classroom.google.com')}
              className="px-3 py-1.5 rounded-none bg-slate-800 hover:bg-slate-705 text-xs text-slate-300 border border-slate-700 font-mono font-bold"
              title="Reset to Google Classroom"
            >
              DEFAULT
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#020617] border border-[#1e293b] p-3 rounded-none flex items-start gap-2.5">
        <span className="text-sky-400 text-xs font-black">●</span>
        <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
          Press the <strong className="text-sky-400 font-mono">[{panicKey}]</strong> hotkey at any time to activate. Immediately triggers navigation to <span className="font-mono underline text-slate-300 break-all">{panicRedirect}</span>.
        </p>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-sky-400 hover:bg-sky-300 text-slate-950 font-black rounded-none text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-sky-500/10"
        >
          Save & Apply Cloak Custom
        </button>
      )}
    </div>
  );
}
