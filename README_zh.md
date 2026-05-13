[![English](https://img.shields.io/badge-English-blue.svg)](README.md)
[![中文](https://img.shields.io/badge-中文-red.svg)](README_zh.md)

---

# 🪐 太阳系3D探索 — 交互式科学教育平台

> 在浏览器中探索真实的太阳系。真实轨道力学、20+互动模块、科幻风格HUD，让天文学成为一场冒险。

[在线演示](https://solar-system-3d-demo.vercel.app) · [报告问题](../../issues) · [功能建议](../../issues)

![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Three.js](https://img.shields.io/badge/Three.js-r171-000000?logo=three.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)

---

## 🌌 为什么做这个项目？

大多数天文应用要么是**静态图片**，要么是**过度简化的动画**，无法反映真实的轨道力学。本项目在科学准确性与互动趣味性之间架起了桥梁——更重要的是，在青少年的心中播下一颗向往太空的科学种子。

- 🎯 **真实轨道数据** — 基于NASA JPL星历表（J2000.0历元），真实开普勒椭圆轨道
- 🎮 **25+ 互动模块** — 从探索任务到可对比质量的黑洞模拟
- 🏆 **反思式学习** — 成就解锁后提出"为什么？"，而不只是"恭喜"
- 📐 **尺度直觉** — "太阳=篮球"比例尺，直观感受太阳系的真实空旷
- 👩‍🔬 **多元科学家** — 天文学家画廊展示不同文化、不同性别的8位科学先驱
- 🚀 **科幻HUD设计** — 受任务控制中心仪表盘启发的沉浸式界面
- 🌐 **零后端** — 纯静态站点，完全在浏览器中运行

---

## ✨ 功能特性

| 模块 | 说明 |
|------|------|
| 🌍 **实时太阳系** | 使用牛顿-拉夫逊开普勒方程求解，导航全部8大行星+太阳的真实轨道位置 |
| 🛰️ **卫星渲染** | 递归月球系统渲染，支持潮汐锁定可视化；真实比例下不可见行星显示脉冲信标 |
| 🎯 **探索任务** | 穿越太阳系的故事引导任务 |
| 🔮 **预测挑战** | 预测行星位置和轨道事件 |
| 🧪 **沙盘实验** | 实时调整轨道参数进行实验 |
| 🚀 **霍曼转移轨道设计器** | 可视化设计行星际转移轨道 |
| 🌑 **月食模拟器** | 模拟月食和日食的几何阴影 |
| 🕳️ **黑洞探险** | 可调节黑洞质量（1x~1000x太阳质量），对比恒星质量与超大质量黑洞的潮汐力差异 |
| ⚡ **光速旅程** | 以光速在行星间穿梭，附带时间膨胀HUD |
| 🏆 **反思式成就系统** | 30+成就解锁后提出"你的下一个问题是什么？"，而非简单的徽章收集 |
| 📝 **三级知识体系** | 青铜→白银→黄金分级知识，含桥梁过渡文案和追问链 |
| 📝 **知识测验** | 自适应难度天文测试，含科学史误解题型 |
| 🔭 **观测指南** | 实用观星建议，含观测工具分级推荐（肉眼/双筒/望远镜） |
| 📏 **比例尺感受器** | "如果太阳是篮球"——直观揭示太阳系99.999%是虚空 |
| 👩‍🔬 **天文学家画廊** | 8位多元背景天文学家（5位女性，3位非西方），含贡献与搜索关键词 |
| 🌌 **四季星空** | 北半球四季主要观测目标指南，含简化方位示意图 |
| 📄 **探索报告导出** | 一键生成Markdown学习报告，可作为学校科学课实践作业 |
| 🎵 **沉浸式音频** | Web Audio API环境音景与空间音频 |
| 📊 **跨学科面板** | 将天文学与物理、化学、历史相连，每个连接附💡思考追问 |
| 🔬 **科学前沿** | 科学争议投票 + 模型精度教育卡片 |
| 🛰️ **航天器面板** | 旅行者、朱诺、新视野号的轨迹与发现 |

---

## 🚀 快速开始

### 前置要求

- Node.js 18+（推荐LTS）
- npm 9+ 或 pnpm 8+

### 安装

```bash
# 克隆仓库
git clone https://github.com/twzhan/solar-system-3d.git
cd solar-system-3d

# 安装依赖
npm install

# 启动开发服务器（端口3000，自动打开浏览器）
npm run dev
```

### 生产构建

```bash
# 生产构建（输出到dist/）
npm run build

# 预览生产构建
npm run preview
```

---

## 🏗️ 架构

### 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript 5.7 |
| 构建工具 | Vite 5.4 |
| 3D渲染 | Three.js + @react-three/fiber + @react-three/drei |
| 状态管理 | Zustand 5 |
| UI样式 | Tailwind CSS 3.4 |
| 动画 | Framer Motion |
| 图标 | Lucide React |
| 音频 | Web Audio API（原生） |

### 关键设计决策

- **集中式时间推进** — 所有轨道动画逻辑通过`SolarSystem.tsx`中的`useFrame`统一管理，避免多组件状态竞争
- **开普勒精度** — 使用牛顿-拉夫逊迭代求解`M = E - e·sin(E)`获取真实轨道位置
- **Ref驱动的相机动画** — 相机动画使用ref实现流畅60fps，异步清理Redux式状态
- **Zustand全局状态** — 所有UI状态、游戏进度、面板可见性统一管理

---

## 📁 项目结构

```
src/
├── components/          # React组件（3D场景 + UI覆盖层）
│   ├── SolarSystem.tsx     # 3D场景根组件：时间推进、相机动画
│   ├── Planet.tsx          # 天体渲染（递归卫星、轨道线、标签）
│   ├── Controls.tsx        # 底部控制栏（时间、视角、功能入口）
│   ├── InfoPanel.tsx       # 右侧天体信息面板
│   └── ... 25+互动面板
├── data/                # 静态数据
│   ├── celestialData.ts   # NASA JPL轨道根数
│   ├── missions.ts        # 任务定义
│   ├── achievements.ts    # 成就数据
│   ├── quiz.ts            # 测验题库
│   └── ...
├── store/
│   └── useStore.ts        # Zustand全局状态
├── utils/
│   ├── orbit.ts           # 开普勒轨道力学
│   ├── physics.ts         # 物理公式（光行时间、宜居带等）
│   └── audio.ts           # Web Audio API音景
└── styles/
    └── index.css          # Tailwind + 科幻风格自定义组件类
```

---

## 🧪 AI Agent 指南

本项目专为AI Agent无缝交互而设计：

```bash
# 1. 克隆并安装
git clone https://github.com/twzhan/solar-system-3d.git
cd solar-system-3d
npm install

# 2. 启动开发
npm run dev
# → 在 http://localhost:3000 打开

# 3. 生产构建
npm run build
# → 静态文件输出到dist/
```

**修改参考的关键文件：**
- 添加天体 → `src/data/celestialData.ts`（遵循`CelestialBody`接口）
- 添加UI面板 → `src/store/useStore.ts`（添加`show*`布尔值 + setter）
- 添加知识主题 → `src/data/knowledgeV2.ts`（遵循`KnowledgeItemV2`接口，含Bronze/Silver/Gold三级）
- 添加测验题目 → `src/data/quiz.ts`
- 添加跨学科连接 → `src/data/interdisciplinary.ts`
- 添加天文学家档案 → `src/data/scientists.ts`
- 修改轨道数学 → `src/utils/orbit.ts`
- 修改物理公式 → `src/utils/physics.ts`
- 添加成就 → `src/data/achievements.ts` + `src/utils/achievements.ts`

**重要约定：**
- 所有UI文本和注释使用**中文**（`zh-CN`）
- 复用现有科幻CSS类（`.sci-panel`、`.sci-button`、`.sci-text-glow`）
- 避免在新组件中使用`useFrame` — 将时间逻辑集中到`SolarSystem.tsx`
- `strict: true` TypeScript — 避免使用`any`

---

## 🤝 参与贡献

欢迎贡献！请阅读 [CONTRIBUTING.md](CONTRIBUTING.md) 了解指南。

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

---

## 📜 许可证

基于 MIT 许可证分发。详见 [LICENSE](LICENSE)。

---

## 🙏 致谢

- 轨道数据来源于 [NASA JPL Horizons](https://ssd.jpl.nasa.gov/horizons/)
- 3D渲染由 [Three.js](https://threejs.org/) 和 [React Three Fiber](https://docs.pmndrs.react-three-fiber.io/) 提供
- 字体：[Orbitron](https://fonts.google.com/specimen/Orbitron) & [Noto Sans SC](https://fonts.google.com/specimen/Noto+Sans+SC)

---

<p align="center">用 🪐 为科学教育而制作</p>
