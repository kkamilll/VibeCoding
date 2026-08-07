/**
 * Catch My CV - Interactive Web App Logic
 * Enhanced with hilarious fishing loot table, Web Audio API sound synthesis, and dual-language (EN/PL) support.
 */

// Game State Enum
const STATE = {
    INTRO: 'intro',
    IDLE: 'idle',
    CASTING: 'casting',
    WAITING: 'waiting',
    BITING: 'biting',
    REELING: 'reeling',
    ITEM: 'item',
    CAUGHT: 'caught',
    SCROLL: 'scroll',
    CV: 'cv'
};

let currentState = STATE.INTRO;
let isMuted = false;
let audioController = null;
let currentLang = 'en'; // 'en' | 'pl'
let castCount = 0;

// Game State Variables
let rodTip = { x: 0, y: 0 };
let bobberPos = { x: 600, y: 560 };
let bobberTarget = { x: 750, y: 565 };
let castStartTime = 0;
let biteTimeout = null;
let biteInterval = null;
let reelInterval = null;
let boatAngle = 0;
let waterLevel = 560;

// Hilarious Catch Loot Table
const CATCH_ITEMS = [
    { icon: '🦆', sound: 'quack' },
    { icon: '👞', sound: 'splash' },
    { icon: '🐠', sound: 'chime' },
    { icon: '🥾', sound: 'splash' }
];

