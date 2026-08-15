/**
 * CoinEngine - Logika i obsługa 3D Rzutu Monetą (Orzeł czy Reszka)
 */
class CoinEngine {
  constructor(coinElId) {
    this.coinEl = document.getElementById(coinElId);
    this.isFlipping = false;
    this.currentRotation = 0;
    this.onSpinComplete = null;
  }

  flip(customSide = null) {
    if (this.isFlipping || !this.coinEl) return;

    this.isFlipping = true;
    if (window.soundEngine) window.soundEngine.playCoinFlip();

    // Losowanie wyniku (0 = Orzeł, 1 = Reszka)
    const resultSide = customSide !== null ? customSide : (Math.random() > 0.5 ? 1 : 0);

    // Kąt obrotu: minimum 5 pełnych obrotów (1800 deg) + poprawny kąt dla wyniku
    const extraRotations = 5 * 360;
    const targetDeg = resultSide === 1 ? extraRotations + 180 : extraRotations;
    this.currentRotation += targetDeg;

    this.coinEl.style.transition = 'transform 2.5s cubic-bezier(0.25, 1, 0.5, 1)';
    this.coinEl.style.transform = `translateY(-140px) rotateY(${this.currentRotation}deg)`;

    setTimeout(() => {
      // Powrót w dół po osiągnięciu szczytu
      this.coinEl.style.transform = `translateY(0px) rotateY(${this.currentRotation}deg)`;
    }, 1200);

    setTimeout(() => {
      this.isFlipping = false;
      const headsText = window.i18n ? window.i18n.t('coinHeadsResult') : 'ORZEŁ 🦅';
      const tailsText = window.i18n ? window.i18n.t('coinTailsResult') : 'RESZKA 🪙';
      const resultText = resultSide === 0 ? headsText : tailsText;
      if (this.onSpinComplete) {
        this.onSpinComplete({ text: resultText }, resultSide);
      }
    }, 2500);
  }
}

window.CoinEngine = CoinEngine;
