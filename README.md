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
| **🎣 Catch My CV** | Interactive Fishing Portfolio | Nighttime fishing mini-game, procedural audio, scroll parchment CV | [`/fishing_cv`](./fishing_cv) | — |
| **💖 Date Invitation** | Interactive Date Planner & Invitation | Evasive "NO" button, confetti, dynamic date plan generator with WhatsApp/SMS export | [`/date_invitation`](./date_invitation) | — |

---

## 🕹️ Detailed Overview

### 1. 🎮 GameHub (`/games`)
An interactive gaming hub featuring 8 classic arcade and strategy games designed for local 2-player matches or single-player versus AI.
- **Included Games:** Tic-Tac-Toe, Pong, Connect 4, 2-Player Snake Battle, Battleship, Checkers, Air Hockey, Memo.
- **Highlights:** Retro Web Audio API synthesizer (no external audio files), particle trails, dark neon glassmorphism UI, interactive rule modals, and achievements.

### 2. 🎣 Catch My CV (`/fishing_cv`)
A creative interactive web portfolio designed as a calm nighttime fishing pond.
- **Mechanics:** Cast your fishing rod into the water, wait for bites, catch funny ocean loot, and reel in a parchment CV.
- **Highlights:** Pure Web Audio API water/reel sound synthesis, SVG night scenery, animated float physics, and customizable resume content.

### 3. 💖 Date Invitation (`/date_invitation`)
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
   - `fishing_cv/index.html`
   - `date_invitation/index.html`

3. **Run GameHub with Vite Dev Server (Optional):**
   ```bash
   cd games
   npm install
   npm run dev
   ```

---

## 📄 License

This repository is maintained by [@kkamilll](https://github.com/kkamilll). Feel free to explore, clone, and build upon these projects!
