# 🚀 VibeCoding – Creative Web Apps & Interactive Projects

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Web Audio API](https://img.shields.io/badge/Web_Audio_API-000000?style=for-the-badge&logo=soundwave&logoColor=white)

Welcome to **VibeCoding** – a collection of creative, interactive, and beautifully designed web applications. This repository showcases projects ranging from arcade retro games with synthesized sound to interactive portfolios and playful micro-apps.

---

## 🌟 Featured Projects

| Project | Description | Key Features | Folder | Live Demo |
| :--- | :--- | :--- | :---: | :---: |
| **🎮 GameHub** | 8 Arcade & Strategy Games (Local 2P / vs CPU) | Glassmorphism UI, 100% Web Audio sound synthesis, particle effects, minimax AI | [`/games`](./games) | [Play Online](https://mygamesproject.netlify.app/) |
| **🎡 Lottery Hub** | Interactive Decision & Draw Platform (4 Modes) | Wheel of Fortune, Spin the Bottle, Lottery Machine, 3D Coin Flip, Audio & Voice synthesis | [`/lottery`](./lottery) | — |
| **🎣 Catch My CV** | Interactive Fishing Portfolio | Nighttime fishing mini-game, procedural audio, scroll parchment CV | [`/fishing_cv`](./fishing_cv) | — |
| **💖 Date Invitation** | Interactive Date Planner & Invitation | Evasive "NO" button, confetti, dynamic date plan generator with WhatsApp/SMS export | [`/date_invitation`](./date_invitation) | — |

---

## 🕹️ Detailed Overview

### 1. 🎮 GameHub (`/games`)
An interactive gaming hub featuring 8 classic arcade and strategy games designed for local 2-player matches or single-player versus AI.
- **Included Games:** Tic-Tac-Toe, Pong, Connect 4, 2-Player Snake Battle, Battleship, Checkers, Air Hockey, Memo.
- **Highlights:** Retro Web Audio API synthesizer (no external audio files), particle trails, dark neon glassmorphism UI, interactive rule modals, and achievements.

### 2. 🎡 Lottery Hub (`/lottery`)
An interactive decision-making and draw platform featuring 4 visual draw modes.
- **Draw Modes:** Wheel of Fortune, Spin the Bottle, Lottery Machine (bouncing balls physics), and 3D Coin Flip.
- **Highlights:** Web Audio API sound synthesis, Speech Synthesis voice narrator, custom color themes, JSON list export/import, stats tracking, and multi-language support (EN/PL).

### 3. 🎣 Catch My CV (`/fishing_cv`)
A creative interactive web portfolio designed as a calm nighttime fishing pond.
- **Mechanics:** Cast your fishing rod into the water, wait for bites, catch funny ocean loot, and reel in a parchment CV.
- **Highlights:** Pure Web Audio API water/reel sound synthesis, SVG night scenery, animated float physics, and customizable resume content.

### 4. 💖 Date Invitation (`/date_invitation`)
A playful and charming single-page web app for asking someone out on a date.
- **Mechanics:** Playfully dodges the "NO" button when hovered, lets the user customize activity, day, and time, and generates a formatted message.
- **Highlights:** Cute responsive design, Google Fonts typography, Canvas confetti explosion, and one-click SMS/WhatsApp sharing.

---

## 🛠️ General Tech Stack

- **Frontend Core:** HTML5, Modern CSS3 (Variables, Flexbox, CSS Grid, Glassmorphism, Animations), Vanilla JavaScript (ES6+)
- **Audio:** Web Audio API (100% pure real-time sound synthesis without external MP3/WAV assets)
- **Graphics & UI:** Dynamic Canvas API, SVG Vectors, Google Fonts, FontAwesome
- **Build Tools:** Vite (optional dev server & bundle optimization)

---

## 🚀 How to Run Locally

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/kkamilll/VibeCoding.git
   cd VibeCoding
   ```

2. **Run a Project Directly:**
   Most projects in this repository are standalone Single Page Applications. You can open any `index.html` file directly in your web browser without build steps:
   - `games/index.html`
   - `lottery/index.html`
   - `fishing_cv/index.html`
   - `date_invitation/index.html`

3. **Run GameHub with Vite Dev Server (Optional):**
   ```bash
   cd games
   npm install
   npm run dev
   ```

---

## 📦 How to Download Only a Single Project

If someone is only interested in one specific project (e.g. `games`), there are several easy ways to download just that single folder:

### Option 1: Using `degit` (Fastest & Easiest via Terminal ⚡)
Run this command in your terminal (no git history downloaded, just clean code files):
```bash
# Download only the 'games' project
npx degit kkamilll/VibeCoding/games my-games-project

# Download only 'lottery'
npx degit kkamilll/VibeCoding/lottery my-lottery-project

# Download only 'fishing_cv'
npx degit kkamilll/VibeCoding/fishing_cv my-fishing-cv

# Download only 'date_invitation'
npx degit kkamilll/VibeCoding/date_invitation my-date-invitation
```

### Option 2: Using Git `sparse-checkout`
Git supports downloading specific subfolders without downloading the entire repository history:
```bash
git clone --depth 1 --filter=blob:none --sparse https://github.com/kkamilll/VibeCoding.git
cd VibeCoding
git sparse-checkout set games
```

### Option 3: Download ZIP via Web Browser
You can download the entire repository as a `.zip` file by clicking **Code ➔ Download ZIP** on GitHub, extract it, and open only the folder you need.

---

## 📄 License

This repository is maintained by [@kkamilll](https://github.com/kkamilll). Feel free to explore, clone, and build upon these projects!