// Dual-Language Translations Object
const TRANSLATIONS = {
    en: {
        introTitle: "Catch My CV",
        introText: "Welcome to my interactive portfolio! Cast your fishing rod, be patient, and see what secrets lie in the deep ocean.",
        audioNotice: "This application uses Web Audio API real-time sound synthesis to generate immersive atmospheric audio effects.",
        btnSound: "Play with Sound 🔊",
        btnSilent: "Play Silent 🔇",
        statusIdle: "Click the button below to cast your fishing rod...",
        statusCasting: "Line in the air...",
        statusWaiting: "Calm waters... Waiting for a bite...",
        statusBiting: "FISH ON! Hook it fast! 🎣",
        btnCast: "Cast Line 🎣",
        btnHook: "HOOK IT! 🎣",
        btnReeling: "Reeling...",
        statusEscaped: "Oops... The fish got away. Try casting again!",
        statusReeling: "Reeling in your catch!",
        statusBack: "Back at the sea. Cast again to discover more secret catches!",
        actionHintBottle: "Click the bottle to extract the scroll!",
        actionHintScroll: "Click the wax seal to unroll the CV!",
        btnCloseCv: "↩ Roll up & toss into water",
        btnPrintCv: "Download PDF 📄",
        cvSubtitle: "Creative Web Developer & UX/UI Designer",
        cvAboutTitle: "About Me",
        cvAboutText: "I am passionate about building interactive web experiences where code meets design and fluid animation. I specialize in modern JavaScript, advanced CSS/HTML, and framework ecosystems (React, Next.js). I believe every website should tell a unique story – just like the one where you caught my CV!",
        cvExpTitle: "Work Experience",
        cvExp1Role: "Senior Creative Developer",
        cvExp1Company: '"Antigravity Dev" Creative Studio',
        cvExp1Desc: "Designing and developing high-end web applications with rich animations (Three.js, GreenSock). Leading front-end architecture and SPA performance optimization.",
        cvExp2Role: "Front-end Developer",
        cvExp2Company: '"WebWaves" Software House',
        cvExp2Desc: "Building client-side applications in React, integrating REST/GraphQL APIs. Collaborating closely with UI/UX teams to implement dynamic design systems.",
        cvExp3Role: "Junior Web Developer",
        cvExp3Company: '"BlueOcean" Interactive Agency',
        cvExp3Desc: "Coding responsive landing pages, customizing WordPress themes, and optimizing HTML/CSS for SEO and performance.",
        cvSkillsTitle: "Skills",
        cvEduTitle: "Education",
        cvEduDegree: "Master of Computer Science",
        cvEduDegree2: "Master's Degree, Computer Science (2018 - 2020)",
        cvEduSchool: "Gdansk University of Technology (2017 - 2022)",
        cvEduSpec: "Specialization: Software Engineering & Database Systems",
        cvLangTitle: "Languages",
        cvLangEn: "English: C1 (Full professional fluency)",
        cvLangDe: "German: A2 (Elementary)",
        cvAgreement: "I hereby give consent for my personal data to be processed for recruitment purposes."
    },
    pl: {
        introTitle: "Złów Moje CV",
        introText: "Witaj w moim interaktywnym portfolio! Zarzuć wędkę, wykaż się cierpliwością i zobacz, jakie skarby kryją się w głębinach oceanu.",
        audioNotice: "Aplikacja wykorzystuje syntezę dźwięku Web Audio API w czasie rzeczywistym, tworząc klimatyczne efekty dźwiękowe.",
        btnSound: "Graj z Dźwiękiem 🔊",
        btnSilent: "Graj Wyciszony 🔇",
        statusIdle: "Kliknij przycisk poniżej, aby zarzucić wędkę...",
        statusCasting: "Spławik leci w powietrzu...",
        statusWaiting: "Spokojna woda... Czekamy na branie...",
        statusBiting: "MAMY BRANIE! Zaciągaj szybko! 🎣",
        btnCast: "Zarzuć Wędkę 🎣",
        btnHook: "ZACIĄGAJ! 🎣",
        btnReeling: "Zwijanie...",
        statusEscaped: "Ups... Ryba uciekła z haczyka. Spróbuj ponownego rzutu!",
        statusReeling: "Zwijamy żyłkę z wyłowionym skarbem!",
        statusBack: "Powrót na morze. Zarzuć ponownie, by odkryć kolejne znaleziska!",
        actionHintBottle: "Kliknij butelkę, aby wyciągnąć zwój z CV!",
        actionHintScroll: "Kliknij pieczęć lakową, aby rozwinąć pergamin!",
        btnCloseCv: "↩ Zwiń pergamin i wrzuć do wody",
        btnPrintCv: "Pobierz PDF 📄",
        cvSubtitle: "Kreatywny Programista Webowy & Projektant UX/UI",
        cvAboutTitle: "O Mnie",
        cvAboutText: "Tworzę interaktywne doświadczenia internetowe, łącząc czysty kod, nowoczesny design i płynne animacje. Specjalizuję się w JavaScript (ES6+), advanced CSS/HTML oraz ekosystemie React/Next.js. Wierzę, że każda strona powinna opowiadać wyjątkową historię – dokładnie taką jak ta, w której właśnie wyłowiłeś moje CV!",
        cvExpTitle: "Doświadczenie Zawodowe",
        cvExp1Role: "Senior Creative Developer",
        cvExp1Company: 'Studio Kreatywne "Antigravity Dev"',
        cvExp1Desc: "Projektowanie i rozwój zaawansowanych aplikacji webowych z animacjami 2D/3D (Three.js, GSAP). Prowadzenie architektury front-endu i optymalizacja wydajności.",
        cvExp2Role: "Front-end Developer",
        cvExp2Company: 'Software House "WebWaves"',
        cvExp2Desc: "Tworzenie aplikacji w React.js, integracja z REST/GraphQL API. Ścisła współpraca z zespołami UI/UX nad wdrażaniem dynamicznych systemów designu.",
        cvExp3Role: "Junior Web Developer",
        cvExp3Company: 'Agencja Interaktywna "BlueOcean"',
        cvExp3Desc: "Kodowanie responzywnych landing page'i, dostosowywanie motywów WordPress oraz optymalizacja HTML/CSS pod kątem SEO i szybkości ładowania.",
        cvSkillsTitle: "Umiejętności",
        cvEduTitle: "Edukacja",
        cvEduDegree: "Magister Inżynier Informatyki",
        cvEduDegree2: "Magister, Informatyka (2018 - 2020)",
        cvEduSchool: "Politechnika Gdańska (2017 - 2022)",
        cvEduSpec: "Specjalizacja: Inżynieria Oprogramowania i Systemy Baz Danych",
        cvLangTitle: "Języki",
        cvLangEn: "Język Angielski: C1 (Pełna biegłość zawodowa)",
        cvLangDe: "Język Niemiecki: A2 (Podstawowy)",
        cvAgreement: "Wyrażam zgodę na przetwarzanie moich danych osobowych dla potrzeb niezbędnych do realizacji procesu rekrutacji."
    }
};

