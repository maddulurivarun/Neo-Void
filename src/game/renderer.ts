/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GameState, Entity } from './types';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;

  private stars: Vector[] = [];

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.initStars();
  }

  private initStars() {
    this.stars = Array.from({ length: 100 }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height
    }));
  }

  updateDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.initStars();
  }

  render(state: GameState) {
    const { ctx, width, height } = this;

    // Clear Canvas
    ctx.fillStyle = '#050505';
    ctx.fillRect(0, 0, width, height);

    // Draw Stars
    ctx.fillStyle = '#FFF';
    this.stars.forEach(star => {
      const opacity = 0.1 + Math.random() * 0.4;
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.arc(star.x, star.y, 1, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;

    // Draw Background Grid (Subtle)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 100;
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Entities
    state.entities.forEach(entity => this.drawEntity(entity));
    this.drawPlayer(state.player);

    // Vignette
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, 0,
      width / 2, height / 2, Math.max(width, height)
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.5)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  private drawPlayer(player: Entity) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(player.position.x, player.position.y);
    ctx.rotate(player.angle || 0);

    // Glow
    ctx.shadowBlur = 15;
    ctx.shadowColor = player.color;

    // Ship Body
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.moveTo(player.radius, 0);
    ctx.lineTo(-player.radius, player.radius * 0.8);
    ctx.lineTo(-player.radius * 0.5, 0);
    ctx.lineTo(-player.radius, -player.radius * 0.8);
    ctx.closePath();
    ctx.fill();

    // Shield/Inner Glow
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, player.radius * 1.2, 0, Math.PI * 2);
    ctx.globalAlpha = 0.3;
    ctx.stroke();

    ctx.restore();
  }

  private drawEntity(entity: Entity) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(entity.position.x, entity.position.y);

    if (entity.type === 'enemy') {
      ctx.rotate(entity.angle || 0);
      ctx.shadowBlur = 10;
      ctx.shadowColor = entity.color;
      ctx.fillStyle = entity.color;

      ctx.beginPath();
      ctx.moveTo(entity.radius, 0);
      ctx.lineTo(-entity.radius, entity.radius);
      ctx.lineTo(-entity.radius, -entity.radius);
      ctx.closePath();
      ctx.fill();

      // Eye
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(entity.radius * 0.3, 0, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (entity.type === 'bullet') {
      ctx.shadowBlur = 5;
      ctx.shadowColor = '#FFF';
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(0, 0, entity.radius, 0, Math.PI * 2);
      ctx.fill();
    } else if (entity.type === 'particle') {
      const alpha = 1 - (entity.age! / entity.lifespan!);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = entity.color;
      ctx.beginPath();
      ctx.rect(-entity.radius, -entity.radius, entity.radius * 2, entity.radius * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}
