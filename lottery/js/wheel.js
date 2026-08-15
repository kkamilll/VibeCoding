/**
 * WheelEngine - Silnik renderowania Canvas i fizyki obrotu Koła Fortuny
 */
class WheelEngine {
  constructor(canvasId, pointerId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.pointerEl = document.getElementById(pointerId);

    this.items = [];
    this.currentAngle = 0; // w radianach
    this.isSpinning = false;
    this.palette = 'vibrant';
    this.spinDuration = 5000; // ms

    // Palety kolorów
    this.palettes = {
      vibrant: ['#6366f1', '#ec4899', '#06b6d4', '#f59e0b', '#10b981', '#8b5cf6', '#f43f5e', '#3b82f6', '#14b8a6', '#a855f7', '#eab308', '#f97316'],
      neon: ['#ff007f', '#00f0ff', '#7000ff', '#ffee00', '#00ff66', '#ff0055', '#00e5ff'],
      pastel: ['#fca5a5', '#fdba74', '#fef08a', '#86efac', '#67e8f9', '#a5b4fc', '#f472b6'],
      gold: ['#d97706', '#b45309', '#f59e0b', '#92400e', '#fef3c7', '#78350f', '#fbbf24']
    };

    this.lastPegIndex = -1;
    this.onSpinComplete = null;
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

  setPalette(paletteName) {
    if (this.palettes[paletteName]) {
      this.palette = paletteName;
      this.draw();
    }
  }

  setSpinDuration(seconds) {
    this.spinDuration = seconds * 1000;
  }

  getItemColor(index) {
    if (this.items[index] && this.items[index].color) {
      return this.items[index].color;
    }
    const colors = this.palettes[this.palette] || this.palettes.vibrant;
    return colors[index % colors.length];
  }

  draw() {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const width = 600;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 25;

    ctx.clearRect(0, 0, width, height);

    if (!this.items || this.items.length === 0) {
      // Rysowanie pustego koła zachęcającego
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#334155';
      ctx.stroke();

      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 22px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Dodaj elementy, aby zakręcić!', centerX, centerY);
      ctx.restore();
      return;
    }

    const numSlices = this.items.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(this.currentAngle);

    // 1. Rysowanie wycinków (slices)
    for (let i = 0; i < numSlices; i++) {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;
      const item = this.items[i];
      const color = this.getItemColor(i);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = color;
      ctx.fill();

      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.stroke();

      // 2. Tekst na wycinku
      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = this.getContrastingTextColor(color);

      // Skalowanie fontu w zależności od liczby wycinków
      let fontSize = Math.min(22, Math.max(12, Math.floor(320 / numSlices)));
      ctx.font = `bold ${fontSize}px "Outfit", sans-serif`;

      const maxTextWidth = radius - 60;
      let text = item.text || `Opcja ${i + 1}`;
      
      // Skracanie długiego tekstu
      if (ctx.measureText(text).width > maxTextWidth) {
        while (text.length > 3 && ctx.measureText(text + '...').width > maxTextWidth) {
          text = text.slice(0, -1);
        }
        text += '...';
      }

      ctx.fillText(text, radius - 30, 0);
      ctx.restore();
    }

    // 3. Zewnętrzny pierścień z kołkami (Pegs)
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.lineWidth = 12;
    ctx.strokeStyle = '#1e1b4b';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, radius + 4, 0, Math.PI * 2);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.stroke();

    // Kołki (pegs) na granicach wycinków
    for (let i = 0; i < numSlices; i++) {
      const pegAngle = i * sliceAngle;
      const pegX = Math.cos(pegAngle) * radius;
      const pegY = Math.sin(pegAngle) * radius;

      ctx.beginPath();
      ctx.arc(pegX, pegY, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#4f46e5';
      ctx.stroke();
    }

    ctx.restore();
  }

  getContrastingTextColor(hexColor) {
    // Prosta konwersja hex do jasności w celu wyboru białego lub czarnego tekstu
    if (!hexColor || !hexColor.startsWith('#')) return '#ffffff';
    const c = hexColor.substring(1);
    const rgb = parseInt(c, 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >>  8) & 0xff;
    const b = (rgb >>  0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma > 165 ? '#111827' : '#ffffff';
  }

  spin() {
    if (this.isSpinning || !this.items || this.items.length === 0) return;

    this.isSpinning = true;
    const startTime = performance.now();
    const startAngle = this.currentAngle;

    // Losowanie ilości pełnych obrotów (między 5 a 9) + losowy kąt docelowy
    const fullRotations = 5 + Math.floor(Math.random() * 5);
    const randomTargetAngle = Math.random() * Math.PI * 2;
    const totalDeltaAngle = fullRotations * Math.PI * 2 + randomTargetAngle;
    const targetAngle = startAngle + totalDeltaAngle;

    const sliceAngle = (Math.PI * 2) / this.items.length;

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / this.spinDuration);

      // Easing: Custom cubic ease-out (płynne wyhamowywanie)
      const easeOut = 1 - Math.pow(1 - progress, 3.5);
      this.currentAngle = startAngle + totalDeltaAngle * easeOut;

      // Sprawdzanie przechodzenia kołków pod wskaźnikiem (pozycja 12 o'clock = -90 stopni / 1.5 PI)
      const currentNormalized = (this.currentAngle + Math.PI / 2) % (Math.PI * 2);
      const currentPegIndex = Math.floor(currentNormalized / sliceAngle);

      if (currentPegIndex !== this.lastPegIndex) {
        this.lastPegIndex = currentPegIndex;
        if (window.soundEngine) {
          window.soundEngine.playTick();
        }
        if (this.pointerEl) {
          this.pointerEl.classList.remove('tick');
          void this.pointerEl.offsetWidth; // Trigger reflow
          this.pointerEl.classList.add('tick');
        }
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
    const numSlices = this.items.length;
    const sliceAngle = (2 * Math.PI) / numSlices;
    
    // Wskaźnik znajduje się na samej górze (270° lub -90° = 1.5 * PI)
    const pointerAngle = (1.5 * Math.PI) % (2 * Math.PI);
    const normalizedAngle = (pointerAngle - (this.currentAngle % (2 * Math.PI)) + 4 * Math.PI) % (2 * Math.PI);
    
    const winnerIndex = Math.floor(normalizedAngle / sliceAngle) % numSlices;
    return winnerIndex;
  }
}

window.WheelEngine = WheelEngine;