// DOM Elements
const btnStartAudio = document.getElementById('btn-start-audio');
const btnStartSilent = document.getElementById('btn-start-silent');
const introOverlay = document.getElementById('intro-overlay');
const topControls = document.getElementById('top-controls');
const langToggle = document.getElementById('lang-toggle');
const audioToggle = document.getElementById('audio-toggle');
const uiPanel = document.getElementById('ui-panel');
const gameStatus = document.getElementById('game-status');
const btnAction = document.getElementById('btn-action');
const gameScene = document.getElementById('game-scene');
const starsGroup = document.getElementById('stars');
const boatGroup = document.getElementById('boat-group');
const boatRocker = document.getElementById('boat-rocker');
const fishingRod = document.getElementById('fishing-rod');
const fishingLine = document.getElementById('fishing-line');
const bobber = document.getElementById('bobber');
const itemOverlay = document.getElementById('item-overlay');
const itemIcon = document.getElementById('item-icon');
const itemTitle = document.getElementById('item-title');
const btnRecast = document.getElementById('btn-recast');
const bottleOverlay = document.getElementById('bottle-overlay');
const bottleContainer = document.getElementById('bottle-container');
const scrollOverlay = document.getElementById('scroll-overlay');
const scrollClosed = document.getElementById('scroll-closed');
const cvOverlay = document.getElementById('cv-overlay');
const scrollUnrolledContainer = document.getElementById('scroll-unrolled-container');
const btnCloseCv = document.getElementById('btn-close-cv');
const btnPrintCv = document.getElementById('btn-print-cv');
const ripples = [
    document.getElementById('bobber-ripple-1'),
    document.getElementById('bobber-ripple-2')
];

/* ========================================================================= */
/* 1. AUDIO SYNTHESIZER (WEB AUDIO API)                                      */
/* ========================================================================= */
class SynthesizedAudioController {
    constructor() {
        this.ctx = null;
        this.masterGain = null;
        this.ambientGain = null;
        this.ambientOscs = [];
        this.ambientFilters = [];
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(isMuted ? 0 : 0.3, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
            this.setupAmbient();
            this.initialized = true;
        } catch (e) {
            console.error("Failed to initialize Web Audio API:", e);
        }
    }

    resume() {
        this.init();
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setMute(mute) {
        isMuted = mute;
        if (!this.initialized || !this.masterGain) return;
        if (mute) {
            this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
        } else {
            this.masterGain.gain.setTargetAtTime(0.3, this.ctx.currentTime, 0.1);
        }
    }

    createNoiseBuffer() {
        if (!this.ctx) return null;
        const bufferSize = 2 * this.ctx.sampleRate;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        return noiseBuffer;
    }

    setupAmbient() {
        if (!this.ctx) return;
        try {
            this.ambientGain = this.ctx.createGain();
            this.ambientGain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            this.ambientGain.connect(this.masterGain);

            const noise = this.ctx.createBufferSource();
            noise.buffer = this.createNoiseBuffer();
            noise.loop = true;

            const lowpass = this.ctx.createBiquadFilter();
            lowpass.type = 'lowpass';
            lowpass.Q.setValueAtTime(1, this.ctx.currentTime);
            lowpass.frequency.setValueAtTime(350, this.ctx.currentTime);

            const lfo = this.ctx.createOscillator();
            lfo.type = 'sine';
            lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);

            const lfoGain = this.ctx.createGain();
            lfoGain.gain.setValueAtTime(180, this.ctx.currentTime);

            lfo.connect(lfoGain);
            lfoGain.connect(lowpass.frequency);
            
            noise.connect(lowpass);
            lowpass.connect(this.ambientGain);

            lfo.start();
            noise.start();

            this.ambientOscs.push(lfo, noise);
            this.ambientFilters.push(lowpass);
        } catch (e) {
            console.error("Failed to synthesize ambient audio:", e);
        }
    }

    playSplash() {
        if (!this.initialized || isMuted) return;
        const now = this.ctx.currentTime;
        
        const osc = this.ctx.createOscillator();
        const gainOsc = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.18);
        
        gainOsc.gain.setValueAtTime(0.8, now);
        gainOsc.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        osc.connect(gainOsc);
        gainOsc.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.25);

        const noise = this.ctx.createBufferSource();
        const buf = this.createNoiseBuffer();
        if (!buf) return;
        noise.buffer = buf;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.setValueAtTime(4, now);
        filter.frequency.setValueAtTime(1200, now);
        filter.frequency.exponentialRampToValueAtTime(300, now + 0.35);

        const gainNoise = this.ctx.createGain();
        gainNoise.gain.setValueAtTime(0.3, now);
        gainNoise.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        noise.connect(filter);
        filter.connect(gainNoise);
        gainNoise.connect(this.masterGain);
        noise.start(now);
        noise.stop(now + 0.45);
    }

    playReelClick() {
        if (!this.initialized || isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(2500, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.03);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.04);
    }

    playQuack() {
        if (!this.initialized || isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(280, now + 0.15);
        osc.frequency.linearRampToValueAtTime(350, now + 0.3);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.35);
    }

    playChime() {
        if (!this.initialized || isMuted) return;
        const now = this.ctx.currentTime;
        const notes = [261.63, 329.63, 392.00, 493.88, 523.25, 659.25, 783.99, 987.77, 1046.50];
        
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const delay = idx * 0.08;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + delay);
            
            gain.gain.setValueAtTime(0, now + delay);
            gain.gain.linearRampToValueAtTime(0.2, now + delay + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.4);

            osc.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(now + delay);
            osc.stop(now + delay + 0.55);
        });
    }

    playPop() {
        if (!this.initialized || isMuted) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.08);

        gain.gain.setValueAtTime(0.7, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.15);
    }

    playPaperUnroll() {
        if (!this.initialized || isMuted) return;
        const now = this.ctx.currentTime;
        const buf = this.createNoiseBuffer();
        if (!buf) return;
        const noise = this.ctx.createBufferSource();
        noise.buffer = buf;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, now);
        filter.frequency.linearRampToValueAtTime(250, now + 0.8);
        filter.Q.setValueAtTime(1.5, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);

        noise.start(now);
        noise.stop(now + 0.85);
    }
}

