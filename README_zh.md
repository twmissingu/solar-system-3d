<p align="center">
  <img src="public/og-image.png" alt="太阳系3D探索" width="600"/>
</p>

<h1 align="center">🚀 太阳系3D探索</h1>

<p align="center">
  <strong>面向 10–15 岁青少年的交互式 3D 太阳系科学教育应用</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" alt="React 18"/>
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript" alt="TypeScript 5.7"/>
  <img src="https://img.shields.io/badge/Three.js-R3F-000000?logo=three.js" alt="Three.js + R3F"/>
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite" alt="Vite 5.4"/>
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT License"/>
</p>

<p align="center">
  <a href="#-功能特色">功能</a> •
  <a href="#-快速开始">快速开始</a> •
  <a href="#-给-ai-助手的说明">AI 助手</a> •
  <a href="#-项目结构">结构</a> •
  <a href="#-贡献指南">贡献</a>
</p>

---

**像科学家一样探索太阳系。** 在逼真的 3D 轨道场景中穿梭，体验 20+ 个教育互动模块，发现科学的魅力不在于记住事实，而在于提出更好的问题。

基于 React Three Fiber 构建，纯静态前端应用——无需后端、无需注册、`npm install && npm run dev` 即可运行。

---

## ✨ 功能特色

### 🌌 3D 太阳系场景

| | |
|---|---|
| **真实轨道力学** | 牛顿迭代法求解开普勒方程，精确模拟椭圆轨道 + 倾角 + 近日点辐角 + 升交点 |
| **全部 8 大行星 + 5 颗矮行星** | 含卫星、光环、小行星带 |
| **双尺度模式** | 夸张比例（行星可见） ↔ 真实比例（体验宇宙的空旷） |

### 🎮 20+ 交互模块

| 模块 | 说明 |
|--------|------|
| 🚀 **探索任务** | 引导式太阳系探索，含渐进提示和成就奖励 |
| 🔮 **预测挑战** | 预测 N 天后行星位置，比谁更准 |
| 🧪 **沙盘实验** | 实时调整地球轨道，观测温度/宜居性变化 |
| 🌑 **月食实验** | 调节参数，发现月全食的条件 |
| 🕳️ **黑洞模拟器** | 靠近事件视界，体验时间膨胀和潮汐力 |
| 🛸 **轨道设计器** | 可视化霍曼转移轨道 |
| 📜 **探索历程** | 从古代天文到未来任务的 28 个里程碑事件 |
| 🔬 **天文学家画廊** | 8 位跨文化、跨时代的天文学家档案 |
| 📖 **故事任务** | 剧情驱动的太阳系探险 |

### 🧠 教育设计理念

| 原则 | 实现 |
|-----------|-------|
| **知识分层** | 青铜（感知）→ 白银（关联）→ 黄金（机制），级间桥梁文案衔接 |
| **追问链** | 每级知识含渐进式追问链，"继续追问 →" 引导深度思考 |
| **成就即提问** | 成就描述全部采用反问句——"火星曾经有水，你觉得那些水去了哪里？" |
| **模型透明** | 每个计算都标注为简化模型，并说明局限性 |
| **跨学科连接** | 💡 标签提示连接天文与物理、化学、生物、历史 |

### 🎨 科幻 HUD 视觉
- 毛玻璃面板 + 全息角落装饰
- 自定义数据流动画 + 轨道相位仪表
- 扫描线覆盖层 + 准星
- Spring 弹性面板过渡动画
- 全响应式——桌面到移动端

---

## 🚀 快速开始

### 前置条件
- Node.js >= 18
- npm >= 9

### 安装与运行

```bash
# 克隆
git clone https://github.com/your-username/solar-system-3d.git
cd solar-system-3d

# 安装依赖
npm install

# 启动开发服务器（自动打开 http://localhost:3000）
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

纯静态站点——将 `dist/` 部署到任何静态托管服务（Vercel、Netlify、GitHub Pages 等）即可。

---

## 🤖 给 AI 助手的说明

本项目为 AI 助手提供了完整的上下文文件 `AGENTS.md`，包含：

- 全部组件清单及文件路径
- 架构决策（状态管理、渲染、样式体系）
- 编码规范与命名约定
- 教育内容标准（文案规范、科学事实不确定性标注）
- 性能优化指南

**在修改代码前，务必阅读 `AGENTS.md`** —— 它包含项目特有的关键约定。

### 主要架构

| 层级 | 技术 |
|-------|-----------|
| 框架 | React 18 + TypeScript 5.7 |
| 3D渲染 | Three.js + @react-three/fiber + @react-three/drei |
| 状态管理 | Zustand 5（单 Store，无持久化） |
| 样式 | Tailwind CSS 3.4 科幻主题 |
| 动画 | Framer Motion 11 |
| 图标 | Lucide React |
| 音频 | Web Audio API（原生，无外部库） |
| 构建 | Vite 5.4 → 静态 `dist/` |

### AI 快速开始

```bash
# 1. 克隆并安装
git clone <repo-url>
cd solar-system-3d
npm install

# 2. 启动开发服务器
npm run dev

# 3. 生产构建
npm run build
```

---

## 📁 项目结构

```
src/
├── components/     # 35+ React 组件（3D 场景 + UI 面板）
├── data/           # 静态数据（天体、成就、任务、科学家...）
├── store/          # Zustand 全局状态（单 Store）
├── utils/          # 纯函数（轨道计算、物理、音频、日期...）
├── styles/         # Tailwind + 自定义科幻 CSS 类
├── App.tsx         # 根组件：Canvas + 所有 UI 覆盖层
└── main.tsx        # 入口
```

所有 UI 文本和注释使用**简体中文**。

---

## 🧪 测试

当前未配置测试框架。推荐：
- 单元测试：`vitest` + `@testing-library/react`
- 优先测试 `utils/orbit.ts` 和 `utils/physics.ts` 中的纯函数
- 3D 场景组件测试较复杂，建议优先覆盖数据层和工具函数

---

## 📄 开源许可

MIT License — 详情见 [LICENSE](LICENSE)

版权所有 (c) 2026 Solar System 3D Team

---

<p align="center">
  <sub>为科学教育而建。无 LLM API、无后端、无数据收集。</sub>
</p>
