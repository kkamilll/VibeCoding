/**
 * i18n.js - Słownik tłumaczeń i obsługa dwujęzyczności (PL / EN)
 */
const TRANSLATIONS = {
  pl: {
    // Nagłówek i Nawigacja
    appTitle: "Centrum Losowań",
    appSubtitle: "Wpisz opcje i wybierz ulubiony sposób losowania!",
    modeWheel: "Koło Fortuny",
    modeBottle: "Zakręć Butelką",
    modeLottery: "Maszyna Loterii",
    modeCoin: "Orzeł czy Reszka",
    
    // Przyciski aktywacji
    spinCenterBtn: "LOSUJ!",
    btnSpinWheel: "Zakręć Kołem",
    btnSpinBottle: "Zakręć Butelką!",
    btnDrawLottery: "Wylosuj Kulę!",
    btnFlipCoin: "Rzuć Monetą!",
    btnShuffle: "Wymieszaj",
    
    // Zakładki
    tabItems: "Elementy",
    tabPresets: "Szablony",
    tabHistory: "Historia",
    tabSettings: "Ustawienia",
    
    // Zakładka 1: Elementy
    inputPlaceholder: "Wpisz nową opcję i naciśnij Enter...",
    btnAdd: "Dodaj",
    btnBulk: "Wklej wiele",
    btnExport: "Eksportuj",
    btnImport: "Importuj",
    btnClearItems: "Wyczyść",
    emptyStateTitle: "Brak elementów do losowania.",
    emptyStateSub: "Wpisz nową opcję powyżej lub wybierz gotowy szablon!",
    
    // Zakładka 2: Szablony
    presetsDesc: "Wybierz gotowy zestaw opcji jednym kliknięciem:",
    presetLunchTitle: "Co na obiad?",
    presetLunchDesc: "Pizza, Burger, Sushi, Kebab, Sałatka...",
    presetYesNoTitle: "Tak czy Nie?",
    presetYesNoDesc: "Tak, Nie, Zdecydowanie Tak, Może jutro...",
    presetChoresTitle: "Kto zmywa naczynia?",
    presetChoresDesc: "Osoba 1, Osoba 2, Osoba 3, Wszyscy razem",
    presetNumbersTitle: "Liczba 1 - 10",
    presetNumbersDesc: "Losowe numery od 1 do 10",
    presetTruthDareTitle: "Prawda czy Wyzwanie",
    presetTruthDareDesc: "Prawda, Wyzwanie, Pytanie od sąsiada...",
    presetMoviesTitle: "Gatunek filmowy",
    presetMoviesDesc: "Komedia, Horror, Sci-Fi, Akcja, Dramat...",
    
    // Zakładka 3: Historia
    historyTitle: "Wyniki ostatnich losowań",
    btnClearHistory: "Wyczyść historię",
    historyEmptyTitle: "Brak historii losowań",
    historyEmptySub: "Wykonaj losowanie, aby zobaczyć pierwsze wyniki!",
    
    // Zakładka 4: Ustawienia
    labelSpinDuration: "Czas trwania losowania",
    descSpinDuration: "Długość animacji obrotu (3 - 15 s)",
    labelAutoRemove: "Auto-usuwanie wygranego",
    descAutoRemove: "Automatycznie usuwaj wylosowany element z listy",
    labelSoundEffects: "Efekty dźwiękowe",
    descSoundEffects: "Dźwięki cykania, brzęku monety i fanfary",
    labelTtsEnabled: "Lektor głosowy (Speech API)",
    descTtsEnabled: "Czytanie na głos wylosowanego zwycięzcy",
    labelColorPalette: "Motyw kolorów wycinków",
    descColorPalette: "Zestaw barw dla sekcji i elementów",
    paletteVibrant: "Żywy i tęczowy",
    paletteNeon: "Cyberpunk Neon",
    palettePastel: "Subtelny Pastel",
    paletteGold: "Złoty & Elegancja",
    
    // Modale
    modalBulkTitle: "Masowy Edytor Opcji",
    modalBulkBody: "Wpisz lub wklej elementy (każda nowa linijka to jeden element):",
    bulkPlaceholder: "Ania\nBartek\nCezary\nDariusz...",
    btnCancel: "Anuluj",
    btnSaveBulk: "Zapisz elementy",
    
    winnerTitle: "WYLOSOWANO!",
    btnRemoveWinner: "Usuń i losuj dalej",
    btnSpinAgain: "Zakręć ponownie",
    
    shortcutsTitle: "Skróty Klawiszowe",
    shortcutSpin: "– Uruchom losowanie w wybranym trybie",
    shortcutClose: "– Zamknij okno dialogowe / wygranej",
    btnClose: "Zamknij",
    
    // Etykiety monety
    coinHeads: "ORZEŁ",
    coinTails: "RESZKA",
    coinHeadsResult: "ORZEŁ 🦅",
    coinTailsResult: "RESZKA 🪙",
    
    // Mowa Lektora
    ttsAnnouncement: "Wylosowano:"
  },
  en: {
    // Header & Nav
    appTitle: "Lottery Hub",
    appSubtitle: "Type your options and pick your favorite draw mode!",
    modeWheel: "Wheel of Fortune",
    modeBottle: "Spin the Bottle",
    modeLottery: "Lottery Machine",
    modeCoin: "Heads or Tails",
    
    // Activation Buttons
    spinCenterBtn: "SPIN!",
    btnSpinWheel: "Spin the Wheel",
    btnSpinBottle: "Spin the Bottle!",
    btnDrawLottery: "Draw a Ball!",
    btnFlipCoin: "Flip Coin!",
    btnShuffle: "Shuffle",
    
    // Tabs
    tabItems: "Items",
    tabPresets: "Presets",
    tabHistory: "History",
    tabSettings: "Settings",
    
    // Tab 1: Items
    inputPlaceholder: "Type a new option and press Enter...",
    btnAdd: "Add",
    btnBulk: "Bulk Edit",
    btnExport: "Export",
    btnImport: "Import",
    btnClearItems: "Clear",
    emptyStateTitle: "No items to draw.",
    emptyStateSub: "Type a new option above or select a ready preset!",
    
    // Tab 2: Presets
    presetsDesc: "Choose a ready preset option set with one click:",
    presetLunchTitle: "What's for Lunch?",
    presetLunchDesc: "Pizza, Burger, Sushi, Kebab, Salad...",
    presetYesNoTitle: "Yes or No?",
    presetYesNoDesc: "Yes, No, Definitely Yes, Maybe Tomorrow...",
    presetChoresTitle: "Who does the dishes?",
    presetChoresDesc: "Person 1, Person 2, Person 3, Everyone together",
    presetNumbersTitle: "Numbers 1 - 10",
    presetNumbersDesc: "Random numbers from 1 to 10",
    presetTruthDareTitle: "Truth or Dare",
    presetTruthDareDesc: "Truth, Dare, Neighbor Question...",
    presetMoviesTitle: "Movie Genre",
    presetMoviesDesc: "Comedy, Horror, Sci-Fi, Action, Drama...",
    
    // Tab 3: History
    historyTitle: "Recent Draw Results",
    btnClearHistory: "Clear History",
    historyEmptyTitle: "No draw history",
    historyEmptySub: "Make a spin to see your first results!",
    
    // Tab 4: Settings
    labelSpinDuration: "Spin Duration",
    descSpinDuration: "Rotation animation length (3 - 15 s)",
    labelAutoRemove: "Auto-remove winner",
    descAutoRemove: "Automatically remove drawn item from the list",
    labelSoundEffects: "Sound Effects",
    descSoundEffects: "Tick, coin flip, and fanfare sounds",
    labelTtsEnabled: "Voice Narrator (Speech API)",
    descTtsEnabled: "Read winner name out loud",
    labelColorPalette: "Slice Color Theme",
    descColorPalette: "Color palette for sections and items",
    paletteVibrant: "Vivid & Rainbow",
    paletteNeon: "Cyberpunk Neon",
    palettePastel: "Subtle Pastel",
    paletteGold: "Gold & Elegance",
    
    // Modals
    modalBulkTitle: "Bulk Option Editor",
    modalBulkBody: "Type or paste items (each line is one item):",
    bulkPlaceholder: "Alice\nBob\nCharlie\nDavid...",
    btnCancel: "Cancel",
    btnSaveBulk: "Save Items",
    
    winnerTitle: "WINNER!",
    btnRemoveWinner: "Remove & Keep Drawing",
    btnSpinAgain: "Spin Again",
    
    shortcutsTitle: "Keyboard Shortcuts",
    shortcutSpin: "– Launch draw in active mode",
    shortcutClose: "– Close modal / winner dialog",
    btnClose: "Close",
    
    // Coin Labels
    coinHeads: "HEADS",
    coinTails: "TAILS",
    coinHeadsResult: "HEADS 🦅",
    coinTailsResult: "TAILS 🪙",
    
    // TTS speech
    ttsAnnouncement: "The winner is:"
  }
};