/* ========================================================================= */
/* 2. INITIALIZATION & SETUP                                                 */
/* ========================================================================= */
window.addEventListener('DOMContentLoaded', () => {
    audioController = new SynthesizedAudioController();
    generateStars();
    generateBubbles();
    setupEventListeners();
    applyLanguage(currentLang);
    animateGameLoop();
});

// Generate dynamic blinking stars in background
function generateStars() {
    for (let i = 0; i < 60; i++) {
        const cx = Math.random() * 1200;
        const cy = Math.random() * 420;
        const r = Math.random() * 0.9 + 0.4;
        const opacity = Math.random() * 0.6 + 0.4;
        const blinkDelay = Math.random() * 4;
        
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', cx);
        circle.setAttribute('cy', cy);
        circle.setAttribute('r', r);
        circle.setAttribute('fill', '#ffffff');
        circle.setAttribute('opacity', opacity);
        circle.style.animation = `blinkStatus ${Math.random() * 2 + 2}s infinite alternate`;
        circle.style.animationDelay = `${blinkDelay}s`;
        
        starsGroup.appendChild(circle);
    }
}

// Generate underwater rising bubbles
function generateBubbles() {
    const bubblesGroup = document.getElementById('bubbles-group');
    if (!bubblesGroup) return;

    for (let i = 0; i < 15; i++) {
        const cx = 100 + Math.random() * 1000;
        const cy = 720 + Math.random() * 60;
        const r = Math.random() * 3 + 1.5;
        const delay = Math.random() * 5;
        const duration = Math.random() * 3 + 4;

        const bubble = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        bubble.setAttribute('cx', cx);
        bubble.setAttribute('cy', cy);
        bubble.setAttribute('r', r);
        bubble.setAttribute('fill', 'none');
        bubble.setAttribute('stroke', '#a5ffd6');
        bubble.setAttribute('stroke-width', '0.8');
        bubble.setAttribute('class', 'underwater-bubble');
        bubble.style.animationDuration = `${duration}s`;
        bubble.style.animationDelay = `${delay}s`;

        bubblesGroup.appendChild(bubble);
    }
}

// Event Listeners setup
function setupEventListeners() {
    btnStartAudio.addEventListener('click', () => {
        initAudio(true);
        startGame();
    });

    btnStartSilent.addEventListener('click', () => {
        initAudio(false);
        startGame();
    });

    // Language Toggle
    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'pl' : 'en';
        applyLanguage(currentLang);
    });

    // Mute button
    audioToggle.addEventListener('click', () => {
        isMuted = !isMuted;
        audioController.setMute(isMuted);
        
        const soundOnIcon = audioToggle.querySelector('.icon-sound-on');
        const soundOffIcon = audioToggle.querySelector('.icon-sound-off');
        
        if (isMuted) {
            soundOnIcon.classList.add('hidden');
            soundOffIcon.classList.remove('hidden');
        } else {
            soundOnIcon.classList.remove('hidden');
            soundOffIcon.classList.add('hidden');
        }
    });

    // Action button & SVG scene click
    btnAction.addEventListener('click', handleActionClick);
    gameScene.addEventListener('click', (e) => {
        if (e.target.closest('#ui-panel') || e.target.closest('#top-controls')) return;
        if (currentState === STATE.IDLE || currentState === STATE.BITING) {
            handleActionClick();
        }
    });

    // Hilarious Item Modal buttons
    btnRecast.addEventListener('click', () => {
        itemOverlay.classList.add('hidden');
        uiPanel.classList.remove('hidden');
        castLine();
    });

    // Interactive Bottle click
    bottleContainer.addEventListener('click', handleBottleClick);

    // Interactive Scroll click
    scrollClosed.addEventListener('click', handleScrollClick);

    // Close CV back to lake
    btnCloseCv.addEventListener('click', closeCvScroll);
    
    // Print/Save PDF
    btnPrintCv.addEventListener('click', () => {
        const skillFills = document.querySelectorAll('.skill-bar-fill');
        skillFills.forEach(fill => {
            if (fill.dataset.targetWidth) {
                fill.style.width = fill.dataset.targetWidth;
            }
        });
        window.print();
    });
}

