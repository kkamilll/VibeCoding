/**
 * BottleEngine - Silnik renderowania i fizyki Zakręcania Butelką (Spin the Bottle)
 */
class BottleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;

    this.items = [];
    this.currentAngle = 0; // w radianach (szyjka Butelki)
    this.isSpinning = false;
    this.spinDuration = 5000;
    this.onSpinComplete = null;
    this.lastSectorIndex = -1;
    this.isDpiSet = false;

    if (this.canvas) {
      this.setupDPI();
      this.draw();
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
    this.draw();
  }

  setSpinDuration(seconds) {
    this.spinDuration = seconds * 1000;
  }

  draw() {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const width = 600;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = 220;

    ctx.clearRect(0, 0, width, height);

    if (!this.items || this.items.length === 0) {
      ctx.save();
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Dodaj elementy, aby zakręcić butelką!', centerX, centerY);
      ctx.restore();
      return;
    }

    const count = this.items.length;
    const sectorAngle = (2 * Math.PI) / count;

    // 1. Rysowanie graczy / opcji w okręgu
    for (let i = 0; i < count; i++) {
      const angle = i * sectorAngle;
      const x = centerX + Math.cos(angle) * outerRadius;
      const y = centerY + Math.sin(angle) * outerRadius;

      ctx.save();
      ctx.translate(x, y);

      // Karta opcji / Kółko z tekstem
      ctx.beginPath();
      ctx.arc(0, 0, 36, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#6366f1';
      ctx.stroke();

      // Tekst opcji
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let text = this.items[i].text || `Opcja ${i + 1}`;
      if (text.length > 8) text = text.substring(0, 7) + '..';
      ctx.fillText(text, 0, 0);

      ctx.restore();
    }

    // 2. Rysowanie Centralnej Butelki 3D
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.currentAngle);

    // Cień pod butelką
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, 5, 30, 90, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.filter = 'blur(6px)';
    ctx.fill();
    ctx.restore();

    // Główny korpus butelki (szkło szmaragdowo-zielone)
    const bottleGrad = ctx.createLinearGradient(-25, 0, 25, 0);
    bottleGrad.addColorStop(0, '#064e3b');
    bottleGrad.addColorStop(0.3, '#10b981');
    bottleGrad.addColorStop(0.7, '#047857');
    bottleGrad.addColorStop(1, '#022c22');

    // Dolna podstawa butelki (dno skierowane w dół: +y)
    ctx.beginPath();
    ctx.moveTo(-22, 60);
    ctx.quadraticCurveTo(-26, 90, -18, 100);
    ctx.lineTo(18, 100);
    ctx.quadraticCurveTo(26, 90, 22, 60);
    // Ramiona i szyjka (szyjka skierowana w górę: -y)
    ctx.quadraticCurveTo(24, 0, 10, -30);
    ctx.lineTo(8, -90); // Szyjka
    ctx.lineTo(-8, -90);
    ctx.lineTo(-10, -30);
    ctx.quadraticCurveTo(-24, 0, -22, 60);
    ctx.closePath();

    ctx.fillStyle = bottleGrad;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#a7f3d0';
    ctx.stroke();

    // Zakrętka na czubku (szyjka)
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(-9, -96, 18, 8);
    ctx.strokeStyle = '#fbbf24';
    ctx.strokeRect(-9, -96, 18, 8);

    // Etykieta na Butelce
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-16, 20, 32, 35);
    ctx.fillStyle = '#1e1b4b';
    ctx.font = 'extrabold 10px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SPIN', 0, 37);

    // Błyszczące refleksy światła na szkle
    ctx.beginPath();
    ctx.moveTo(-15, 50);
    ctx.lineTo(-6, -75);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.stroke();

    ctx.restore();
  }

  spin() {
    if (this.isSpinning || !this.items || this.items.length === 0) return;

    this.isSpinning = true;
    const startTime = performance.now();
    const startAngle = this.currentAngle;

    const fullRotations = 6 + Math.floor(Math.random() * 6);
    const randomTarget = Math.random() * Math.PI * 2;
    const totalDelta = fullRotations * Math.PI * 2 + randomTarget;
    const targetAngle = startAngle + totalDelta;

    const sectorAngle = (Math.PI * 2) / this.items.length;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / this.spinDuration);

      const easeOut = 1 - Math.pow(1 - progress, 3.8);
      this.currentAngle = startAngle + totalDelta * easeOut;

      // Szyjka butelki celuje pod kątem (currentAngle - Math.PI / 2)
      // Sprawdzanie sektora
      const tipAngle = (this.currentAngle - Math.PI / 2 + Math.PI * 4) % (Math.PI * 2);
      const currentSector = Math.floor(tipAngle / sectorAngle);

      if (currentSector !== this.lastSectorIndex) {
        this.lastSectorIndex = currentSector;
        if (window.soundEngine) window.soundEngine.playTick();
      }

      this.draw();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.isSpinning = false;
        this.currentAngle = targetAngle % (Math.PI * 2);
        this.draw();

        const winnerIndex = this.calculateWinnerIndex();
        const winnerItem = this.items[winnerIndex];

        if (this.onSpinComplete) {
          this.onSpinComplete(winnerItem, winnerIndex);
        }
      }
    };

    requestAnimationFrame(animate);
  }

  calculateWinnerIndex() {
    if (!this.items || this.items.length === 0) return -1;
    const count = this.items.length;
    const sectorAngle = (2 * Math.PI) / count;

    // Szyjka butelki znajduje się pod kątem -Math.PI / 2 w lokalnym układzie butelki
    // Zatem aktualny kąt szyjki w przestrzeni świata to: (this.currentAngle - Math.PI/2)
    let pointerAngle = (this.currentAngle - Math.PI / 2) % (2 * Math.PI);
    if (pointerAngle < 0) pointerAngle += 2 * Math.PI;

    // Odnajdujemy najbliższy sektor opcji (sektory są w kątach i * sectorAngle)
    let minDiff = Infinity;
    let closestIndex = 0;

    for (let i = 0; i < count; i++) {
      const targetSectorAngle = (i * sectorAngle) % (2 * Math.PI);
      let diff = Math.abs(pointerAngle - targetSectorAngle);
      if (diff > Math.PI) diff = 2 * Math.PI - diff;

      if (diff < minDiff) {
        minDiff = diff;
        closestIndex = i;
      }
    }

    return closestIndex;
  }
}

window.BottleEngine = BottleEngine;
