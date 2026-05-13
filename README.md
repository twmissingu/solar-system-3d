[![English](https://img.shields.io/badge-English-blue.svg)](README.md)
[![中文](https://img.shields.io/badge-中文-red.svg)](README_zh.md)

---

# 🪐 Solar System 3D — Interactive Science Education Platform

> Explore the real solar system in your browser. Real orbital mechanics, 20+ interactive modules, and a sci-fi HUD that turns astronomy into an adventure.

[Live Demo](https://solar-system-3d-demo.vercel.app) · [Report Bug](../../issues) · [Request Feature](../../issues)

![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Three.js](https://img.shields.io/badge/Three.js-r171-000000?logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)

---

## 🌌 Why This Project?

Most astronomy apps are either **static images** or **oversimplified animations** that don't reflect real orbital mechanics. This project bridges the gap between scientific accuracy and engaging interactivity — while planting a seed of scientific curiosity in young minds.

- 🎯 **Real orbital data** — Based on NASA JPL ephemerides (J2000.0 epoch) with true Keplerian ellipses
- 🎮 **25+ interactive modules** — From mission exploration to black hole simulation with mass comparison
- 🏆 **Reflective learning** — Achievement toasts ask "why?" instead of just saying "congrats"
- 📐 **Scale intuition** — "Sun = basketball" ruler reveals the true emptiness of the solar system
- 👩‍🔬 **Diverse scientists** — Gallery features 8 astronomers across cultures and genders
- 🚀 **Sci-fi HUD design** — Immersive interface inspired by mission control dashboards
- 🌐 **Zero backend** — Pure static site, runs entirely in the browser

---

## ✨ Features

| Module | Description |
|--------|-------------|
| 🌍 **Real-Time Solar System** | Navigate all 8 planets + Sun with accurate orbital positions using Newton-Raphson Kepler equation solving |
| 🛰️ **Satellite Rendering** | Recursive moon system rendering with tidal locking visualization; invisible planets show pulsing beacons in realistic scale |
| 🎯 **Exploration Missions** | Guided narrative missions across the solar system |
| 🔮 **Prediction Challenges** | Predict planetary positions and orbital events |
| 🧪 **Sandbox Lab** | Experiment with orbital parameters in real time |
| 🚀 **Hohmann Transfer Designer** | Design interplanetary transfer orbits visually |
| 🌑 **Eclipse Simulator** | Simulate lunar and solar eclipses with shadow geometry |
| 🕳️ **Black Hole Explorer** | Explore stellar vs. supermassive black holes with adjustable mass (1x–1000x solar mass) |
| ⚡ **Light-Speed Journey** | Travel at light speed between planets with time dilation HUD |
| 🏆 **Reflective Achievement System** | 30+ achievements that ask "what's your next question?" instead of just badges |
| 📝 **Knowledge System** | Bronze→Silver→Gold tiered knowledge with bridge text transitions and follow-up chains |
| 📝 **Knowledge Quizzes** | Test your astronomy knowledge, including science-history misconception questions |
| 🔭 **Observation Guide** | Practical stargazing tips with tool recommendations (naked eye / binoculars / telescope) |
| 📏 **Scale Ruler** | "If the Sun were a basketball" — reveals true emptiness of the solar system |
| 👩‍🔬 **Scientist Gallery** | 8 diverse astronomers (5 women, 3 non-Western) with contributions and search keywords |
| 🌌 **Seasonal Star Map** | Northern hemisphere 4-season stargazing guide with direction charts |
| 📄 **Exploration Report Export** | Generate Markdown learning report for school assignments |
| 🎵 **Immersive Audio** | Web Audio API ambient soundscape with spatial audio |
| 📊 **Interdisciplinary Panel** | Connect astronomy to physics, chemistry, and history with 💡 thinking prompts |
| 🔬 **Science Frontiers** | Controversy voting + model-accuracy education cards |
| 🛰️ **Spacecraft Panel** | Trajectories and discoveries of Voyager, Juno, New Horizons |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or pnpm 8+

### Installation

```bash
# Clone the repository
git clone https://github.com/twzhan/solar-system-3d.git
cd solar-system-3d

# Install dependencies
npm install

# Start development server (port 3000, auto-open browser)
npm run dev
```

### Production Build

```bash
# Build for production (outputs to dist/)
npm run build

# Preview production build
npm run preview
```

---

## 🏗️ Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript 5.7 |
| Build Tool | Vite 5.4 |
| 3D Rendering | Three.js + @react-three/fiber + @react-three/drei |
| State Management | Zustand 5 |
| UI Styling | Tailwind CSS 3.4 |
| Animation | Framer Motion |
| Icons | Lucide React |
| Audio | Web Audio API (native) |

### Key Design Decisions

- **Centralized time stepping** — All orbital animation logic lives in `SolarSystem.tsx` via `useFrame` to avoid multi-component state thrashing
- **Keplerian accuracy** — Uses Newton-Raphson iteration to solve `M = E - e·sin(E)` for true orbital positions
- **Ref-based camera animation** — Camera transitions use refs for smooth 60fps animation, with async Redux-like cleanup
- **Zustand for global state** — All UI state, game progress, and panel visibility in a single store

---

## 📁 Project Structure

```
src/
├── components/          # React components (3D scene + UI overlays)
│   ├── SolarSystem.tsx     # Root 3D scene: time stepping, camera animation
│   ├── Planet.tsx          # Celestial body rendering (recursive satellites, orbits, labels)
│   ├── Controls.tsx        # Bottom control bar (time, view, feature entry)
│   ├── InfoPanel.tsx       # Right-side celestial info panel
│   └── ... 25+ interactive panels
├── data/                # Static data
│   ├── celestialData.ts   # NASA JPL orbital elements
│   ├── missions.ts        # Mission definitions
│   ├── achievements.ts    # Achievement data
│   ├── quiz.ts            # Quiz question bank
│   └── ...
├── store/
│   └── useStore.ts        # Zustand global state
├── utils/
│   ├── orbit.ts           # Keplerian orbital mechanics
│   ├── physics.ts         # Physics formulas (light travel, habitable zones, etc.)
│   └── audio.ts           # Web Audio API soundscape
└── styles/
    └── index.css          # Tailwind + sci-fi component classes
```

---

## 🧪 For AI Agents

This project is designed for seamless AI agent interaction:

```bash
# 1. Clone and install
git clone https://github.com/twzhan/solar-system-3d.git
cd solar-system-3d
npm install

# 2. Start development
npm run dev
# → Opens at http://localhost:3000

# 3. Build for production
npm run build
# → Static files in dist/
```

**Key file references for modifications:**
- Add celestial bodies → `src/data/celestialData.ts` (follow `CelestialBody` interface)
- Add UI panels → `src/store/useStore.ts` (add `show*` boolean + setter)
- Add knowledge topics → `src/data/knowledgeV2.ts` (follow `KnowledgeItemV2` interface with Bronze/Silver/Gold tiers)
- Add quiz questions → `src/data/quiz.ts`
- Add interdisciplinary connections → `src/data/interdisciplinary.ts`
- Add scientist profiles → `src/data/scientists.ts`
- Modify orbital math → `src/utils/orbit.ts`
- Modify physics → `src/utils/physics.ts`
- Add achievements → `src/data/achievements.ts` + `src/utils/achievements.ts`

**Important conventions:**
- All UI text and comments are in **Chinese** (`zh-CN`)
- Reuse existing sci-fi CSS classes (`.sci-panel`, `.sci-button`, `.sci-text-glow`)
- Avoid `useFrame` in new components — centralize time logic in `SolarSystem.tsx`
- `strict: true` TypeScript — avoid `any`

---

## 🤝 Contributing

We welcome contributions! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- Orbital data derived from [NASA JPL Horizons](https://ssd.jpl.nasa.gov/horizons/)
- 3D rendering powered by [Three.js](https://threejs.org/) and [React Three Fiber](https://docs.pmndrs.react-three-fiber.io/)
- Fonts: [Orbitron](https://fonts.google.com/specimen/Orbitron) & [Noto Sans SC](https://fonts.google.com/specimen/Noto+Sans+SC)

---

<p align="center">Made with 🪐 for science education</p>
