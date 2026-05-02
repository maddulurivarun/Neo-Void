/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Vector {
  x: number;
  y: number;
}

export interface Entity {
  id: string;
  position: Vector;
  velocity: Vector;
  radius: number;
  color: string;
  type: 'player' | 'enemy' | 'bullet' | 'particle';
  health?: number;
  maxHealth?: number;
  angle?: number;
  lifespan?: number;
  age?: number;
}

export interface GameState {
  player: Entity;
  entities: Entity[];
  score: number;
  gameOver: boolean;
  wave: number;
  timer: number;
}

export const INITIAL_PLAYER: Entity = {
  id: 'player',
  position: { x: 0, y: 0 },
  velocity: { x: 0, y: 0 },
  radius: 15,
  color: '#00F0FF', // Neon Cyan
  type: 'player',
  health: 100,
  maxHealth: 100,
  angle: 0,
};

export const createEnemy = (x: number, y: number, wave: number): Entity => ({
  id: `enemy-${Math.random()}`,
  position: { x, y },
  velocity: { x: 0, y: 0 },
  radius: 12 + Math.random() * 8,
  color: '#FF0055', // Neon Pink
  type: 'enemy',
  health: 20 + wave * 5,
  maxHealth: 20 + wave * 5,
  angle: 0,
});

export const createBullet = (position: Vector, angle: number): Entity => ({
  id: `bullet-${Math.random()}`,
  position: { ...position },
  velocity: {
    x: Math.cos(angle) * 10,
    y: Math.sin(angle) * 10,
  },
  radius: 3,
  color: '#FFF',
  type: 'bullet',
  lifespan: 100,
  age: 0,
});

export const createParticle = (position: Vector, color: string): Entity => ({
  id: `particle-${Math.random()}`,
  position: { ...position },
  velocity: {
    x: (Math.random() - 0.5) * 8,
    y: (Math.random() - 0.5) * 8,
  },
  radius: Math.random() * 3,
  color,
  type: 'particle',
  lifespan: 30 + Math.random() * 30,
  age: 0,
});
