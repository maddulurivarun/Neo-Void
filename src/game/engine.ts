/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Entity, GameState, Vector, createBullet, createEnemy, createParticle } from './types';

export class GameEngine {
  private state: GameState;
  private canvasWidth: number = 800;
  private canvasHeight: number = 600;
  private keys: Set<string> = new Set();

  constructor() {
    this.state = this.getInitialState();
  }

  private getInitialState(): GameState {
    return {
      player: {
        id: 'player',
        position: { x: 400, y: 300 },
        velocity: { x: 0, y: 0 },
        radius: 15,
        color: '#00F0FF',
        type: 'player',
        health: 100,
        maxHealth: 100,
        angle: 0,
      },
      entities: [],
      score: 0,
      gameOver: false,
      wave: 1,
      timer: 0,
    };
  }

  setDimensions(width: number, height: number) {
    this.canvasWidth = width;
    this.canvasHeight = height;
    if (this.state.player.position.x === 400 && this.state.player.position.y === 300) {
      this.state.player.position = { x: width / 2, y: height / 2 };
    }
  }

  update(deltaTime: number) {
    if (this.state.gameOver) return this.state;

    this.state.timer += deltaTime;

    // Player Movement
    const player = this.state.player;
    const accel = 0.5;
    const friction = 0.95;

    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) player.velocity.y -= accel;
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) player.velocity.y += accel;
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) player.velocity.x -= accel;
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) player.velocity.x += accel;

    player.position.x += player.velocity.x;
    player.position.y += player.velocity.y;
    player.velocity.x *= friction;
    player.velocity.y *= friction;

    // Keep player in bounds with bounce
    if (player.position.x < player.radius) {
      player.position.x = player.radius;
      player.velocity.x *= -0.5;
    }
    if (player.position.x > this.canvasWidth - player.radius) {
      player.position.x = this.canvasWidth - player.radius;
      player.velocity.x *= -0.5;
    }
    if (player.position.y < player.radius) {
      player.position.y = player.radius;
      player.velocity.y *= -0.5;
    }
    if (player.position.y > this.canvasHeight - player.radius) {
      player.position.y = this.canvasHeight - player.radius;
      player.velocity.y *= -0.5;
    }

    // Update Entities
    this.state.entities = this.state.entities.filter(entity => {
      // Basic physics
      entity.position.x += entity.velocity.x;
      entity.position.y += entity.velocity.y;

      // Lifespan check
      if (entity.lifespan !== undefined) {
        entity.age = (entity.age || 0) + 1;
        if (entity.age > entity.lifespan) return false;
      }

      // Enemy AI
      if (entity.type === 'enemy') {
        const dx = player.position.x - entity.position.x;
        const dy = player.position.y - entity.position.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = 1.5 + this.state.wave * 0.2;
        
        entity.velocity.x = (dx / dist) * speed;
        entity.velocity.y = (dy / dist) * speed;
        entity.angle = Math.atan2(dy, dx);

        // Collision with player
        if (dist < player.radius + entity.radius) {
          player.health = (player.health || 0) - 1;
          if (player.health <= 0) this.state.gameOver = true;
          this.spawnExplosion(entity.position, entity.color, 5);
          return false;
        }
      }

      // Bullet logic
      if (entity.type === 'bullet') {
        // Collision with enemies
        for (const other of this.state.entities) {
          if (other.type === 'enemy') {
            const dx = entity.position.x - other.position.x;
            const dy = entity.position.y - other.position.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < entity.radius + other.radius) {
              other.health = (other.health || 0) - 50;
              if (other.health <= 0) {
                this.state.score += 100;
                this.spawnExplosion(other.position, other.color, 15);
                other.id = 'dead'; // Mark for cleanup
              }
              return false; // Bullet destroyed
            }
          }
        }
      }

      // Cleanup dead
      if (entity.id === 'dead') return false;

      // Screen containment for bullets
      if (entity.type === 'bullet') {
        if (entity.position.x < 0 || entity.position.x > this.canvasWidth || 
            entity.position.y < 0 || entity.position.y > this.canvasHeight) {
          return false;
        }
      }

      return true;
    });

    // Spawn waves
    if (this.state.entities.filter(e => e.type === 'enemy').length === 0) {
      this.state.wave++;
      this.spawnWave();
    }

    return this.state;
  }

  private spawnWave() {
    const count = 3 + this.state.wave * 2;
    for (let i = 0; i < count; i++) {
      let x, y;
      // Spawn outside or at edges
      if (Math.random() > 0.5) {
        x = Math.random() > 0.5 ? -50 : this.canvasWidth + 50;
        y = Math.random() * this.canvasHeight;
      } else {
        x = Math.random() * this.canvasWidth;
        y = Math.random() > 0.5 ? -50 : this.canvasHeight + 50;
      }
      this.state.entities.push(createEnemy(x, y, this.state.wave));
    }
  }

  private spawnExplosion(pos: Vector, color: string, count: number) {
    for (let i = 0; i < count; i++) {
      this.state.entities.push(createParticle(pos, color));
    }
  }

  shoot(targetX: number, targetY: number) {
    if (this.state.gameOver) return;
    const player = this.state.player;
    const dx = targetX - player.position.x;
    const dy = targetY - player.position.y;
    const angle = Math.atan2(dy, dx);
    this.state.player.angle = angle;
    this.state.entities.push(createBullet(player.position, angle));
  }

  handleInput(key: string, isDown: boolean) {
    if (isDown) this.keys.add(key);
    else this.keys.delete(key);

    if (key === 'KeyR' && this.state.gameOver) {
      this.state = this.getInitialState();
      this.state.player.position = { x: this.canvasWidth / 2, y: this.canvasHeight / 2 };
    }
  }

  getState() {
    return this.state;
  }
}
