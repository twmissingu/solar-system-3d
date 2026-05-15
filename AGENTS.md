# AGENTS.md — 太阳系3D探索

> 本文件供 AI 编程助手阅读。项目所有代码注释和 UI 文本均使用中文。

## 项目概述

本项目是一个面向科学教育的 **3D 交互式太阳系探索网页应用**，目标受众为 **10–15 岁青少年**。用户可以在浏览器中浏览太阳系的 3D 场景，观察基于真实天文数据的行星轨道运动，参与各种教育互动模块（探索任务、预测挑战、沙盘实验、月食实验、黑洞探险等）。

应用以中文为界面语言，面向中文用户群体，采用科幻风格的 HUD 视觉设计。

**核心理念**："展示给你看" → "邀请你来思考"。教育设计强调科学思维的培养，而不仅是知识的传递。

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | React 18 + TypeScript 5.7 |
| 构建工具 | Vite 5.4 |
| 3D 渲染 | Three.js + @react-three/fiber + @react-three/drei |
| 状态管理 | Zustand 5 |
| UI 样式 | Tailwind CSS 3.4 |
| 动画 | Framer Motion |
| 图标 | Lucide React |
| 音频 | Web Audio API（原生，无外部库） |

## 项目结构

```
src/
├── components/          # React 组件（3D 场景组件 + UI 覆盖层）
│   ├── SolarSystem.tsx     # 3D 场景根组件：时间推进、相机动画
│   ├── Planet.tsx          # 单个天体渲染（含卫星递归、轨道线、标签、脉冲信标）
│   ├── AsteroidBelt.tsx    # 小行星带
│   ├── Spacecraft.tsx      # 航天器 3D 模型
│   ├── Controls.tsx        # 底部控制栏（时间、视角、功能入口、报告导出）
│   ├── InfoPanel.tsx       # 右侧天体信息面板
│   ├── WelcomeOverlay.tsx  # 欢迎引导遮罩（含声音声明）
│   ├── LoadingScreen.tsx   # 加载画面
│   ├── MissionPanel.tsx    # 探索任务面板
│   ├── AchievementToast.tsx / AchievementPanel.tsx  # 成就系统（反问句形式）
│   ├── JourneyMode.tsx / JourneyHUD.tsx             # 光速旅程模式
│   ├── PredictionGame.tsx  # 预测挑战游戏
│   ├── SandboxPanel.tsx    # 沙盘实验
│   ├── SpacecraftPanel.tsx # 航天器信息面板
│   ├── HohmannDesigner.tsx # 霍曼转移轨道设计器
│   ├── EclipseLab.tsx      # 月食实验
│   ├── BlackHoleSimulator.tsx  # 黑洞模拟器（含质量滑块）
│   ├── NarrativePanel.tsx  # 故事任务
│   ├── SharePanel.tsx      # 探索报告/分享
│   ├── QuizPanel.tsx       # 测验面板
│   ├── KnowledgeExplorer.tsx   # 知识探索（Bronze/Silver/Gold + 追问链 + 升级动画）
│   ├── InterdisciplinaryPanel.tsx  # 跨学科面板（含💡思考标签）
│   ├── ScienceFrontiers.tsx    # 科学前沿（含模型精度教育卡片）
│   ├── ObservationGuide.tsx    # 观测指南（含工具分级推荐）
│   ├── InstrumentsPanel.tsx    # 仪器面板
│   ├── ScaleRuler.tsx          # 比例尺感受器（太阳=篮球）
│   ├── ScientistGallery.tsx    # 天文学家画廊（8位多元科学家）
│   ├── StarMapPanel.tsx        # 四季星空面板
│   └── HUDOverlay.tsx      # HUD 层
├── data/                # 静态数据
│   ├── celestialData.ts   # 天体轨道根数（NASA JPL 简化数据）
│   ├── missions.ts        # 任务数据
│   ├── achievements.ts    # 成就数据（反问句文案）
│   ├── journeyData.ts     # 旅程模式数据
│   ├── spacecraft.ts      # 航天器数据
│   ├── quiz.ts            # 测验题库（含科学史误解题型）
│   ├── knowledge.ts / knowledgeV2.ts  # 知识点数据（三级分层 + 桥梁文案）
│   ├── narrativeMissions.ts   # 故事任务数据
│   ├── interdisciplinary.ts   # 跨学科数据（含💡思考标签）
│   ├── controversies.ts   # 科学争议/投票数据
│   └── scientists.ts      # 天文学家档案（8位多元科学家）
├── store/
│   └── useStore.ts        # Zustand 全局状态（所有 UI 状态、游戏进度）
├── utils/
│   ├── orbit.ts           # 开普勒轨道计算（牛顿迭代法解开普勒方程）
│   ├── physics.ts         # 物理公式（光行时间、宜居带、表面温度等）
│   ├── eclipse.ts         # 月食计算
│   ├── date.ts            # 日期格式化
│   ├── audio.ts           # Web Audio API 音效与氛围音
│   └── achievements.ts    # 成就评估逻辑
├── styles/
│   └── index.css          # Tailwind 指令 + 科幻风格自定义组件类
├── App.tsx                # 根组件：Canvas + 所有 UI 覆盖层
└── main.tsx               # 入口：ReactDOM.createRoot
```

