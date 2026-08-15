/**
 * LotteryEngine - Silnik Maszyny Loterii (Lottery Machine & Bouncing Balls)
 */
class LotteryEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.items = [];
    this.balls = [];
    this.isSpinning = false;
    this.drumAngle = 0;
    this.animId = null;
    this.onSpinComplete = null;

    this.sphereX = 300;
    this.sphereY = 250;
    this.sphereRadius = 180;

    this.colors = ['#ef4444', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#ec4899', '#8b5cf6', '#3b82f6'];
    this.isDpiSet = false;

    if (this.canvas) {
      this.setupDPI();
      this.initBalls();
      this.startLoop();
    }
  }

  setupDPI() {
    if (!this.canvas || !this.ctx || this.isDpiSet) return;
    const dpr = window.devicePixelRatio || 1;
    if (dpr > 1) {
      this.canvas.width = 600 * dpr;
      this.canvas.height = 600 * dpr;
      this.ctx.scale(dpr, dpr);
      this.isDpiSet = true;
    }
  }

  setItems(items) {
    this.items = items;
    this.initBalls();
  }

  initBalls() {
    this.balls = [];
    if (!this.items || this.items.length === 0) return;

    this.items.forEach((item, index) => {
      // Przypisywanie losowej pozycji wewnątrz bębna
      const angle = Math.random() * Math.PI * 2;
      const r = Math.random() * (this.sphereRadius - 40);

      this.balls.push({
        id: item.id || index,
        text: item.text,
        index: index,
        x: this.sphereX + Math.cos(angle) * r,
        y: this.sphereY + Math.sin(angle) * r,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        radius: 20,
        color: this.colors[index % this.colors.length]
      });
    });
  }

  startLoop() {
    if (this.animId) cancelAnimationFrame(this.animId);
    const loop = () => {
      this.update();
      this.draw();
      this.animId = requestAnimationFrame(loop);
    };
    loop();
  }

  update() {
    if (!this.balls || this.balls.length === 0) return;

    // Kąt obrotu bębna
    const speed = this.isSpinning ? 0.15 : 0.02;
    this.drumAngle += speed;

    this.balls.forEach(ball => {
      // Grawitacja i siła mieszania podczas obrotu bębna
      ball.vy += 0.25;

      if (this.isSpinning) {
        // Dodatkowa siła podbijająca kule
        ball.vx += (Math.random() - 0.5) * 3;
        ball.vy -= Math.random() * 2;
      }

      ball.x += ball.vx;
      ball.y += ball.vy;

      // Kolizja z okrągłą ścianką bębna
      const dx = ball.x - this.sphereX;
      const dy = ball.y - this.sphereY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const maxDist = this.sphereRadius - ball.radius;

      if (dist > maxDist) {
        const nx = dx / dist;
        const ny = dy / dist;

        // Odbicie wektora prędkości z tłumieniem
        const dot = ball.vx * nx + ball.vy * ny;
        ball.vx = (ball.vx - 2 * dot * nx) * 0.85;
        ball.vy = (ball.vy - 2 * dot * ny) * 0.85;

        // Korekta pozycji
        ball.x = this.sphereX + nx * maxDist;
        ball.y = this.sphereY + ny * maxDist;

        if (this.isSpinning && Math.random() > 0.7 && window.soundEngine) {
          window.soundEngine.playBallBounce();
        }
      }
    });

    // Kolizje między kulami
    for (let i = 0; i < this.balls.length; i++) {
      for (let j = i + 1; j < this.balls.length; j++) {
        const b1 = this.balls[i];
        const b2 = this.balls[j];

        const dx = b2.x - b1.x;
        const dy = b2.y - b1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = b1.radius + b2.radius;

        if (dist < minDist && dist > 0) {
          const nx = dx / dist;
          const ny = dy / dist;
          const kx = b1.vx - b2.vx;
          const ky = b1.vy - b2.vy;
          const p = 2 * (nx * kx + ny * ky) / 2;

          b1.vx -= p * nx * 0.9;
          b1.vy -= p * ny * 0.9;
          b2.vx += p * nx * 0.9;
          b2.vy += p * ny * 0.9;

          const overlap = minDist - dist;
          b1.x -= nx * overlap * 0.5;
          b1.y -= ny * overlap * 0.5;
          b2.x += nx * overlap * 0.5;
          b2.y += ny * overlap * 0.5;
        }
      }
    }
  }

  draw() {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, 600, 600);

    // 1. Rysowanie Stojaka i rury wylotowej
    ctx.save();
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#334155';
    // Podstawa
    ctx.beginPath();
    ctx.moveTo(180, 520);
    ctx.lineTo(420, 520);
    ctx.stroke();

    // Nogi
    ctx.beginPath();
    ctx.moveTo(220, 520);
    ctx.lineTo(260, 420);
    ctx.moveTo(380, 520);
    ctx.lineTo(340, 420);
    ctx.stroke();

    // Rura wylotowa pod bębnem
    ctx.lineWidth = 26;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(this.sphereX, this.sphereY + this.sphereRadius - 10);
    ctx.lineTo(this.sphereX, 480);
    ctx.stroke();
    ctx.restore();

    // 2. Rysowanie Kul wewnątrz bębna
    this.balls.forEach(ball => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);

      // Gradient 3D dla kuli
      const grad = ctx.createRadialGradient(
        ball.x - ball.radius * 0.3,
        ball.y - ball.radius * 0.3,
        2,
        ball.x,
        ball.y,
        ball.radius
      );
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, ball.color);
      grad.addColorStop(1, '#000000');

      ctx.fillStyle = grad;
      ctx.fill();

      // Numer / Tekst na kuli
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      let txt = ball.text;
      if (txt.length > 3) txt = (ball.index + 1).toString();
      ctx.fillText(txt, ball.x, ball.y);

      ctx.restore();
    });

    // 3. Przezroczysty Szklany Bęben (Sfera)
    ctx.save();
    ctx.beginPath();
    ctx.arc(this.sphereX, this.sphereY, this.sphereRadius, 0, Math.PI * 2);

    const glassGrad = ctx.createRadialGradient(
      this.sphereX - 40,
      this.sphereY - 40,
      10,
      this.sphereX,
      this.sphereY,
      this.sphereRadius
    );
    glassGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
    glassGrad.addColorStop(0.85, 'rgba(56, 189, 248, 0.15)');
    glassGrad.addColorStop(1, 'rgba(56, 189, 248, 0.4)');

    ctx.fillStyle = glassGrad;
    ctx.fill();

    ctx.lineWidth = 6;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.stroke();

    // Łopatka obrotowa wewnątrz bębna
    ctx.translate(this.sphereX, this.sphereY);
    ctx.rotate(this.drumAngle);
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.moveTo(-this.sphereRadius + 15, 0);
    ctx.lineTo(this.sphereRadius - 15, 0);
    ctx.stroke();

    ctx.restore();
  }

  spin() {
    if (this.isSpinning || !this.items || this.items.length === 0) return;

    this.isSpinning = true;

    // Losowanie po 3.5 sekundach intensywnego mieszania
    setTimeout(() => {
      this.isSpinning = false;

      const winnerIndex = Math.floor(Math.random() * this.items.length);
      const winnerItem = this.items[winnerIndex];

      if (this.onSpinComplete) {
        this.onSpinComplete(winnerItem, winnerIndex);
      }
    }, 3500);
  }
}

window.LotteryEngine = LotteryEngine;