function applyLanguage(lang) {
    currentLang = lang;
    const t = TRANSLATIONS[lang];

    // Update Language Toggle Button UI
    const code = langToggle.querySelector('.lang-code');
    if (code) {
        code.textContent = lang.toUpperCase();
    }

    // Intro Overlay Elements
    const introCard = document.querySelector('.intro-card');
    if (introCard) {
        const h1 = introCard.querySelector('h1');
        const ps = introCard.querySelectorAll('p');
        if (h1) h1.textContent = t.introTitle;
        if (ps[0]) ps[0].textContent = t.introText;
        if (ps[1]) ps[1].textContent = t.audioNotice;
    }
    if (btnStartAudio) btnStartAudio.textContent = t.btnSound;
    if (btnStartSilent) btnStartSilent.textContent = t.btnSilent;

    // Action Button & Status
    if (currentState === STATE.IDLE) {
        btnAction.textContent = t.btnCast;
        gameStatus.textContent = t.statusIdle;
    } else if (currentState === STATE.BITING) {
        btnAction.textContent = t.btnHook;
        gameStatus.textContent = t.statusBiting;
    }

    // Hints & Buttons
    const actionHints = document.querySelectorAll('.action-hint');
    if (actionHints[0]) actionHints[0].textContent = t.actionHintBottle;
    if (actionHints[1]) actionHints[1].textContent = t.actionHintScroll;

    if (btnCloseCv) btnCloseCv.textContent = t.btnCloseCv;
    if (btnPrintCv) btnPrintCv.textContent = t.btnPrintCv;

    // CV Parchment Content Translation
    const cvSubtitle = document.querySelector('.cv-subtitle');
    if (cvSubtitle) cvSubtitle.textContent = t.cvSubtitle;

    const sectionTitles = document.querySelectorAll('.section-title');
    if (sectionTitles[0]) sectionTitles[0].textContent = t.cvAboutTitle;
    if (sectionTitles[1]) sectionTitles[1].textContent = t.cvExpTitle;
    if (sectionTitles[2]) sectionTitles[2].textContent = t.cvSkillsTitle;
    if (sectionTitles[3]) sectionTitles[3].textContent = t.cvEduTitle;
    if (sectionTitles[4]) sectionTitles[4].textContent = t.cvLangTitle;

    const aboutText = document.querySelector('.cv-section .section-text');
    if (aboutText) aboutText.textContent = t.cvAboutText;

    const roles = document.querySelectorAll('.timeline-role');
    const companies = document.querySelectorAll('.timeline-company');
    const descs = document.querySelectorAll('.timeline-desc');

    if (roles[0]) roles[0].textContent = t.cvExp1Role;
    if (companies[0]) companies[0].textContent = t.cvExp1Company;
    if (descs[0]) descs[0].textContent = t.cvExp1Desc;

    if (roles[1]) roles[1].textContent = t.cvExp2Role;
    if (companies[1]) companies[1].textContent = t.cvExp2Company;
    if (descs[1]) descs[1].textContent = t.cvExp2Desc;

    if (roles[2]) roles[2].textContent = t.cvExp3Role;
    if (companies[2]) companies[2].textContent = t.cvExp3Company;
    if (descs[2]) descs[2].textContent = t.cvExp3Desc;

    const eduDegree = document.querySelector('.education-degree');
    const eduSchool = document.querySelector('.education-school');
    const eduSpec = document.querySelector('.education-specialization');
    if (eduDegree) eduDegree.textContent = t.cvEduDegree;
    if (eduSchool) eduSchool.textContent = t.cvEduSchool;
    if (eduSpec) eduSpec.textContent = t.cvEduSpec;

    const langItems = document.querySelectorAll('.languages-list li');
    if (langItems[0]) langItems[0].innerHTML = `<strong>${lang === 'en' ? 'English' : 'Angielski'}:</strong> ${t.cvLangEn.split(': ')[1]}`;
    if (langItems[1]) langItems[1].innerHTML = `<strong>${lang === 'en' ? 'German' : 'Niemiecki'}:</strong> ${t.cvLangDe.split(': ')[1]}`;

    const cvAgreement = document.querySelector('.cv-agreement');
    if (cvAgreement) cvAgreement.textContent = t.cvAgreement;
}