## 构建与运行命令

```bash
# 安装依赖
npm install

# 开发服务器（端口 3000，自动打开浏览器）
npm run dev

# 生产构建（输出到 dist/，含 sourcemap）
npm run build

# 预览生产构建
npm run preview
```

**关键配置**：
- `vite.config.ts` — 使用 `@vitejs/plugin-react`，开发端口 3000，构建输出目录 `dist/`
- `tsconfig.json` — `strict: true`，模块为 `ESNext`，`jsx: react-jsx`
- `tailwind.config.js` — 自定义颜色（`space-*`、`sci-*`）和字体（`Orbitron`、`Noto Sans SC`）

## 架构要点

### 3D 场景架构
- `@react-three/fiber` 的 `<Canvas>` 定义在 `App.tsx`，包含相机、灯光、雾效、星空背景。
- `SolarSystem.tsx` 在 `useFrame` 中统一处理**时间推进**和**相机动画**（避免多个组件各自订阅造成性能问题）。
- `Planet.tsx` 递归渲染卫星；通过 `getHeliocentricPosition()` / `getSatellitePosition()` 计算轨道位置。
  - 真实比例模式下，不可见行星渲染 `PulsingBeacon` 脉冲信标（`THREE.Mesh` + `useFrame` 脉冲动画）。
  - 点击天体时自动聚焦（相机飞至 `effectiveRadius * 5` 距离处）。
- 轨道计算使用真实开普勒椭圆（牛顿迭代法解 `M = E - e*sin(E)`），数据基于 J2000.0 历元，已修复平近点角 M₀ 和近日点辐角 ω。
- `Spacecraft.tsx` **条件渲染**：默认隐藏所有航天器轨迹，仅当 `selectedSpacecraft` + `showSpacecraftPanel` 同时有效时才显示对应轨迹（C 方案）。

### 状态管理
- 所有状态集中在 `src/store/useStore.ts`（Zustand）。
- 状态类型包括：选中的天体、时间速度、相机目标、成就进度、任务进度、各面板的显示开关等。
- 新增状态命名：`showScientistGallery`、`showScaleRuler`、`showStarMap`。
- 组件通过 `useStore()` 订阅所需状态片段。

### UI 设计体系
- 全局 CSS 在 `src/styles/index.css` 中定义了科幻风格的组件类：
  - `.sci-panel` — 毛玻璃面板（backdrop-blur + 半透明边框 + 内发光）
  - `.sci-button` / `.sci-button-primary` — 主/次按钮
  - `.sci-text-glow` — 文字发光效果
  - `.sci-corner` / `.hud-corner` — 角落装饰线框
  - `.sci-slider` — 自定义滑块
  - `.dock-container` / `.dock-item` / `.dock-divider` — Dock 栏与分组分割
  - `.toolbox-drawer` / `.toolbox-item` — 工具箱抽屉（移动端底部滑入）
- 颜色主题以深空蓝（`#050B14`）为底，青绿色（`#4ECDC4`）为强调色。
  - 语义色 token（`tailwind.config.js`）：`sci-success`、`sci-danger`、`sci-warning`、`sci-neutral`
- 字体：标题使用 `Orbitron`（无衬线科技感），正文使用 `Noto Sans SC`。
- 面板动画统一：`damping: 25, stiffness: 300, scale: 0.92`。
- 所有面板关闭按钮使用 Lucide `<X size={16} />`。

### 教育内容架构
- **知识分层**：Bronze（感知层）→ Silver（关联层/量化层）→ Gold（机制层），通过 `knowledgeV2.ts` 定义。
  - 升级过渡使用 Framer Motion spring 动画（`scale: 0.96→1`）。
  - 每级之间需有**桥梁文案**衔接，避免认知断崖。
- **成就系统**：`achievements.ts` 中 `description` 字段使用**反问句**形式，植入认知钩子。
  - 例："火星先锋 🔴 —— 火星曾经有水。你觉得，那些水去了哪里？"
- **跨学科连接**：`interdisciplinary.ts` 的 `connections` 数组中，以 `💡 思考：` 前缀标识追问条目，UI 渲染时高亮显示。
- **天文学家画廊**：`scientists.ts` 定义 `Scientist` 接口，每位科学家含 `searchKeyword` 字段供学生继续探索。

## 代码规范

### 命名约定
- **组件文件**：PascalCase（如 `MissionPanel.tsx`）
- **数据/工具文件**：camelCase（如 `celestialData.ts`、`useStore.ts`）
- **Zustand 状态**：`camelCase`，布尔开关以 `show` 开头（如 `showMissionPanel`）

### 类型安全
- TypeScript `strict` 模式已开启。
- 天体数据类型定义在 `celestialData.ts`：`CelestialBody`、`OrbitalElements`。
- 尽量避免 `any`；3D 对象使用 `@react-three/fiber` 的扩展 JSX 类型。