class I18nEngine {
  constructor() {
    this.lang = localStorage.getItem('wheel_lang') || 'pl';
  }

  setLang(lang) {
    if (TRANSLATIONS[lang]) {
      this.lang = lang;
      localStorage.setItem('wheel_lang', lang);
      this.apply();
    }
  }

  t(key) {
    return (TRANSLATIONS[this.lang] && TRANSLATIONS[this.lang][key]) || key;
  }

  apply() {
    document.documentElement.lang = this.lang;

    // Update text elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);
      if (translation) {
        // If element has inner icon child, keep icon intact
        const icon = el.querySelector('i');
        if (icon) {
          const iconClone = icon.cloneNode(true);
          el.innerHTML = '';
          el.appendChild(iconClone);
          el.appendChild(document.createTextNode(' ' + translation));
        } else {
          el.textContent = translation;
        }
      }
    });

    // Update placeholder attributes with data-i18n-placeholder attribute
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const translation = this.t(key);
      if (translation) {
        el.setAttribute('placeholder', translation);
      }
    });

    // Update Language Toggle button display if present
    const langBtn = document.getElementById('btn-lang-toggle');
    if (langBtn) {
      const label = langBtn.querySelector('span') || langBtn;
      label.textContent = this.lang.toUpperCase();
    }
  }
}

window.i18n = new I18nEngine();
