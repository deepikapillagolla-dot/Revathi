import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Trophy, 
  RotateCcw, 
  Music, 
  Gamepad2,
  Zap
} from 'lucide-react';

// --- Constants & Types ---

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const TICK_RATE = 150;

interface Point {
  x: number;
  y: number;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: string;
  cover: string;
}

const TRACKS: Track[] = [
  {
    id: '1',
    title: 'Cyber City Echoes',
    artist: 'AI Synth-01',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: '6:12',
    cover: 'https://picsum.photos/seed/cyber/400/400'
  },
  {
    id: '2',
    title: 'Neon Horizon',
    artist: 'Digital Dreamer',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: '7:05',
    cover: 'https://picsum.photos/seed/neon/400/400'
  },
  {
    id: '3',
    title: 'Glitch in the Matrix',
    artist: 'Binary Bard',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: '5:48',
    cover: 'https://picsum.photos/seed/matrix/400/400'
  }
];

// --- Custom Hooks ---

function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

// --- Components ---

const SnakeGame = () => {
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      const isOnSnake = currentSnake.some(segment => segment.x === newFood?.x && segment.y === newFood?.y);
      if (!isOnSnake) break;
    }
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood(INITIAL_SNAKE));
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead = {
        x: (head.x + direction.x + GRID_SIZE) % GRID_SIZE,
        y: (head.y + direction.y + GRID_SIZE) % GRID_SIZE,
      };

      // Check collision with self
      if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        setGameOver(true);
        if (score > highScore) setHighScore(score);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check collision with food
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(s => s + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, isPaused, score, highScore, generateFood]);

  useInterval(moveSnake, isPaused ? null : TICK_RATE);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
        case 's':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
        case 'a':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
        case 'd':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        case ' ':
          if (gameOver) resetGame();
          else setIsPaused(p => !p);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameOver]);

  return (
    <div className="flex flex-col items-center gap-6 p-6 bg-zinc-900/50 rounded-3xl border border-zinc-800 backdrop-blur-xl neon-shadow-blue relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-blue to-transparent opacity-50" />
      
      <div className="flex items-center justify-between w-full px-4">
        <div className="flex items-center gap-3">
          <Gamepad2 className="w-6 h-6 text-neon-blue animate-pulse" />
          <h2 className="text-xl font-display font-bold tracking-wider text-neon-blue uppercase">Neuro-Link Snake</h2>
        </div>
        <div className="flex gap-4">
          <div className="bg-zinc-800/80 px-4 py-2 rounded-xl border border-zinc-700/50">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 block">Score</span>
            <span className="text-xl font-mono font-bold text-white">{score}</span>
          </div>
          <div className="bg-zinc-800/80 px-4 py-2 rounded-xl border border-zinc-700/50">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 block">Record</span>
            <span className="text-xl font-mono font-bold text-neon-pink">{highScore}</span>
          </div>
        </div>
      </div>

      <div className="relative aspect-square w-full max-w-[400px] bg-black rounded-xl border-2 border-zinc-800 overflow-hidden shadow-inner flex items-center justify-center">
        {/* Grid Background */}
        <div className="absolute inset-0 grid grid-cols-20 grid-rows-20 opacity-20 pointer-events-none">
          {Array.from({ length: 400 }).map((_, i) => (
            <div key={i} className="border-[0.5px] border-zinc-800" />
          ))}
        </div>

        {/* Snake & Food */}
        <div className="absolute inset-0 grid grid-cols-20 grid-rows-20">
          {snake.map((segment, i) => (
            <motion.div
              key={`${i}-${segment.x}-${segment.y}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`rounded-sm ${
                i === 0 ? 'bg-neon-blue z-10' : 'bg-neon-blue/60'
              }`}
              style={{
                gridColumnStart: segment.x + 1,
                gridRowStart: segment.y + 1,
                boxShadow: i === 0 ? '0 0 15px rgba(0, 243, 255, 0.8)' : 'none'
              }}
            />
          ))}
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8]
            }}
            transition={{ 
              duration: 1,
              repeat: Infinity 
            }}
            className="food-item bg-neon-pink rounded-full w-2/3 h-2/3 m-auto"
            style={{
              gridColumnStart: food.x + 1,
              gridRowStart: food.y + 1,
              boxShadow: '0 0 15px rgba(255, 0, 127, 0.8)'
            }}
          />
        </div>

        {/* Game States */}
        <AnimatePresence>
          {(gameOver || isPaused) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20 backdrop-blur-sm"
            >
              {gameOver ? (
                <div className="text-center p-8 space-y-6">
                  <div className="space-y-2">
                    <Trophy className="w-16 h-16 text-neon-pink mx-auto animate-bounce" />
                    <h3 className="text-4xl font-display font-bold text-neon-pink neon-text-pink">SYSTEM FAILURE</h3>
                    <p className="text-zinc-500 font-mono text-sm uppercase tracking-[0.2em]">Connection Severed</p>
                  </div>
                  <button
                    onClick={resetGame}
                    className="flex items-center gap-2 px-8 py-3 bg-neon-pink text-white rounded-full font-bold uppercase transition-transform hover:scale-105 active:scale-95 neon-shadow-pink"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Reboot Protocol
                  </button>
                </div>
              ) : (
                <div className="text-center p-8 space-y-6">
                  <div className="space-y-2">
                    <Play className="w-16 h-16 text-neon-green mx-auto" />
                    <h3 className="text-4xl font-display font-bold text-neon-green neon-text-green">PAUSED</h3>
                    <p className="text-zinc-500 font-mono text-sm uppercase tracking-[0.2em]">Awaiting Command</p>
                  </div>
                  <button
                    onClick={() => setIsPaused(false)}
                    className="flex items-center gap-2 px-8 py-3 bg-neon-green text-black rounded-full font-bold uppercase transition-transform hover:scale-105 active:scale-95 neon-shadow-green"
                  >
                    Resume Uplink
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex gap-4 text-xs font-mono text-zinc-500 uppercase tracking-widest pt-2">
        <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-neon-pink" /> WASD to move</span>
        <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-neon-pink" /> Space to pause</span>
      </div>
    </div>
  );
};

const MusicPlayer = () => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const nextTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
    setIsPlaying(true);
  };

  const prevTrack = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration) {
      const value = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(value);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrackIndex]);

  return (
    <div className="w-full h-full flex flex-col gap-6 bg-zinc-950 p-6 lg:p-10 border-l border-zinc-800/50 backdrop-blur-3xl relative overflow-hidden group">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-neon-purple/10 blur-[100px] rounded-full -mr-20 -mt-20 animate-pulse" />
      <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-neon-pink/5 blur-[80px] rounded-full -ml-10 -mb-10" />

      <div className="flex items-center gap-3 relative z-10">
        <Music className="w-6 h-6 text-neon-pink" />
        <h2 className="text-xl font-display font-bold tracking-wider text-white uppercase">Synth-Link Audio</h2>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 relative z-10">
        <div className="relative group/cover">
          <motion.div 
            key={currentTrack.id}
            initial={{ scale: 0.9, opacity: 0, rotate: -5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            className="w-64 h-64 md:w-80 md:h-80 rounded-2xl overflow-hidden shadow-2xl relative border border-zinc-800"
          >
            <img 
              src={currentTrack.cover} 
              alt={currentTrack.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover/cover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            {isPlaying && (
              <div className="absolute bottom-6 left-6 flex items-end gap-1 h-8">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: ['20%', '80%', '40%', '100%', '30%'] }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 0.5 + Math.random() * 0.5,
                      delay: i * 0.1 
                    }}
                    className="w-1.5 bg-neon-pink rounded-full shadow-[0_0_8px_rgba(255,0,127,0.5)]"
                  />
                ))}
              </div>
            )}
          </motion.div>
        </div>

        <div className="text-center space-y-2">
          <motion.h3 
            key={`${currentTrack.id}-title`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-2xl md:text-3xl font-display font-bold text-white tracking-tight"
          >
            {currentTrack.title}
          </motion.h3>
          <motion.p 
            key={`${currentTrack.id}-artist`}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-zinc-400 font-mono text-sm uppercase tracking-[0.3em]"
          >
            {currentTrack.artist}
          </motion.p>
        </div>

        <div className="w-full max-w-md space-y-4">
          <div className="relative h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden cursor-pointer group/progress">
            <div 
              className="absolute left-0 top-0 h-full bg-gradient-to-r from-neon-pink to-neon-purple neon-shadow-pink transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
            <div 
              className="absolute h-4 w-4 bg-white rounded-full shadow-lg -top-1 blur-[1px] opacity-0 group-hover/progress:opacity-50 transition-opacity"
              style={{ left: `calc(${progress}% - 8px)` }}
            />
          </div>
          
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            <span>Progress: {Math.floor(progress)}%</span>
            <span>Est: {currentTrack.duration}</span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <button 
            onClick={prevTrack}
            className="p-3 text-zinc-400 hover:text-white transition-colors hover:scale-110 active:scale-95"
          >
            <SkipBack className="w-8 h-8" />
          </button>
          
          <button 
            onClick={togglePlay}
            className="p-6 bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current" />}
          </button>

          <button 
            onClick={nextTrack}
            className="p-3 text-zinc-400 hover:text-white transition-colors hover:scale-110 active:scale-95"
          >
            <SkipForward className="w-8 h-8" />
          </button>
        </div>

        <div className="flex items-center gap-4 w-full max-w-48 bg-zinc-900/50 px-4 py-2 rounded-2xl border border-zinc-800">
          <Volume2 className="w-4 h-4 text-zinc-500" />
          <input 
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full accent-neon-pink bg-zinc-800 h-1 rounded-full cursor-pointer"
          />
        </div>
      </div>

      <audio 
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={nextTrack}
      />
    </div>
  );
};

export default function App() {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-[1fr_450px] bg-[#050505] selection:bg-neon-pink selection:text-white">
      {/* Game Area */}
      <main className="relative flex flex-col items-center justify-center p-4 md:p-8 space-y-8 overflow-y-auto">
        {/* Decorative elements */}
        <div className="fixed top-12 left-12 w-24 h-24 border-t border-l border-zinc-800 opacity-50" />
        <div className="fixed bottom-12 right-12 w-24 h-24 border-b border-r border-zinc-800 opacity-50" />
        
        <div className="text-center space-y-4 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-neon-blue/10 border border-neon-blue/20 rounded-full mb-2">
            <span className="w-1.5 h-1.5 bg-neon-blue rounded-full animate-pulse shadow-[0_0_8px_rgba(0,243,255,0.8)]" />
            <span className="text-[10px] font-mono text-neon-blue uppercase tracking-[0.2em] font-bold">Signal Optimized</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-bold italic tracking-tighter text-white">
            NEON<span className="text-neon-pink neon-text-pink">STRIKE</span>
          </h1>
          <p className="max-w-md mx-auto text-zinc-500 font-sans text-sm md:text-base leading-relaxed">
            Navigate the grid, collect data streams, and sync with the rhythm. 
            The grid is your playground. The beats are your fuel.
          </p>
        </div>

        <div className="w-full max-w-2xl relative">
          <SnakeGame />
        </div>

        <div className="flex flex-wrap justify-center gap-12 pt-8 border-t border-zinc-900 w-full max-w-2xl">
          <div className="space-y-1">
            <div className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">Protocol</div>
            <div className="text-white font-mono text-sm">V.3.1.0-SNK</div>
          </div>
          <div className="space-y-1">
            <div className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">Latency</div>
            <div className="text-white font-mono text-sm">0.02 MS</div>
          </div>
          <div className="space-y-1">
            <div className="text-zinc-600 font-mono text-[10px] uppercase tracking-widest">Bitrate</div>
            <div className="text-white font-mono text-sm">320 KBPS</div>
          </div>
        </div>
      </main>

      {/* Music Sidebar */}
      <aside className="h-full hidden lg:block">
        <MusicPlayer />
      </aside>

      {/* Mobile Music Controls (Optional Overlay) */}
      <div className="fixed bottom-4 right-4 lg:hidden z-50">
        <button className="w-14 h-14 bg-neon-pink rounded-full flex items-center justify-center shadow-lg neon-shadow-pink hover:scale-110 active:scale-95 transition-transform">
          <Music className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  );
}