### 性能注意
- `useFrame` 中的状态更新被严格限制在 `SolarSystem.tsx` 中。
- `Planet.tsx` 中的 `PulsingBeacon` 是局部 `useFrame` 例外（仅渲染 pulse 动画，不更新共享状态）。
- 相机动画使用 `ref` 存储中间状态，动画完成后通过 `useEffect` 异步清理 Redux-like 状态。
- `Planet.tsx` 使用 `useMemo` 缓存轨道线顶点、材质颜色和有效半径。

## 测试

**当前项目未配置测试框架**。如需添加测试，建议：
- 单元测试：`vitest` + `@testing-library/react`
- 3D 场景测试较复杂，可优先测试 `utils/orbit.ts` 和 `utils/physics.ts` 中的纯函数

## 部署

本项目为纯前端静态站点：
- 运行 `npm run build` 生成 `dist/` 目录
- 将 `dist/` 内容部署到任何静态托管服务（Vercel、Netlify、GitHub Pages 等）
- 无后端服务、无数据库、无环境变量依赖

## 项目文档

| 文件 | 说明 |
|------|------|
| `README.md` | 英文版项目说明（主README） |
| `README_zh.md` | 中文版项目说明 |
| `LICENSE` | MIT 许可证 |
| `CONTRIBUTING.md` | 贡献指南 |
| `CHANGELOG.md` | 版本更新日志 |
| `AGENTS.md` | AI Agent 项目说明（本文件） |

## 安全注意事项

- 无用户认证或敏感数据处理。
- 音频上下文需要用户交互后激活（浏览器策略），`audio.ts` 已做 try-catch 静默处理。
- `index.html` 中通过 CDN 加载 Google Fonts，若需完全离线可改为本地字体文件。

## 给 AI 助手的提示

1. **所有 UI 文本和注释保持中文**。不要引入英文界面文本。
2. **不要破坏现有视觉风格**。新增面板/按钮应复用 `.sci-panel`、`.sci-button`、`.sci-button-primary` 等已有类名。
3. **3D 性能敏感**：避免在多个组件中各自调用 `useFrame` 更新共享状态；优先将时间相关逻辑集中到 `SolarSystem.tsx`。`PulsingBeacon` 等局部动画例外，但需确保不触发状态更新。
4. **轨道数据格式**：新增天体时参考 `celestialData.ts` 中的 `OrbitalElements` 接口（`a, e, i, L, longPeri, longNode, period`）。
5. **状态扩展**：如需新增全局状态，直接在 `useStore.ts` 的 `AppState` 接口和 `create<AppState>()` 初始值中添加，保持现有命名风格（`show` + PascalCase 面板名）。
6. **键盘无障碍**：PredictionGame 拨盘等自定义交互组件需要键盘支持（`role="slider"` + 方向键 + `tabIndex`）。所有面板应支持 Escape 关闭。
7. **教育文案规范**：
   - 知识分层过渡（Silver/Gold）开头需有**桥梁文案**，引用前一级内容。
   - 成就 `description` 优先使用**反问句**，植入思考钩子。
   - 跨学科 `connections` 中的追问条目以 `💡 思考：` 前缀标识。
   - 所有科学事实需标注不确定性（如"科学家认为..."、"主流假说..."）。
8. **内容生产规范**：新增天文学家档案遵循 `scientists.ts` 的 `Scientist` 接口，必须包含 `searchKeyword` 字段供学生继续搜索。
9. **纯前端限制**：无后端、无 LLM API。所有功能必须在前端实现（localStorage、Blob 下载、纯计算等）。

## 已知陷阱（历史 Bug 记录）

以下是在代码审核中发现的典型问题，新增代码时应特别留意：

| 类别 | 常见错误 | 正确做法 |
|------|---------|---------|
| 轨道计算 | `atan2(pos[2], pos[0])` 用 z 轴代替 y 轴 | 黄道面坐标用 `atan2(pos[1], pos[0])` |
| 自转动画 | 将天数增量（圈数）直接加到 `rotation.y`（弧度） | 乘以 `Math.PI * 2` 转换为弧度 |
| 小行星带 | `y = r·sin(θ)·sin(i)` 几何展开错误 | 先做 XY 圆轨道再绕 X 轴倾斜：`y = r·sin(θ)·cos(i)` |
| 土星光环 | 硬编码角度不与 `body.axialTilt` 联动 | 移入 axialTilt 组，用 `Math.PI / 2` 水平放置 |
| 月食检测 | 未检查 `moonDotAxis ≤ 0`（月球在日侧） | 月食必在背日侧 |
| 黑洞物理 | 潮汐力 `M/d³` 公式错误 | 正确公式 `1/(d³·M²)`（距离以视界半径为单位） |
| 隐私模式 | `localStorage` 不可用时 catch 中缺少去重 | 回退到 `sessionStorage` 或内存计数 |
| 成就触发 | `evaluateAchievements()` 仅在一处调用 | 任务完成、知识解锁等处都应触发 |
| 卫星相位 | `L=0` 全部从同一相位出发 | 分配分散的 L 值（0-360°） |
| 缩放因子 | 硬编码 `* 15` 和 `* 1500` | 使用命名常量 `ORBIT_SCALE` 和 `SATELLITE_SCALE` |