function initAudio(withAudio) {
    if (!withAudio) {
        isMuted = true;
        audioToggle.querySelector('.icon-sound-on').classList.add('hidden');
        audioToggle.querySelector('.icon-sound-off').classList.remove('hidden');
    } else {
        audioController.resume();
    }
}

function startGame() {
    currentState = STATE.IDLE;
    introOverlay.classList.remove('active');
    setTimeout(() => introOverlay.remove(), 500);

    // Show audio controls & bottom UI
    document.getElementById('audio-divider').classList.remove('hidden');
    audioToggle.classList.remove('hidden');
    uiPanel.classList.remove('hidden');
}

/* ========================================================================= */
/* 3. GAME LOOP (ANIMATIONS & ROD/LINE/WAVES SIMULATION)                     */
/* ========================================================================= */
function animateGameLoop() {
    const time = Date.now();
    
    // 1. Boat Rocking angle
    boatAngle = Math.sin(time / 1000) * 1.8;
    boatRocker.setAttribute('transform', `rotate(${boatAngle}, 100, 50)`);

    // 2. Wave heights
    const waveOffset = Math.sin(time / 800) * 4;
    waterLevel = 560 + waveOffset;

    // 3. Compute dynamic Rod Tip Position in global SVG coordinates
    const pivot = { x: 280, y: 530 };
    
    let relRodTip = { x: 180, y: -120 };
    let rodPath = "M 0 0 L 110 -80 Q 150 -110 180 -120";
    
    if (currentState === STATE.BITING) {
        relRodTip = { x: 165, y: -100 };
        rodPath = "M 0 0 L 100 -70 Q 135 -95 165 -100";
    } else if (currentState === STATE.REELING) {
        relRodTip = { x: 140, y: -80 };
        rodPath = "M 0 0 L 90 -60 Q 120 -75 140 -80";
    }
    
    fishingRod.setAttribute('d', rodPath);

    const localX = 130 + relRodTip.x - 100;
    const localY = 45 + relRodTip.y - 50;

    const angleRad = boatAngle * Math.PI / 180;
    const cosA = Math.cos(angleRad);
    const sinA = Math.sin(angleRad);
    const rotatedX = localX * cosA - localY * sinA;
    const rotatedY = localX * sinA + localY * cosA;

    rodTip.x = pivot.x + rotatedX;
    rodTip.y = pivot.y + rotatedY;

    // 4. Update Bobber Position & Line Rendering
    if (currentState === STATE.CASTING) {
        const elapsed = time - castStartTime;
        const progress = Math.min(elapsed / 1000, 1);

        const startX = rodTip.x;
        const startY = rodTip.y;
        const endX = bobberTarget.x;
        const endY = bobberTarget.y;
        
        bobberPos.x = startX + (endX - startX) * progress;
        const height = 150;
        const midY = Math.min(startY, endY) - height;
        const qY = (1 - progress) * (1 - progress) * startY + 2 * (1 - progress) * progress * midY + progress * progress * endY;
        bobberPos.y = qY;

        bobber.setAttribute('transform', `translate(${bobberPos.x}, ${bobberPos.y})`);
        fishingLine.setAttribute('d', `M ${rodTip.x} ${rodTip.y} L ${bobberPos.x} ${bobberPos.y - 25}`);

        if (progress === 1) {
            onCastLand();
        }
    } 
    else if (currentState === STATE.WAITING || currentState === STATE.BITING) {
        bobberPos.x = bobberTarget.x;
        bobberPos.y = waterLevel + 5;

        if (currentState === STATE.BITING) {
            const jitterX = (Math.random() - 0.5) * 4;
            const jitterY = (Math.random() - 0.5) * 5 + (Math.sin(time / 80) * 12);
            bobberPos.x += jitterX;
            bobberPos.y += jitterY;
        }

        bobber.setAttribute('transform', `translate(${bobberPos.x}, ${bobberPos.y})`);

        const controlX = (rodTip.x + bobberPos.x) / 2;
        const slack = 40 + Math.sin(time / 2000) * 10;
        const controlY = Math.max(rodTip.y, bobberPos.y) + slack;

        fishingLine.setAttribute('d', `M ${rodTip.x} ${rodTip.y} Q ${controlX} ${controlY} ${bobberPos.x} ${bobberPos.y - 25}`);
    } 
    else if (currentState === STATE.REELING) {
        const endX = rodTip.x + 50;
        const reelSpeed = 5;
        bobberPos.x -= reelSpeed;
        
        const waveOffset = Math.sin(time / 100) * 3;
        bobberPos.y = waterLevel + 15 + waveOffset;

        bobber.setAttribute('transform', `translate(${bobberPos.x}, ${bobberPos.y})`);

        if (time % 8 < 2) {
            createSplash(bobberPos.x, bobberPos.y, false);
        }

        fishingLine.setAttribute('d', `M ${rodTip.x} ${rodTip.y} L ${bobberPos.x} ${bobberPos.y - 25}`);

        if (bobberPos.x <= endX) {
            onReelFinish();
        }
    }
    else {
        fishingLine.setAttribute('d', `M ${rodTip.x} ${rodTip.y} L ${rodTip.x + 5} ${rodTip.y + 15}`);
    }

    requestAnimationFrame(animateGameLoop);
}

