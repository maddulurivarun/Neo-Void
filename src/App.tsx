/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Shield, Zap, RefreshCw, Trophy, Gamepad2 } from 'lucide-react';
import { useGame } from './hooks/useGame';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameState = useGame(canvasRef);

  const healthPercent = (gameState.player.health! / gameState.player.maxHealth!) * 100;

  return (
    <div className="relative w-full h-screen bg-[#050505] font-sans flex items-center justify-center overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(0,240,255,0.05)_0%,transparent_70%)]" />
      </div>

      {/* Game Canvas */}
      <canvas
        id="game-canvas"
        ref={canvasRef}
        className="w-full h-full transition-opacity duration-1000"
      />

      {/* HUD: Top Left - Score & Wave */}
      <div className="absolute top-8 left-8 flex flex-col gap-2">
        <div className="flex items-baseline gap-4">
          <div className="text-4xl font-bold tracking-tighter text-neon-cyan">
            {gameState.score.toLocaleString()}
          </div>
          <div className="text-xs uppercase tracking-[0.2em] font-mono text-white/40">
            Current Score
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 bg-white/5 border border-white/10 rounded flex items-center gap-2">
            <Zap className="w-3 h-3 text-neon-pink" />
            <span className="text-xs font-mono tracking-widest text-white/80">WAVE {gameState.wave}</span>
          </div>
        </div>
      </div>

      {/* HUD: Top Right - Controls Info */}
      <div className="absolute top-8 right-8 text-right flex flex-col gap-1 opacity-40 hover:opacity-100 transition-opacity">
        <div className="text-[10px] uppercase font-mono tracking-tighter">WASD to Move</div>
        <div className="text-[10px] uppercase font-mono tracking-tighter">Click to fire</div>
      </div>

      {/* HUD: Bottom - Health Bar */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-80 flex flex-col gap-3">
        <div className="flex justify-between items-end mb-1">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-neon-cyan" />
            <span className="text-[10px] uppercase font-mono tracking-widest text-white/60">Hull Integrity</span>
          </div>
          <div className="text-sm font-mono text-neon-cyan font-bold">
            {Math.max(0, Math.ceil(healthPercent))}%
          </div>
        </div>
        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5 p-[1px]">
          <motion.div
            initial={false}
            animate={{ width: `${healthPercent}%` }}
            transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
            className={`h-full rounded-full ${
              healthPercent > 25 ? 'bg-neon-cyan shadow-[0_0_10px_rgba(0,240,255,0.5)]' : 'bg-neon-pink shadow-[0_0_10px_rgba(255,0,85,0.5)] animate-pulse'
            }`}
          />
        </div>
      </div>

      {/* Overlays */}
      <AnimatePresence>
        {gameState.gameOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="w-full max-w-md p-10 flex flex-col items-center text-center space-y-8"
            >
              <div className="space-y-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="w-20 h-20 border-2 border-neon-pink/30 rounded-full flex items-center justify-center mx-auto mb-6 relative"
                >
                  <Target className="w-10 h-10 text-neon-pink" />
                  <div className="absolute inset-0 border-2 border-neon-pink border-t-transparent rounded-full animate-spin" />
                </motion.div>
                <h2 className="text-6xl font-bold tracking-tighter text-neon-pink italic">VOIDED</h2>
                <p className="text-white/40 uppercase tracking-[0.3em] text-[10px]">Transmission Terminated</p>
              </div>

              <div className="grid grid-cols-2 gap-8 w-full border-y border-white/10 py-6">
                <div>
                  <div className="text-xs text-white/40 uppercase mb-1 flex items-center justify-center gap-2">
                    <Trophy className="w-3 h-3" />
                    High Score
                  </div>
                  <div className="text-2xl font-bold text-white tracking-tight">{gameState.score}</div>
                </div>
                <div>
                  <div className="text-xs text-white/40 uppercase mb-1 flex items-center justify-center gap-2">
                    <Zap className="w-3 h-3" />
                    Last Wave
                  </div>
                  <div className="text-2xl font-bold text-white tracking-tight">{gameState.wave}</div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-12 py-4 bg-neon-cyan/20 border border-neon-cyan/30 rounded flex items-center gap-3 overflow-hidden transition-colors hover:bg-neon-cyan/30"
                onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyR' }))}
              >
                <div className="absolute inset-0 bg-neon-cyan opacity-0 group-hover:opacity-10 transition-opacity" />
                <RefreshCw className="w-5 h-5 text-neon-cyan group-hover:rotate-180 transition-transform duration-500" />
                <span className="text-sm font-bold uppercase tracking-widest text-neon-cyan">Re-Initialize</span>
              </motion.button>
              
              <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">Press 'R' to Restart</p>
            </motion.div>
          </motion.div>
        )}

        {gameState.score === 0 && !gameState.gameOver && gameState.timer < 5000 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute bottom-24 bg-white/5 border border-white/10 px-6 py-4 rounded-xl flex items-center gap-6 backdrop-blur-md"
          >
            <div className="flex items-center gap-4 border-r border-white/10 pr-6">
              <div className="p-2 bg-white/10 rounded">
                <Gamepad2 className="w-5 h-5 text-neon-cyan" />
              </div>
              <div className="text-left">
                <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Movement</div>
                <div className="text-xs font-bold uppercase text-white/80">WASD KEYS</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-2 bg-white/10 rounded">
                <Target className="w-5 h-5 text-neon-pink" />
              </div>
              <div className="text-left">
                <div className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Combat</div>
                <div className="text-xs font-bold uppercase text-white/80">MOUSE CLKS</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
