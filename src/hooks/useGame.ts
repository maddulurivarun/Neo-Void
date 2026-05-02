/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from '../game/engine';
import { GameRenderer } from '../game/renderer';
import { GameState } from '../game/types';

export function useGame(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const engineRef = useRef<GameEngine>(new GameEngine());
  const rendererRef = useRef<GameRenderer | null>(null);
  const [gameState, setGameState] = useState<GameState>(engineRef.current.getState());
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  const update = useCallback((time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = time - lastTimeRef.current;
      const state = engineRef.current.update(deltaTime);
      setGameState({ ...state });

      if (rendererRef.current) {
        rendererRef.current.render(state);
      }
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(update);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    rendererRef.current = new GameRenderer(ctx, canvas.width, canvas.height);
    
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      engineRef.current.setDimensions(canvas.width, canvas.height);
      rendererRef.current?.updateDimensions(canvas.width, canvas.height);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    requestRef.current = requestAnimationFrame(update);

    const handleKeyDown = (e: KeyboardEvent) => engineRef.current.handleInput(e.code, true);
    const handleKeyUp = (e: KeyboardEvent) => engineRef.current.handleInput(e.code, false);
    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (canvas.width / rect.width);
      const y = (e.clientY - rect.top) * (canvas.height / rect.height);
      engineRef.current.shoot(x, y);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('mousedown', handleMouseDown);

    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('mousedown', handleMouseDown);
    };
  }, [canvasRef, update]);

  return gameState;
}