/* ========================================================================= */
/* 4. GAME ACTIONS LOGIC                                                     */
/* ========================================================================= */

function handleActionClick() {
    if (currentState === STATE.IDLE) {
        castLine();
    } else if (currentState === STATE.BITING) {
        reelIn();
    }
}

// 1. Cast the Line
function castLine() {
    currentState = STATE.CASTING;
    castStartTime = Date.now();
    castCount++;
    
    // Reset Action Button State
    btnAction.disabled = false;
    btnAction.textContent = TRANSLATIONS[currentLang].btnCast;
    
    bobberTarget.x = 680 + Math.random() * 200;
    bobberTarget.y = 560;

    bobber.classList.remove('hidden');
    
    audioController.resume();
    audioController.playSplash();
    
    updateUI(TRANSLATIONS[currentLang].statusCasting, false);
}

// 2. Bobber hits the water
function onCastLand() {
    currentState = STATE.WAITING;
    createSplash(bobberPos.x, bobberPos.y, true);
    animateRipples(true);

    updateUI(TRANSLATIONS[currentLang].statusWaiting, false);

    const waitTime = 2500 + Math.random() * 2500;
    biteTimeout = setTimeout(triggerBite, waitTime);
}

// 3. Fish / Catch bites
function triggerBite() {
    currentState = STATE.BITING;
    
    audioController.playSplash();
    biteInterval = setInterval(() => {
        audioController.playSplash();
    }, 1200);

    btnAction.textContent = TRANSLATIONS[currentLang].btnHook;
    btnAction.classList.add('btn-pulse');
    btnAction.style.background = '#e63946';
    btnAction.style.color = '#fff';
    
    updateUI(TRANSLATIONS[currentLang].statusBiting, true);

    biteTimeout = setTimeout(() => {
        fishEscaped();
    }, 4000);
}

// 4. Reel in the catch
function reelIn() {
    clearTimeout(biteTimeout);
    clearInterval(biteInterval);
    
    currentState = STATE.REELING;
    
    audioController.playReelClick();
    reelInterval = setInterval(() => {
        audioController.playReelClick();
    }, 90);

    btnAction.textContent = TRANSLATIONS[currentLang].btnReeling;
    btnAction.disabled = true;
    btnAction.classList.remove('btn-pulse');
    btnAction.style.background = '';
    btnAction.style.color = '';

    updateUI(TRANSLATIONS[currentLang].statusReeling, false);
}

// 5. Fish escapes
function fishEscaped() {
    clearInterval(biteInterval);
    currentState = STATE.IDLE;
    bobber.classList.add('hidden');
    animateRipples(false);

    btnAction.textContent = TRANSLATIONS[currentLang].btnCast;
    btnAction.classList.remove('btn-pulse');
    btnAction.style.background = '';
    btnAction.style.color = '';

    updateUI(TRANSLATIONS[currentLang].statusEscaped, true);
}

// 6. Reel completed: Determine Catch (Funny item or CV Bottle!)
function onReelFinish() {
    clearInterval(reelInterval);
    bobber.classList.add('hidden');
    animateRipples(false);
    uiPanel.classList.add('hidden');

    createSplash(bobberPos.x, bobberPos.y, true);

    // Give items on cast 1 and 2, give CV on cast 3.
    if (castCount % 3 !== 0) {
        const itemIndex = (castCount - 1) % CATCH_ITEMS.length;
        const item = CATCH_ITEMS[itemIndex];
        showItemOverlay(item);
    } else {
        showBottleOverlay();
    }
}

function showItemOverlay(item) {
    currentState = STATE.ITEM;
    itemIcon.textContent = item.icon;
    itemTitle.textContent = currentLang === 'en' ? 'Oops! Try again...' : 'Pudło! To nie CV...';

    if (item.sound === 'quack') {
        audioController.playQuack();
    } else if (item.sound === 'chime') {
        audioController.playChime();
    } else {
        audioController.playSplash();
    }

    setTimeout(() => {
        itemOverlay.classList.remove('hidden');
    }, 400);
}

