/**
 * App - Główna logika i obsługa Multi-Mode Centrum Losowań
 */
document.addEventListener('DOMContentLoaded', () => {
  // 1. Domyślny Stan Aplikacji
  const DEFAULT_ITEMS = [
    { id: '1', text: 'Pizza 🍕', color: '' },
    { id: '2', text: 'Burger 🍔', color: '' },
    { id: '3', text: 'Sushi 🍣', color: '' },
    { id: '4', text: 'Kebab 🥙', color: '' },
    { id: '5', text: 'Sałatka 🥗', color: '' },
    { id: '6', text: 'Tacos 🌮', color: '' }
  ];

  const PRESETS = {
    lunch: ['Pizza 🍕', 'Burger 🍔', 'Sushi 🍣', 'Kebab 🥙', 'Sałatka 🥗', 'Tacos 🌮', 'Pasta 🍝', 'Ramen 🍜'],
    yesno: ['Tak! ✅', 'Nie ❌', 'Zdecydowanie Tak! 🌟', 'Może jutro ⏳', 'Zapytaj ponownie ❓', 'Zrób to! 🚀'],
    chores: ['Osoba 1 👤', 'Osoba 2 👤', 'Osoba 3 👤', 'Wszyscy razem 🤝'],
    numbers: ['Liczba 1', 'Liczba 2', 'Liczba 3', 'Liczba 4', 'Liczba 5', 'Liczba 6', 'Liczba 7', 'Liczba 8', 'Liczba 9', 'Liczba 10'],
    'truth-dare': ['Prawda 🤫', 'Wyzwanie ⚡', 'Prawda 🤫', 'Wyzwanie ⚡', 'Pytanie od sąsiada ❓', 'Podwójne wyzwanie 🔥'],
    movies: ['Komedia 🎭', 'Horror 👻', 'Sci-Fi 🚀', 'Akcja 💥', 'Dramat 🎬', 'Animacja 🎨', 'Dokument 📹']
  };

  let state = {
    items: JSON.parse(localStorage.getItem('wheel_items')) || DEFAULT_ITEMS,
    history: JSON.parse(localStorage.getItem('wheel_history')) || [],
    settings: JSON.parse(localStorage.getItem('wheel_settings')) || {
      duration: 5,
      autoRemove: false,
      sound: true,
      tts: true,
      palette: 'vibrant'
    },
    activeMode: 'mode-wheel',
    lastWinnerIndex: -1
  };

  // 2. Inicjalizacja Wszystkich Silników Losowania
  const wheel = new WheelEngine('wheel-canvas', 'wheel-pointer');
  const bottle = new BottleEngine('bottle-canvas');
  const lottery = new LotteryEngine('lottery-canvas');
  const coin = new CoinEngine('coin-3d');

  function updateEngines() {
    wheel.setPalette(state.settings.palette);
    wheel.setSpinDuration(state.settings.duration);
    wheel.setItems(state.items);

    bottle.setSpinDuration(state.settings.duration);
    bottle.setItems(state.items);

    lottery.setItems(state.items);
  }

  if (window.soundEngine) {
    window.soundEngine.enabled = state.settings.sound;
  }

  // Elementy DOM
  const itemsListEl = document.getElementById('items-list');
  const itemsCountEl = document.getElementById('items-count');
  const emptyStateEl = document.getElementById('empty-state');
  const newItemInput = document.getElementById('new-item-input');
  const btnAddItem = document.getElementById('btn-add-item');
  const btnClearItems = document.getElementById('btn-clear-items');
  const btnShuffle = document.getElementById('btn-shuffle');

  const btnSpin = document.getElementById('btn-spin');
  const btnSpinCenter = document.getElementById('btn-spin-center');
  const btnSpinBottle = document.getElementById('btn-spin-bottle');
  const btnDrawLottery = document.getElementById('btn-draw-lottery');
  const btnFlipCoin = document.getElementById('btn-flip-coin');

  const btnOpenBulk = document.getElementById('btn-open-bulk');
  const btnExportJson = document.getElementById('btn-export-json');
  const btnImportJson = document.getElementById('btn-import-json');
  const fileImportInput = document.getElementById('file-import-input');

  const modalBulk = document.getElementById('modal-bulk');
  const bulkTextarea = document.getElementById('bulk-textarea');
  const btnSaveBulk = document.getElementById('btn-save-bulk');

  const modalWinner = document.getElementById('modal-winner');
  const winnerText = document.getElementById('winner-text');
  const btnRemoveWinner = document.getElementById('btn-remove-winner');
  const btnSpinAgain = document.getElementById('btn-spin-again');

  const modalShortcuts = document.getElementById('modal-shortcuts');
  const btnShortcuts = document.getElementById('btn-shortcuts');

  const historyListEl = document.getElementById('history-list');
  const historyEmptyEl = document.getElementById('history-empty');
  const btnClearHistory = document.getElementById('btn-clear-history');

  const spinDurationInput = document.getElementById('spin-duration');
  const spinDurationVal = document.getElementById('spin-duration-val');
  const autoRemoveInput = document.getElementById('auto-remove');
  const soundEffectsInput = document.getElementById('sound-effects');
  const ttsEnabledInput = document.getElementById('tts-enabled');
  const colorPaletteSelect = document.getElementById('color-palette');
  const btnSoundToggle = document.getElementById('btn-sound-toggle');
  const btnFullscreen = document.getElementById('btn-fullscreen');

  // 3. Przełączanie Trybów Losowania (Mode Switcher)
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.mode-container').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetMode = btn.getAttribute('data-mode');
      state.activeMode = targetMode;
      document.getElementById(targetMode).classList.add('active');

      // Odświeżenie płótna
      if (targetMode === 'mode-wheel') wheel.draw();
      if (targetMode === 'mode-bottle') bottle.draw();
      if (targetMode === 'mode-lottery') lottery.initBalls();
    });
  });

  // 4. Renderowanie Listy Elementów
  function renderItems() {
    itemsListEl.innerHTML = '';
    itemsCountEl.textContent = state.items.length;

    if (state.items.length === 0) {
      emptyStateEl.classList.remove('hidden');
    } else {
      emptyStateEl.classList.add('hidden');

      state.items.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'item-row';
        const color = wheel.getItemColor(index);

        li.innerHTML = `
          <div class="item-left">
            <div class="color-badge" style="background-color: ${color}"></div>
            <input type="text" class="item-text-input" value="${escapeHtml(item.text)}" data-index="${index}">
          </div>
          <div class="item-actions">
            <button class="btn-remove-item" data-index="${index}" title="Usuń opcję">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>
        `;
        itemsListEl.appendChild(li);
      });
    }

    updateEngines();
    saveState();
  }

  function escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function saveState() {
    localStorage.setItem('wheel_items', JSON.stringify(state.items));
    localStorage.setItem('wheel_history', JSON.stringify(state.history));
    localStorage.setItem('wheel_settings', JSON.stringify(state.settings));
  }

  function addItem(text) {
    const trimmed = text.trim();
    if (!trimmed) return;
    state.items.push({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 4),
      text: trimmed,
      color: ''
    });
    newItemInput.value = '';
    renderItems();
  }

  btnAddItem.addEventListener('click', () => addItem(newItemInput.value));
  newItemInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addItem(newItemInput.value);
  });

  itemsListEl.addEventListener('change', (e) => {
    if (e.target.classList.contains('item-text-input')) {
      const idx = parseInt(e.target.getAttribute('data-index'));
      const val = e.target.value.trim();
      if (val && state.items[idx]) {
        state.items[idx].text = val;
        renderItems();
      }
    }
  });

  itemsListEl.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.btn-remove-item');
    if (removeBtn) {
      const idx = parseInt(removeBtn.getAttribute('data-index'));
      state.items.splice(idx, 1);
      renderItems();
    }
  });

  btnClearItems.addEventListener('click', () => {
    if (state.items.length === 0) return;
    if (confirm('Czy na pewno chcesz usunąć wszystkie elementy?')) {
      state.items = [];
      renderItems();
    }
  });

  btnShuffle.addEventListener('click', () => {
    if (state.items.length < 2) return;
    for (let i = state.items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [state.items[i], state.items[j]] = [state.items[j], state.items[i]];
    }
    renderItems();
  });

  btnOpenBulk.addEventListener('click', () => {
    bulkTextarea.value = state.items.map(item => item.text).join('\n');
    modalBulk.classList.remove('hidden');
  });

  btnSaveBulk.addEventListener('click', () => {
    const lines = bulkTextarea.value.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    state.items = lines.map((text, idx) => ({
      id: (Date.now() + idx).toString(),
      text: text,
      color: ''
    }));
    renderItems();
    modalBulk.classList.add('hidden');
  });

  btnExportJson.addEventListener('click', () => {
    if (state.items.length === 0) {
      alert('Brak elementów do wyeksportowania!');
      return;
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "elementy_losowania.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  });

  btnImportJson.addEventListener('click', () => fileImportInput.click());

  fileImportInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target.result;
        let parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          state.items = parsed.map((item, idx) => ({
            id: item.id || (Date.now() + idx).toString(),
            text: typeof item === 'string' ? item : (item.text || `Opcja ${idx + 1}`),
            color: item.color || ''
          }));
          renderItems();
        }
      } catch (err) {
        alert('Błąd wczytywania pliku JSON. Upewnij się, że plik ma poprawny format.');
      }
    };
    reader.readAsText(file);
    fileImportInput.value = '';
  });

  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close');
      document.getElementById(modalId).classList.add('hidden');
    });
  });

  document.querySelectorAll('.tab-btn').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      tabBtn.classList.add('active');
      const tabId = tabBtn.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });

  document.querySelectorAll('.preset-card').forEach(card => {
    card.addEventListener('click', () => {
      const key = card.getAttribute('data-preset');
      if (PRESETS[key]) {
        state.items = PRESETS[key].map((text, idx) => ({
          id: (Date.now() + idx).toString(),
          text: text,
          color: ''
        }));
        renderItems();
        document.querySelector('[data-tab="tab-items"]').click();
      }
    });
  });

  // 5. Reakcja na Zwycięstwo w dowolnym trybie
  function handleWin(winnerItem, winnerIndex, modeName = 'Koło') {
    state.lastWinnerIndex = winnerIndex;
    const winnerName = winnerItem ? winnerItem.text : 'Brak wyników';
    winnerText.textContent = winnerName;

    if (state.settings.sound && window.soundEngine) window.soundEngine.playFanfare();
    if (state.settings.tts && window.soundEngine) window.soundEngine.speakWinner(winnerName);
    if (window.confettiEngine) window.confettiEngine.launch();

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    state.history.unshift({ winner: `${winnerName} (${modeName})`, time: timeStr });
    renderHistory();

    modalWinner.classList.remove('hidden');

    if (state.settings.autoRemove && winnerIndex >= 0 && winnerIndex < state.items.length) {
      setTimeout(() => {
        state.items.splice(winnerIndex, 1);
        renderItems();
      }, 500);
    }
  }

  wheel.onSpinComplete = (item, idx) => handleWin(item, idx, 'Koło Fortuny');
  bottle.onSpinComplete = (item, idx) => handleWin(item, idx, 'Butelka');
  lottery.onSpinComplete = (item, idx) => handleWin(item, idx, 'Loteria');
  coin.onSpinComplete = (item, idx) => handleWin(item, idx, 'Moneta');

  function triggerSpinForActiveMode() {
    if (state.activeMode === 'mode-wheel') wheel.spin();
    else if (state.activeMode === 'mode-bottle') bottle.spin();
    else if (state.activeMode === 'mode-lottery') lottery.spin();
    else if (state.activeMode === 'mode-coin') coin.flip();
  }

  // Obsługa skrótów klawiszowych
  if (btnShortcuts) {
    btnShortcuts.addEventListener('click', () => modalShortcuts.classList.remove('hidden'));
  }

  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      if (!modalWinner.classList.contains('hidden')) {
        modalWinner.classList.add('hidden');
        triggerSpinForActiveMode();
      } else {
        triggerSpinForActiveMode();
      }
    } else if (e.code === 'Escape') {
      document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.add('hidden'));
    }
  });

  // Triggerowanie losowań dla każdego trybu
  btnSpin.addEventListener('click', () => wheel.spin());
  btnSpinCenter.addEventListener('click', () => wheel.spin());
  document.getElementById('wheel-canvas').addEventListener('click', () => wheel.spin());

  btnSpinBottle.addEventListener('click', () => bottle.spin());
  document.getElementById('bottle-canvas').addEventListener('click', () => bottle.spin());

  btnDrawLottery.addEventListener('click', () => lottery.spin());
  document.getElementById('lottery-canvas').addEventListener('click', () => lottery.spin());

  btnFlipCoin.addEventListener('click', () => coin.flip());
  document.getElementById('coin-3d').addEventListener('click', () => coin.flip());

  btnRemoveWinner.addEventListener('click', () => {
    if (state.lastWinnerIndex >= 0 && state.lastWinnerIndex < state.items.length) {
      state.items.splice(state.lastWinnerIndex, 1);
      renderItems();
    }
    modalWinner.classList.add('hidden');
  });

  btnSpinAgain.addEventListener('click', () => {
    modalWinner.classList.add('hidden');
    triggerSpinForActiveMode();
  });

  // 6. Historia
  function renderHistory() {
    historyListEl.innerHTML = '';
    if (state.history.length === 0) {
      historyEmptyEl.classList.remove('hidden');
    } else {
      historyEmptyEl.classList.add('hidden');
      state.history.slice(0, 30).forEach(h => {
        const li = document.createElement('li');
        li.className = 'history-item';
        li.innerHTML = `
          <span class="history-winner"><i class="fa-solid fa-award"></i> ${escapeHtml(h.winner)}</span>
          <span class="history-time">${h.time}</span>
        `;
        historyListEl.appendChild(li);
      });
    }
    saveState();
  }

  btnClearHistory.addEventListener('click', () => {
    state.history = [];
    renderHistory();
  });

  // 7. Ustawienia
  spinDurationInput.value = state.settings.duration;
  spinDurationVal.textContent = `${state.settings.duration}s`;
  autoRemoveInput.checked = state.settings.autoRemove;
  soundEffectsInput.checked = state.settings.sound;
  if (ttsEnabledInput) ttsEnabledInput.checked = state.settings.tts;
  colorPaletteSelect.value = state.settings.palette;

  spinDurationInput.addEventListener('input', (e) => {
    const val = parseInt(e.target.value);
    state.settings.duration = val;
    spinDurationVal.textContent = `${val}s`;
    wheel.setSpinDuration(val);
    bottle.setSpinDuration(val);
    saveState();
  });

  autoRemoveInput.addEventListener('change', (e) => {
    state.settings.autoRemove = e.target.checked;
    saveState();
  });

  if (ttsEnabledInput) {
    ttsEnabledInput.addEventListener('change', (e) => {
      state.settings.tts = e.target.checked;
      saveState();
    });
  }

  function updateSoundState(enabled) {
    state.settings.sound = enabled;
    soundEffectsInput.checked = enabled;
    if (window.soundEngine) window.soundEngine.enabled = enabled;

    const icon = btnSoundToggle.querySelector('i');
    if (enabled) {
      icon.className = 'fa-solid fa-volume-high';
      btnSoundToggle.style.color = 'var(--text-main)';
    } else {
      icon.className = 'fa-solid fa-volume-xmark';
      btnSoundToggle.style.color = 'var(--accent-danger)';
    }
    saveState();
  }

  soundEffectsInput.addEventListener('change', (e) => updateSoundState(e.target.checked));
  btnSoundToggle.addEventListener('click', () => updateSoundState(!state.settings.sound));

  colorPaletteSelect.addEventListener('change', (e) => {
    state.settings.palette = e.target.value;
    wheel.setPalette(e.target.value);
    renderItems();
    saveState();
  });

  btnFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Błąd trybu pełnoekranowego', err);
      });
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  });

  const btnLangToggle = document.getElementById('btn-lang-toggle');
  if (btnLangToggle) {
    btnLangToggle.addEventListener('click', () => {
      const nextLang = window.i18n.lang === 'pl' ? 'en' : 'pl';
      window.i18n.setLang(nextLang);
    });
  }

  if (window.i18n) {
    window.i18n.apply();
  }

  renderItems();
  renderHistory();
  updateSoundState(state.settings.sound);
});
