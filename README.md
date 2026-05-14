<p align="center">
  <img src="public/og-image.png" alt="Solar System 3D" width="600"/>
</p>

<h1 align="center">🚀 Solar System 3D</h1>

<p align="center">
  <a href="README.md"><img src="https://img.shields.io/badge/English-blue.svg" alt="English"></a>
  <a href="README_zh.md"><img src="https://img.shields.io/badge/中文-red.svg" alt="中文"></a>
</p>

<p align="center">
  <strong>An interactive 3D solar system explorer for science education — built for curious minds aged 10–15.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" alt="React 18"/>
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript" alt="TypeScript 5.7"/>
  <img src="https://img.shields.io/badge/Three.js-R3F-000000?logo=three.js" alt="Three.js + R3F"/>
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite" alt="Vite 5.4"/>
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License"/>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-quick-start">Quick Start</a> •
  <a href="#-for-ai-agents">For AI Agents</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-contributing">Contributing</a>
</p>

---

**Explore the solar system like never before.** Navigate through realistic 3D orbits, interact with 20+ educational modules, and discover why science is less about memorizing facts and more about asking better questions.

Built with React Three Fiber, this pure-static web app runs entirely in the browser — no backend, no sign-up, no dependencies beyond `npm install && npm run dev`.

---

## ✨ Features

### 🌌 3D Solar System
| | |
|---|---|
| **Real orbital mechanics** | Keplerian orbits solved via Newton's method — elliptical paths with correct inclination, argument of periapsis, and ascending node |
| **All 8 planets + 5 dwarf planets** | Complete with moons, rings, and an asteroid belt |
| **Scale modes** | Toggle between exaggerated (visible planets) and realistic (true-to-scale) views |

### 🎮 20+ Interactive Modules

| Module | Description |
|--------|-------------|
| 🚀 **Exploration Missions** | Guided tours with achievements and progressive hints |
| 🔮 **Prediction Challenge** | Predict planetary positions after N days — compete for accuracy |
| 🧪 **Sandbox Lab** | Adjust Earth's orbit and watch temperature/habitability change in real-time |
| 🌑 **Eclipse Lab** | Find the conditions for a total lunar eclipse |
| 🕳️ **Black Hole Simulator** | Approach the event horizon — experience time dilation and tidal forces |
| 🛸 **Hohmann Transfer Designer** | Visualize fuel-efficient orbital transfers between planets |
| 📜 **Exploration History** | 28 milestones from ancient astronomy to future missions |
| 🔬 **Scientist Gallery** | 8 diverse astronomers from across cultures and eras |
| 📖 **Narrative Missions** | Story-driven adventures through the solar system |

### 🧠 Educational Design

| Principle | Implementation |
|-----------|---------------|
| **Tiered knowledge** | Bronze (perception) → Silver (correlation) → Gold (mechanism) with bridge text |
| **Socratic follow-ups** | Each unlockable knowledge level includes a progressive question chain |
| **Achievement as inquiry** | Descriptions are rhetorical questions — "Mars once had water. Where do you think it went?" |
| **Model transparency** | Every calculation is labeled as simplified approximation, with limitations explained |
| **Interdisciplinary links** | 💡-tagged prompts connect astronomy to physics, chemistry, biology, and history |

### 🎨 Sci-Fi HUD & Visuals
- Glass-morphism panels with holographic corner accents
- Custom data stream animations with orbital phase gauges
- Scanline overlay and crosshair reticle
- Spring-animated panel transitions
- Fully responsive — desktop to mobile

---

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 9

### Install & Run

```bash
# Clone
git clone https://github.com/your-username/solar-system-3d.git
cd solar-system-3d

# Install
npm install

# Start dev server (opens http://localhost:3000)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

The app is a pure static site — deploy the `dist/` folder to any static host (Vercel, Netlify, GitHub Pages, etc.).

---

## 🤖 For AI Agents

This project is designed for seamless AI agent interaction:

### Agent Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd solar-system-3d
npm install

# 2. Start dev server	
npm run dev

# 3. Build for production
npm run build
```

### Agent Context Files

The project includes an `AGENTS.md` that provides:
- Complete component inventory with file paths
- Architecture decisions (state management, rendering, styling)
- Coding conventions and naming rules
- Educational content standards
- Performance guidelines

**Always read `AGENTS.md` before making changes** — it contains critical context the agent needs to match the project's conventions.

### Key Architecture

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript 5.7 |
| 3D Rendering | Three.js + @react-three/fiber + @react-three/drei |
| State | Zustand 5 (single store, no persistence) |
| Styling | Tailwind CSS 3.4 with custom sci-fi theme |
| Animation | Framer Motion 11 |
| Icons | Lucide React |
| Audio | Web Audio API (native, no library) |
| Build | Vite 5.4 → static `dist/` output |

---

## 📁 Project Structure

```
src/
├── components/     # 35+ React components (3D scene + UI panels)
├── data/           # Static data (celestial bodies, achievements, missions, scientists...)
├── store/          # Zustand global state (single store)
├── utils/          # Pure functions (orbit calculation, physics, audio, date...)
├── styles/         # Tailwind + custom sci-fi CSS classes
├── App.tsx         # Root: Canvas + all UI overlays
└── main.tsx        # Entry point
```

All UI text and comments are in **Chinese** (Simplified). The interface targets Chinese-speaking users aged 10–15.

---

## 🧪 Testing

No test framework is currently configured. Recommended approach:
- Unit tests: `vitest` + `@testing-library/react`
- Priority: `utils/orbit.ts` and `utils/physics.ts` (pure functions, easy to test)
- 3D scene components are challenging to test — focus on data/utility layers first

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

Copyright (c) 2026 Solar System 3D Team

---

<p align="center">
  <sub>Built with ❤️ for science education. No LLM APIs, no backend, no data collection.</sub>
</p>