function showBottleOverlay() {
    currentState = STATE.CAUGHT;
    audioController.playChime();
    setTimeout(() => {
        bottleOverlay.classList.remove('hidden');
    }, 400);
}

/* ========================================================================= */
/* 5. OVERLAYS & INTERACTIVE REVEALS (BOTTLE -> SCROLL -> CV)               */
/* ========================================================================= */

function handleBottleClick() {
    audioController.playPop();
    
    const cork = document.getElementById('cork');
    cork.style.transform = 'translateY(-80px) rotate(20deg)';
    cork.style.opacity = '0';
    cork.style.transition = 'all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

    const miniScroll = document.getElementById('mini-scroll');
    miniScroll.style.transform = 'translate(68px, -40px) rotate(45deg) scale(1.5)';
    miniScroll.style.opacity = '0';
    miniScroll.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

    setTimeout(() => {
        bottleOverlay.classList.add('hidden');
        scrollOverlay.classList.remove('hidden');
        
        cork.style.transform = '';
        cork.style.opacity = '';
        cork.style.transition = '';
        miniScroll.style.transform = '';
        miniScroll.style.opacity = '';
        miniScroll.style.transition = '';
    }, 850);
}

function handleScrollClick() {
    audioController.playPaperUnroll();

    scrollOverlay.classList.add('hidden');
    cvOverlay.classList.remove('hidden');
    cvOverlay.scrollTop = 0;

    setTimeout(() => {
        scrollUnrolledContainer.classList.add('unrolled');
        setTimeout(animateSkills, 1000);
    }, 100);
}

function closeCvScroll() {
    audioController.playPaperUnroll();
    
    scrollUnrolledContainer.classList.add('rolling');
    
    setTimeout(() => {
        scrollUnrolledContainer.classList.remove('unrolled');
    }, 80);

    const skillFills = document.querySelectorAll('.skill-bar-fill');
    skillFills.forEach(fill => fill.style.width = '0');

    setTimeout(() => {
        cvOverlay.classList.add('hidden');
        scrollUnrolledContainer.classList.remove('rolling');
        
        uiPanel.classList.remove('hidden');
        btnAction.disabled = false;
        btnAction.textContent = TRANSLATIONS[currentLang].btnCast;
        currentState = STATE.IDLE;
        
        updateUI(TRANSLATIONS[currentLang].statusBack, false);
    }, 1200);
}

function animateSkills() {
    const skillFills = document.querySelectorAll('.skill-bar-fill');
    skillFills.forEach(fill => {
        const targetWidth = fill.style.width || fill.dataset.targetWidth;
        if (targetWidth) {
            fill.dataset.targetWidth = targetWidth;
        }
        fill.style.width = '0%';
        setTimeout(() => {
            fill.style.width = targetWidth;
        }, 100);
    });
}

/* ========================================================================= */
/* 6. HELPERS & VISUAL EFFECTS                                              */
/* ========================================================================= */

function updateUI(text, isAlert = false) {
    gameStatus.textContent = text;
    const dot = document.querySelector('.status-dot');
    
    if (isAlert) {
        dot.style.backgroundColor = '#e63946';
        dot.style.boxShadow = '0 0 10px #e63946';
    } else {
        dot.style.backgroundColor = 'var(--primary)';
        dot.style.boxShadow = '0 0 10px var(--primary)';
    }
}

function animateRipples(active) {
    if (active) {
        ripples[0].style.animation = 'rippleWave 3s linear infinite';
        ripples[1].style.animation = 'rippleWave 3s linear infinite 1.5s';
        ripples[0].setAttribute('opacity', '1');
        ripples[1].setAttribute('opacity', '1');
    } else {
        ripples[0].style.animation = '';
        ripples[1].style.animation = '';
        ripples[0].setAttribute('opacity', '0');
        ripples[1].setAttribute('opacity', '0');
    }
}

function createSplash(x, y, isBig = false) {
    const container = document.getElementById('splashes-container');
    if (!container) return;
    
    const ripple = document.createElement('div');
    ripple.className = 'ripple-circle ripple-animate';
    const leftPercent = (x / 1200) * 100;
    const topPercent = (y / 800) * 100;
    
    ripple.style.left = `${leftPercent}%`;
    ripple.style.top = `${topPercent}%`;
    ripple.style.width = `${isBig ? 120 : 60}px`;
    ripple.style.height = `${isBig ? 40 : 20}px`;
    
    container.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 1400);
}
