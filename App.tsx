
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LanderGame from './components/LanderGame';
import { PLANETS, GAME_CONSTANTS, SKINS } from './constants';
import { PlanetConfig, GameState, Skin, PlanetType } from './types';
import { Trophy, Flame, RotateCcw, Play, Rocket, Grid, Settings, Lock, Unlock, Menu, ChevronLeft, Sliders, Monitor, Check, Trash2, Gauge, Zap, Info, User, Terminal } from 'lucide-react';

const App: React.FC = () => {
  // --- STATE ---
  const [view, setView] = useState<'onboarding' | 'menu' | 'game' | 'hangar' | 'custom' | 'settings'>('onboarding');
  const [activePlanet, setActivePlanet] = useState<PlanetConfig>(PLANETS.moon);
  const [selectedSkinId, setSelectedSkinId] = useState<string>('default');
  
  // User Identity
  const [playerName, setPlayerName] = useState<string>('');
  const [showBriefing, setShowBriefing] = useState<boolean>(false);

  // Custom Planet Builder State
  const [customGravity, setCustomGravity] = useState<number>(5.0);
  
  // Persistence State
  const [highScores, setHighScores] = useState<Record<string, number>>({});

  // Screen Fit / Safe Zone State (Percentages 0-20)
  const [safePadding, setSafePadding] = useState<{x: number, y: number}>({ x: 0, y: 0 });

  // Game Settings
  const [isRealismMode, setIsRealismMode] = useState<boolean>(false);

  // --- DERIVED STATE ---
  const careerScore = useMemo(() => {
    return Object.values(highScores).reduce((acc: number, curr: number) => acc + curr, 0);
  }, [highScores]);

  const selectedSkin = useMemo(() => 
    SKINS.find(s => s.id === selectedSkinId) || SKINS[0], 
  [selectedSkinId]);

  const activePlanetConfig = useMemo(() => {
      if (activePlanet.id === 'custom') {
          return { ...activePlanet, gravity: customGravity };
      }
      return activePlanet;
  }, [activePlanet, customGravity]);

  const [gameState, setGameState] = useState<GameState>({
    isPlaying: false,
    isGameOver: false,
    landedSafely: false,
    score: 0,
    fuel: GAME_CONSTANTS.INITIAL_FUEL,
    message: ''
  });

  // --- EFFECTS ---
  useEffect(() => {
    try {
      // Identity Check
      const savedName = localStorage.getItem('odyssey_username');
      if (savedName) {
        setPlayerName(savedName);
        setView('menu');
      } else {
        setView('onboarding');
      }

      const savedScores = localStorage.getItem('odyssey_scores');
      if (savedScores) setHighScores(JSON.parse(savedScores));
      
      const savedSkin = localStorage.getItem('odyssey_skin');
      if (savedSkin) setSelectedSkinId(savedSkin);

      const savedPadding = localStorage.getItem('odyssey_safe_padding');
      if (savedPadding) setSafePadding(JSON.parse(savedPadding));

      const savedRealism = localStorage.getItem('odyssey_realism');
      if (savedRealism) setIsRealismMode(JSON.parse(savedRealism));
    } catch (e) {
      console.error("Failed to load save data", e);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    
    localStorage.setItem('odyssey_username', playerName.trim());
    setView('menu');
    setShowBriefing(true);
  };

  const saveScore = (planetId: string, score: number) => {
    setHighScores(prev => {
      const currentHigh = prev[planetId] || 0;
      if (score > currentHigh) {
        const newState = { ...prev, [planetId]: score };
        localStorage.setItem('odyssey_scores', JSON.stringify(newState));
        return newState;
      }
      return prev;
    });
  };

  const selectSkin = (skinId: string) => {
      setSelectedSkinId(skinId);
      localStorage.setItem('odyssey_skin', skinId);
  };

  const updateSafePadding = (axis: 'x' | 'y', value: number) => {
      const newPadding = { ...safePadding, [axis]: value };
      setSafePadding(newPadding);
      localStorage.setItem('odyssey_safe_padding', JSON.stringify(newPadding));
  };

  const toggleRealismMode = () => {
      const newVal = !isRealismMode;
      setIsRealismMode(newVal);
      localStorage.setItem('odyssey_realism', JSON.stringify(newVal));
  };

  const resetProgress = () => {
      if (window.confirm("ARE YOU SURE?\n\nThis will permanently delete all high scores, lock skins, and reset your commander profile.")) {
          setHighScores({});
          localStorage.removeItem('odyssey_scores');
          
          setSelectedSkinId('default');
          localStorage.setItem('odyssey_skin', 'default');
          
          setPlayerName('');
          localStorage.removeItem('odyssey_username');
          setView('onboarding');
      }
  };

  // --- GAME LOGIC ---
  const startGame = (planet: PlanetConfig) => {
    setActivePlanet(planet);
    setGameState({
      isPlaying: true,
      isGameOver: false,
      landedSafely: false,
      score: 0,
      fuel: GAME_CONSTANTS.INITIAL_FUEL,
      message: ''
    });
    setView('game');
  };

  const handleGameOver = useCallback((score: number, landed: boolean) => {
    setGameState(prev => ({
      ...prev,
      isPlaying: false,
      isGameOver: true,
      landedSafely: landed,
      score: score,
      message: landed ? 'TOUCHDOWN CONFIRMED' : 'CRITICAL FAILURE'
    }));

    if (landed) {
      saveScore(activePlanetConfig.id, score);
    }
  }, [activePlanetConfig]);

  const returnToMenu = () => {
      setGameState(prev => ({ ...prev, isPlaying: false, isGameOver: false }));
      setView('menu');
  };

  // --- RENDER HELPERS ---
  const renderStars = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50 z-0">
       {[...Array(20)].map((_, i) => (
         <div key={i} className="absolute bg-white rounded-full" 
              style={{
                width: Math.random() * 3 + 'px', 
                height: Math.random() * 3 + 'px',
                top: Math.random() * 100 + '%', 
                left: Math.random() * 100 + '%'
              }} 
         />
       ))}
    </div>
  );

  // Helper for applying safe zones
  const safeZoneStyle = {
      paddingTop: `${safePadding.y}%`,
      paddingBottom: `${safePadding.y}%`,
      paddingLeft: `${safePadding.x}%`,
      paddingRight: `${safePadding.x}%`
  };

  // --- COMPONENTS ---
  
  const MissionBriefingModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
        <div className="bg-slate-900 border border-cyan-500/50 rounded-2xl p-6 max-w-lg w-full shadow-[0_0_50px_rgba(6,182,212,0.2)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"></div>
            
            <div className="flex items-start gap-4 mb-6">
                <div className="bg-cyan-500/20 p-3 rounded-lg border border-cyan-500/30">
                    <Info className="text-cyan-400" size={32} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-white tracking-tight">MISSION BRIEFING</h2>
                    <p className="text-cyan-400/80 font-mono text-xs uppercase tracking-widest">Physics 101: Forces & Motion</p>
                </div>
            </div>

            <div className="space-y-4 text-slate-300 mb-8 max-h-[60vh] overflow-y-auto pr-2">
                <p>Welcome to Newton's Odyssey, <strong className="text-white">Commander {playerName}</strong>.</p>
                
                <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                    <h3 className="text-white font-bold mb-3 text-sm uppercase flex items-center gap-2">
                        <Rocket size={14} className="text-yellow-500"/> Forces in Balance (Year 7)
                    </h3>
                    <ul className="space-y-3 text-sm">
                        <li className="flex gap-3">
                            <div className="w-1 h-full bg-slate-700 rounded-full"></div>
                            <div>
                                <strong className="text-white block">Gravity (Weight)</strong>
                                <span className="text-slate-400">A constant force pulling your lander down.</span>
                            </div>
                        </li>
                        <li className="flex gap-3">
                            <div className="w-1 h-full bg-orange-500 rounded-full"></div>
                            <div>
                                <strong className="text-white block">Thrust</strong>
                                <span className="text-slate-400">The upward force from your engine that you control.</span>
                            </div>
                        </li>
                        <li className="bg-slate-900 p-2 rounded text-xs border border-slate-700 mt-1">
                            <strong>Resultant Force:</strong> If Thrust &gt; Weight, you slow down. If Weight &gt; Thrust, you speed up downwards.
                        </li>
                    </ul>
                </div>

                <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800">
                    <h3 className="text-white font-bold mb-2 text-sm uppercase flex items-center gap-2">
                        <Trophy size={14} className="text-yellow-500"/> Mission Scoring
                    </h3>
                    <p className="text-sm">
                        Efficiency is key. Your high score is calculated based on:
                    </p>
                    <div className="flex items-center gap-2 mt-2 font-mono text-xs">
                        <span className="bg-green-900/30 text-green-400 px-2 py-1 rounded border border-green-900/50">Low Landing Speed</span> 
                        <span>+</span>
                        <span className="bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded border border-yellow-900/50">Remaining Fuel</span>
                    </div>
                </div>
            </div>

            <button 
                onClick={() => setShowBriefing(false)}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg group"
            >
                <span>ACKNOWLEDGE</span>
                <ChevronLeft className="rotate-180 group-hover:translate-x-1 transition-transform" size={20} />
            </button>
        </div>
    </div>
  );

  // --- VIEWS ---

  // 0. ONBOARDING
  if (view === 'onboarding') {
    return (
        <div className="w-full h-[100dvh] bg-slate-950 text-white flex flex-col items-center justify-center relative overflow-hidden">
             {renderStars()}
             <div className="relative z-10 w-full max-w-sm p-6 space-y-8" style={safeZoneStyle}>
                <div className="text-center space-y-2">
                    <div className="inline-flex items-center justify-center p-4 bg-cyan-500/10 rounded-full border border-cyan-500/30 mb-4 animate-pulse">
                        <Rocket size={40} className="text-cyan-400" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter">SYSTEM LOGIN</h1>
                    <p className="text-slate-400 text-sm">Please identify yourself, Commander.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Callsign</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input 
                                type="text"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                placeholder="ENTER NAME..."
                                className="w-full bg-slate-900 border-2 border-slate-800 focus:border-cyan-500 rounded-xl py-4 pl-12 pr-4 text-lg font-mono text-white outline-none transition-all placeholder:text-slate-700"
                                maxLength={12}
                                autoFocus
                            />
                        </div>
                    </div>
                    <button 
                        type="submit"
                        disabled={!playerName.trim()}
                        className="w-full bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(8,145,178,0.3)]"
                    >
                        <Terminal size={20} /> INITIALIZE SYSTEM
                    </button>
                </form>
             </div>
        </div>
    );
  }

  // 1. MAIN MENU
  if (view === 'menu') {
    return (
      <div className="w-full h-[100dvh] bg-slate-950 text-white overflow-hidden relative">
        {renderStars()}
        {showBriefing && <MissionBriefingModal />}
        
        <div className="w-full h-full flex flex-col" style={safeZoneStyle}>
            <header className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-md p-4 border-b border-slate-800 flex justify-between items-center shadow-lg rounded-b-xl mx-2 mt-2">
            <div className="flex items-center gap-3">
                <div className="bg-cyan-500 p-2 rounded-lg">
                    <Rocket className="text-black" size={24} />
                </div>
                <div>
                    <h1 className="font-black tracking-tighter text-lg text-cyan-400 leading-none uppercase">Commander {playerName}</h1>
                    <div className="text-[10px] text-slate-400 font-mono uppercase tracking-widest">Odyssey Sys.</div>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                <div className="flex flex-col items-end hidden sm:flex">
                    <span className="text-[10px] text-slate-500 uppercase font-bold">Career Score</span>
                    <span className="font-mono text-yellow-500 font-bold text-lg">{careerScore.toLocaleString()}</span>
                </div>
                <button 
                    onClick={() => setShowBriefing(true)}
                    className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-cyan-400 transition-colors border border-slate-700"
                    aria-label="Mission Info"
                >
                    <Info size={20} />
                </button>
                <button 
                    onClick={() => setView('settings')}
                    className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors border border-slate-700"
                >
                    <Settings size={20} />
                </button>
            </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto space-y-6 pb-20 w-full">
                
                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                    <button 
                    onClick={() => setView('hangar')}
                    className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex items-center justify-between group hover:border-cyan-500 transition-all"
                    >
                        <div className="flex flex-col items-start">
                            <span className="text-slate-400 text-xs font-bold uppercase">Hangar</span>
                            <span className="font-bold text-white group-hover:text-cyan-400">Skins</span>
                        </div>
                        <Settings className="text-slate-600 group-hover:text-cyan-400" />
                    </button>
                    <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col justify-center">
                        <span className="text-slate-400 text-xs font-bold uppercase">Active Vessel</span>
                        <span className="font-bold text-cyan-400 truncate">{selectedSkin.name}</span>
                    </div>
                </div>

                {/* Mode Indicator */}
                {isRealismMode && (
                    <div className="bg-orange-900/20 border border-orange-500/30 p-3 rounded-lg flex items-center gap-3">
                        <Gauge className="text-orange-500" size={20} />
                        <div>
                            <h3 className="text-orange-400 font-bold text-sm">REALISM MODE ACTIVE</h3>
                            <p className="text-orange-300/70 text-xs">Thrust gradient enabled. Inertia is increased.</p>
                        </div>
                    </div>
                )}

                {/* Planet Grid */}
                <div className="space-y-2">
                    <h2 className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <Grid size={14} /> Mission Select
                    </h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Standard Planets */}
                        {Object.values(PLANETS).map(p => (
                            <button 
                                key={p.id}
                                onClick={() => startGame(p)}
                                className="relative overflow-hidden bg-slate-900 border border-slate-800 rounded-2xl p-6 text-left hover:border-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all group"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <div className="w-24 h-24 rounded-full" style={{backgroundColor: p.color}}></div>
                                </div>
                                
                                <h3 className="text-2xl font-black text-white mb-1">{p.name}</h3>
                                <p className="text-slate-400 text-sm mb-4">Gravity: {p.gravity} m/s²</p>
                                
                                <div className="flex items-center gap-2 bg-slate-950/50 p-2 rounded-lg w-fit">
                                    <Trophy size={14} className="text-yellow-600" />
                                    <span className="font-mono text-yellow-500 font-bold">
                                        {highScores[p.id] || 0}
                                    </span>
                                </div>
                            </button>
                        ))}

                        {/* Custom Planet Button */}
                        <button 
                            onClick={() => setView('custom')}
                            className="bg-slate-900/50 border-2 border-dashed border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/50 transition-all"
                        >
                            <Sliders size={32} />
                            <span className="font-bold uppercase tracking-wider">Custom Surface</span>
                        </button>
                    </div>
                </div>
            </main>
        </div>
      </div>
    );
  }

  // 2. SETTINGS
  if (view === 'settings') {
      return (
        <div className="w-full h-[100dvh] bg-slate-950 text-white flex flex-col relative overflow-hidden">
            <div className="absolute inset-0 grid grid-cols-[repeat(20,1fr)] grid-rows-[repeat(20,1fr)] opacity-10 pointer-events-none">
                 {[...Array(400)].map((_, i) => <div key={i} className="border border-slate-700"></div>)}
            </div>
            
            <div className="w-full h-full flex flex-col" style={safeZoneStyle}>
                <div className="flex-1 border-4 border-dashed border-slate-800 rounded-xl relative flex flex-col overflow-hidden">
                    
                    <header className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center gap-4 rounded-t-lg shrink-0">
                        <button onClick={() => setView('menu')} className="p-2 hover:bg-slate-800 rounded-lg">
                            <ChevronLeft />
                        </button>
                        <h2 className="font-bold text-lg flex items-center gap-2"><Settings size={20}/> Settings</h2>
                    </header>

                    <main className="flex-1 p-6 overflow-y-auto">
                        <div className="max-w-md mx-auto space-y-8">
                            
                            {/* Identity */}
                            <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800 backdrop-blur-sm space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <User className="text-cyan-400" />
                                    <h3 className="font-bold text-lg">Commander Identity</h3>
                                </div>
                                <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-700">
                                    <span className="text-slate-400 text-sm">Callsign</span>
                                    <span className="font-mono text-white font-bold">{playerName}</span>
                                </div>
                            </div>

                            {/* Screen Fit */}
                            <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800 backdrop-blur-sm space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <Monitor className="text-cyan-400" />
                                    <h3 className="font-bold text-lg">Screen Calibration</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <label className="font-bold text-slate-300">Horizontal Padding</label>
                                            <span className="font-mono text-cyan-400">{safePadding.x}%</span>
                                        </div>
                                        <input 
                                            type="range" min="0" max="20" step="1" 
                                            value={safePadding.x} 
                                            onChange={(e) => updateSafePadding('x', parseInt(e.target.value))}
                                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <label className="font-bold text-slate-300">Vertical Padding</label>
                                            <span className="font-mono text-cyan-400">{safePadding.y}%</span>
                                        </div>
                                        <input 
                                            type="range" min="0" max="20" step="1" 
                                            value={safePadding.y} 
                                            onChange={(e) => updateSafePadding('y', parseInt(e.target.value))}
                                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 italic">Adjust sliders until the border is fully visible on your screen.</p>
                                </div>
                            </div>

                            {/* Game Mode */}
                            <div className="bg-slate-900/80 p-6 rounded-xl border border-slate-800 backdrop-blur-sm space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <Gauge className="text-orange-400" />
                                    <h3 className="font-bold text-lg">Game Mode</h3>
                                </div>
                                <div 
                                    onClick={toggleRealismMode}
                                    className={`
                                        cursor-pointer p-4 rounded-lg border-2 flex items-center justify-between transition-all
                                        ${isRealismMode 
                                            ? 'bg-orange-950/30 border-orange-500' 
                                            : 'bg-slate-950/30 border-slate-700 hover:border-slate-500'
                                        }
                                    `}
                                >
                                    <div>
                                        <h4 className={`font-bold ${isRealismMode ? 'text-orange-400' : 'text-slate-300'}`}>Realism Mode</h4>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Engine thrust builds up gradually instead of instantly. Harder handling.
                                        </p>
                                    </div>
                                    <div className={`
                                        w-12 h-6 rounded-full relative transition-colors
                                        ${isRealismMode ? 'bg-orange-500' : 'bg-slate-700'}
                                    `}>
                                        <div className={`
                                            absolute top-1 w-4 h-4 rounded-full bg-white transition-all
                                            ${isRealismMode ? 'left-7' : 'left-1'}
                                        `}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Data Management */}
                            <div className="bg-slate-900/80 p-6 rounded-xl border border-red-900/30 backdrop-blur-sm space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <Trash2 className="text-red-400" />
                                    <h3 className="font-bold text-lg text-red-100">Danger Zone</h3>
                                </div>
                                <button 
                                    onClick={resetProgress}
                                    className="w-full bg-red-900/20 hover:bg-red-900/40 text-red-400 font-bold py-3 rounded-xl border border-red-900/50 transition-all flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={18} /> RESET SYSTEM
                                </button>
                                <p className="text-xs text-red-900/60 text-center">This will delete all high scores, lock skins, and reset your identity.</p>
                            </div>

                        </div>
                    </main>

                    <footer className="p-4 bg-slate-900/90 border-t border-slate-800 shrink-0">
                         <button 
                            onClick={() => setView('menu')}
                            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-lg"
                        >
                            <Check size={20} /> DONE
                        </button>
                    </footer>
                </div>
            </div>
        </div>
      );
  }

  // 3. HANGAR (SKINS)
  if (view === 'hangar') {
    return (
      <div className="w-full h-[100dvh] bg-slate-950 text-white flex flex-col overflow-hidden relative">
         <div className="w-full h-full flex flex-col" style={safeZoneStyle}>
            <header className="p-4 bg-slate-900 border-b border-slate-800 flex items-center gap-4 rounded-t-xl mt-2 mx-2">
                <button onClick={() => setView('menu')} className="p-2 hover:bg-slate-800 rounded-lg">
                    <ChevronLeft />
                </button>
                <h2 className="font-bold text-lg">Vessel Hangar</h2>
                <div className="ml-auto flex flex-col items-end">
                    <span className="text-[10px] text-slate-500 uppercase">Career Score</span>
                    <span className="font-mono text-yellow-500">{careerScore}</span>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full space-y-4">
                {SKINS.map(skin => {
                    const isLocked = careerScore < skin.unlockScore;
                    const isSelected = selectedSkinId === skin.id;

                    return (
                        <div 
                            key={skin.id}
                            onClick={() => !isLocked && selectSkin(skin.id)}
                            className={`
                                relative p-4 rounded-xl border-2 transition-all cursor-pointer
                                ${isSelected ? 'bg-cyan-950/30 border-cyan-500' : 'bg-slate-900 border-slate-800'}
                                ${isLocked ? 'opacity-75 grayscale' : 'hover:border-slate-600'}
                            `}
                        >
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4 items-center">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${isSelected ? 'border-cyan-400 bg-cyan-900' : 'border-slate-700 bg-slate-800'}`}>
                                        {isLocked ? <Lock size={20} className="text-slate-500" /> : <Rocket size={20} style={{color: skin.color}} />}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-lg ${isSelected ? 'text-cyan-400' : 'text-white'}`}>{skin.name}</h3>
                                        <p className="text-slate-400 text-sm">{skin.description}</p>
                                    </div>
                                </div>
                                
                                {isLocked ? (
                                    <div className="bg-red-900/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-900/50">
                                        Needs {skin.unlockScore} Pts
                                    </div>
                                ) : isSelected && (
                                    <div className="bg-cyan-900/20 text-cyan-400 px-3 py-1 rounded-full text-xs font-bold border border-cyan-900/50 flex items-center gap-1">
                                        Active
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </main>
         </div>
      </div>
    );
  }

  // 4. CUSTOM BUILDER
  if (view === 'custom') {
      return (
        <div className="w-full h-[100dvh] bg-slate-950 text-white flex flex-col relative overflow-hidden">
            <div className="w-full h-full flex flex-col justify-center items-center p-6" style={safeZoneStyle}>
                <button onClick={() => setView('menu')} className="absolute top-4 left-4 p-2 hover:bg-slate-800 rounded-lg z-10">
                    <ChevronLeft />
                </button>

                <div className="w-full max-w-md bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl">
                    <h2 className="text-2xl font-black mb-6 text-center">CUSTOM SIMULATION</h2>
                    
                    <div className="mb-8">
                        <div className="flex justify-between mb-2">
                            <label className="font-bold text-slate-300">Gravity</label>
                            <span className="font-mono text-cyan-400">{customGravity.toFixed(1)} m/s²</span>
                        </div>
                        <input 
                            type="range" 
                            min="1.0" 
                            max="20.0" 
                            step="0.1" 
                            value={customGravity}
                            onChange={(e) => setCustomGravity(parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                        />
                        <div className="flex justify-between text-xs text-slate-500 mt-2">
                            <span>Moon (1.6)</span>
                            <span>Earth (9.8)</span>
                            <span>Jupiter (24.8)</span>
                        </div>
                    </div>

                    <button 
                        onClick={() => startGame({ 
                            id: 'custom', 
                            name: 'Unknown World', 
                            gravity: customGravity, 
                            color: '#a855f7', // Purple for custom
                            skyColor: '#3b0764',
                            surfaceColor: '#7e22ce',
                            difficultyMultiplier: customGravity / 9.8,
                            isCustom: true
                        })}
                        className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                    >
                        INITIATE CUSTOM LAUNCH
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // 5. GAME VIEW
  return (
    <div className="w-full h-[100dvh] bg-slate-950 flex flex-col text-slate-200 font-sans relative overflow-hidden">
      
      <div className="w-full h-full flex flex-col" style={safeZoneStyle}>
          {/* HEADER OVERLAY (In Game) */}
          <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10 pointer-events-none" style={{
              top: `${safePadding.y}%`, left: `${safePadding.x}%`, right: `${safePadding.x}%`
          }}>
            <button 
                onClick={returnToMenu}
                className="pointer-events-auto bg-slate-900/80 backdrop-blur border border-slate-700 p-2 rounded-lg hover:bg-slate-800 text-white"
            >
                <Menu size={20} />
            </button>

            <div className="flex flex-col items-end pointer-events-auto">
                <div className="bg-slate-900/80 backdrop-blur border border-slate-700 px-3 py-1 rounded-lg mb-1">
                    <span className="text-xs text-slate-400 font-bold uppercase mr-2">Target</span>
                    <span className="font-bold text-cyan-400">{activePlanetConfig.name}</span>
                </div>
                {activePlanetConfig.id !== 'custom' && (
                    <div className="bg-slate-900/80 backdrop-blur border border-slate-700 px-3 py-1 rounded-lg flex items-center gap-2">
                        <Trophy size={12} className="text-yellow-500"/>
                        <span className="font-mono text-yellow-500 font-bold text-sm">
                            {highScores[activePlanetConfig.id] || 0}
                        </span>
                    </div>
                )}
            </div>
          </div>

          {/* GAME AREA */}
          <main className="flex-1 relative flex justify-center items-center bg-black overflow-hidden rounded-xl border border-slate-800">
            <div className="relative w-full h-full bg-black shadow-2xl">
                <LanderGame 
                    planet={activePlanetConfig} 
                    skin={selectedSkin}
                    onGameOver={handleGameOver} 
                    isActive={gameState.isPlaying} 
                    isRealismMode={isRealismMode}
                />

                {/* OVERLAY: GAME OVER */}
                {gameState.isGameOver && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6 z-30 animate-in fade-in zoom-in duration-300">
                        <div className={`mb-6 p-6 rounded-full border-4 ${gameState.landedSafely ? 'bg-green-500/20 border-green-500/50' : 'bg-red-500/20 border-red-500/50'}`}>
                            {gameState.landedSafely ? (
                                <Trophy size={64} className="text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            ) : (
                                <Flame size={64} className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                            )}
                        </div>
                        
                        <h2 className={`text-4xl md:text-5xl font-black mb-2 tracking-tighter text-center ${gameState.landedSafely ? 'text-green-400' : 'text-red-500'}`}>
                            {gameState.message}
                        </h2>
                        
                        <div className="bg-slate-900/90 p-6 rounded-2xl border border-slate-700 mb-8 w-full max-w-xs shadow-xl">
                            <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-2">
                                <span className="text-slate-400 text-sm uppercase font-bold">Score</span>
                                <span className="text-3xl font-mono font-bold text-white">{gameState.score}</span>
                            </div>
                            {activePlanetConfig.id !== 'custom' && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-500">Personal Best</span>
                                    <span className="text-yellow-500 font-mono font-bold">
                                        {Math.max(gameState.score, highScores[activePlanetConfig.id] || 0)}
                                    </span>
                                </div>
                            )}
                            {gameState.landedSafely && gameState.score > (highScores[activePlanetConfig.id] || 0) && activePlanetConfig.id !== 'custom' && (
                                <div className="mt-3 text-center bg-yellow-500/10 text-yellow-500 py-1 rounded text-xs font-bold uppercase tracking-widest animate-pulse border border-yellow-500/20">
                                    New High Score!
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 w-full max-w-xs">
                            <button 
                                onClick={() => startGame(activePlanetConfig)}
                                className="flex items-center justify-center gap-3 bg-white hover:bg-slate-200 text-black font-bold py-4 rounded-xl text-lg transition-all shadow-lg active:scale-95"
                            >
                                <RotateCcw size={20} /> REATTEMPT
                            </button>
                            <button 
                                onClick={returnToMenu}
                                className="flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-xl text-lg transition-all active:scale-95"
                            >
                                <Menu size={20} /> MAIN MENU
                            </button>
                        </div>
                    </div>
                )}

                {/* ACTIVE GAME HUD (BOTTOM) */}
                {gameState.isPlaying && (
                    <div className="absolute bottom-10 left-0 right-0 flex justify-center pointer-events-none opacity-50">
                        <div className="bg-slate-900/50 backdrop-blur text-white px-4 py-2 rounded-full border border-slate-700 flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Controls</span>
                            <kbd className="bg-slate-800 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-400">TAP / SPACE</kbd>
                        </div>
                    </div>
                )}
            </div>
          </main>
      </div>
    </div>
  );
};

export default App;
