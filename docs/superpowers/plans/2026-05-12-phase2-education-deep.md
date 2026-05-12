# Phase 2: 教育体验深化 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development

**Goal:** 解决 educator 意见 #1（旅程尺度教育）、#3（预测验证闭环）、#4（沙盘实验）、#11（事件锚定时间），将"看动画"升级为"做科学"。

**Architecture:** 旅程模式利用现有 camera animation 系统；预测验证基于现有轨道计算 + 角度输入；沙盘实验通过动态修改轨道参数实时重算；事件锚定扩展时间控制系统。所有功能通过 Zustand store 协调。

**Tech Stack:** React 18 + TypeScript + Vite 5 + Zustand + Framer Motion + Tailwind CSS + React Three Fiber

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/components/JourneyMode.tsx` | 旅程模式主组件：光速飞行、行星停靠、HUD信息显示 |
| `src/components/JourneyHUD.tsx` | 旅程模式HUD覆盖层：飞行时间、距离、尺度对比 |
| `src/components/PredictionGame.tsx` | 预测验证游戏：选择角度→快进验证→误差反馈 |
| `src/components/SandboxPanel.tsx` | 沙盘实验面板：轨道参数滑块、实时物理计算、宜居带可视化 |
| `src/components/Controls.tsx` | 改造：添加旅程模式/沙盘入口，重构时间控制为事件锚定 |
| `src/store/useStore.ts` | 扩展：旅程状态、预测游戏状态、沙盘参数 |
| `src/utils/physics.ts` | 物理计算：光行时间、表面温度、宜居带、开普勒第三定律 |
| `src/data/journeyData.ts` | 旅程数据：各行星距离、光行时间、像素大小对比 |

---

## Task 1: 旅程模式 — "从太阳到冥王星的旅程"

**Files:**
- Create: `src/data/journeyData.ts`
- Create: `src/utils/physics.ts`
- Create: `src/components/JourneyHUD.tsx`
- Create: `src/components/JourneyMode.tsx`
- Modify: `src/store/useStore.ts`
- Modify: `src/components/Controls.tsx`

### 1.1 `src/data/journeyData.ts`

```typescript
export interface JourneyStop {
  bodyId: string;
  bodyNameZh: string;
  distanceAU: number; // 平均距离
  lightMinutes: number; // 光行时间（分钟）
  description: string;
  scaleFact: string; // 如"地球只有1像素大"
}

export const journeyStops: JourneyStop[] = [
  { bodyId: 'sun', bodyNameZh: '太阳', distanceAU: 0, lightMinutes: 0, description: '我们的旅程从太阳开始。', scaleFact: '' },
  { bodyId: 'mercury', bodyNameZh: '水星', distanceAU: 0.387, lightMinutes: 3.2, description: '水星是离太阳最近的行星。', scaleFact: '太阳看起来比地球天空中大3倍' },
  { bodyId: 'venus', bodyNameZh: '金星', distanceAU: 0.723, lightMinutes: 6.0, description: '金星是太阳系最热的行星。', scaleFact: '太阳亮度是地球的1.9倍' },
  { bodyId: 'earth', bodyNameZh: '地球', distanceAU: 1.0, lightMinutes: 8.3, description: '这是我们的家园。', scaleFact: '一切正常——你熟悉的大小' },
  { bodyId: 'mars', bodyNameZh: '火星', distanceAU: 1.524, lightMinutes: 12.7, description: '火星被称为红色星球。', scaleFact: '太阳只有地球看到的2/3大' },
  { bodyId: 'jupiter', bodyNameZh: '木星', distanceAU: 5.204, lightMinutes: 43.2, description: '木星是太阳系最大的行星。', scaleFact: '太阳只有地球看到的1/25大' },
  { bodyId: 'saturn', bodyNameZh: '土星', distanceAU: 9.582, lightMinutes: 79.3, description: '土星以其壮丽的光环闻名。', scaleFact: '太阳只有地球看到的1/90大' },
  { bodyId: 'uranus', bodyNameZh: '天王星', distanceAU: 19.218, lightMinutes: 159.6, description: '天王星几乎横躺着自转。', scaleFact: '太阳看起来像一个明亮的星星' },
  { bodyId: 'neptune', bodyNameZh: '海王星', distanceAU: 30.11, lightMinutes: 250.0, description: '海王星拥有最强烈的风暴。', scaleFact: '太阳亮度只有地球的1/900' },
  { bodyId: 'pluto', bodyNameZh: '冥王星', distanceAU: 39.48, lightMinutes: 327.0, description: '冥王星是柯伊伯带的矮行星。', scaleFact: '太阳只是一个明亮的点' },
];
```

### 1.2 `src/utils/physics.ts`

```typescript
/**
 * 计算光从太阳到某距离所需时间（分钟）
 */
export function lightTravelMinutes(distanceAU: number): number {
  // 1 AU = 8.317 光分钟
  return distanceAU * 8.317;
}

/**
 * 计算某距离处太阳的视大小（角直径，度）
 */
export function solarAngularDiameter(distanceAU: number): number {
  // 太阳角直径在1 AU处约0.53°
  return 0.53 / distanceAU;
}

/**
 * 计算某距离处接收到的太阳辐射（相对地球=1）
 */
export function solarIrradiance(distanceAU: number): number {
  return 1 / (distanceAU * distanceAU);
}

/**
 * 估算行星表面平衡温度（简化模型）
 * albedo: 反照率 (0-1)，地球约0.3
 */
export function estimatedSurfaceTemperature(distanceAU: number, albedo: number = 0.3): number {
  // 简化公式: T = T_earth * (1/distanceAU^2)^(1/4) * ((1-albedo)/(1-0.3))^(1/4)
  // 地球平均温度约288K
  const earthDist = 1.0;
  const earthAlbedo = 0.3;
  const earthTemp = 288; // K
  const fluxRatio = (solarIrradiance(distanceAU) * (1 - albedo)) / (solarIrradiance(earthDist) * (1 - earthAlbedo));
  return earthTemp * Math.pow(fluxRatio, 0.25);
}

/**
 * 开普勒第三定律：已知半长轴计算周期（地球年）
 */
export function keplerThirdLaw(semiMajorAxisAU: number): number {
  return Math.pow(semiMajorAxisAU, 1.5);
}

/**
 * 格式化时间：分钟 → "X分Y秒" 或 "X小时Y分"
 */
export function formatLightTime(minutes: number): string {
  if (minutes < 1) {
    return `${(minutes * 60).toFixed(0)}秒`;
  }
  if (minutes < 60) {
    return `${Math.floor(minutes)}分${Math.floor((minutes % 1) * 60)}秒`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  return `${hours}小时${mins}分`;
}

/**
 * 宜居带计算（简化）：返回内外边界（AU）
 * 基于液态水存在可能
 */
export function habitableZone(): { inner: number; outer: number } {
  // 太阳宜居带约 0.95 - 1.37 AU
  return { inner: 0.95, outer: 1.37 };
}
```

### 1.3 Store 扩展

```typescript
// 添加到 AppState
interface AppState {
  // ... existing ...

  // 旅程模式
  journeyMode: 'idle' | 'running' | 'paused' | 'completed';
  setJourneyMode: (mode: 'idle' | 'running' | 'paused' | 'completed') => void;
  currentJourneyIndex: number;
  setCurrentJourneyIndex: (index: number) => void;
  showJourneyHUD: boolean;
  setShowJourneyHUD: (show: boolean) => void;
}

// Store init
journeyMode: 'idle',
setJourneyMode: (mode) => set({ journeyMode: mode }),
currentJourneyIndex: 0,
setCurrentJourneyIndex: (index) => set({ currentJourneyIndex: index }),
showJourneyHUD: false,
setShowJourneyHUD: (show) => set({ showJourneyHUD: show }),
```

### 1.4 `src/components/JourneyMode.tsx`

旅程模式控制逻辑（非UI渲染，只控制相机动画和状态）：

```typescript
import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { journeyStops } from '../data/journeyData';
import { getHeliocentricPosition } from '../utils/orbit';
import { celestialBodies } from '../data/celestialData';

export default function JourneyMode() {
  const {
    journeyMode,
    currentJourneyIndex,
    setCurrentJourneyIndex,
    setJourneyMode,
    setCameraTarget,
    setCameraLookAt,
    setShowJourneyHUD,
    currentDay,
  } = useStore();

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const flyToStop = useCallback((index: number) => {
    if (index >= journeyStops.length) {
      setJourneyMode('completed');
      setShowJourneyHUD(false);
      return;
    }

    const stop = journeyStops[index];
    setCurrentJourneyIndex(index);
    setShowJourneyHUD(true);

    // 计算目标天体位置
    if (stop.bodyId === 'sun') {
      setCameraTarget([8, 3, 8]);
      setCameraLookAt([0, 0, 0]);
    } else {
      const body = celestialBodies.find((b) => b.id === stop.bodyId) ||
                   dwarfPlanets.find((b) => b.id === stop.bodyId);
      if (body) {
        const pos = getHeliocentricPosition(body.orbit, currentDay);
        // 相机停在行星前方/上方
        const camDist = Math.max(body.visualRadius * 8, 3);
        setCameraTarget([pos[0] + camDist, pos[1] + camDist * 0.5, pos[2] + camDist]);
        setCameraLookAt(pos);
      }
    }

    // 3秒后自动前往下一站
    timerRef.current = setTimeout(() => {
      flyToStop(index + 1);
    }, 5000);
  }, [currentDay, setCameraTarget, setCameraLookAt, setCurrentJourneyIndex, setJourneyMode, setShowJourneyHUD]);

  useEffect(() => {
    if (journeyMode === 'running' && currentJourneyIndex === 0) {
      flyToStop(0);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [journeyMode, currentJourneyIndex, flyToStop]);

  useEffect(() => {
    if (journeyMode === 'paused' && timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, [journeyMode]);

  return null; // 纯逻辑组件，不渲染DOM
}
```

### 1.5 `src/components/JourneyHUD.tsx`

旅程模式HUD覆盖层：

```typescript
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { journeyStops } from '../data/journeyData';
import { formatLightTime, solarAngularDiameter } from '../utils/physics';
import { Play, Pause, SkipForward, X } from 'lucide-react';

export default function JourneyHUD() {
  const { showJourneyHUD, journeyMode, currentJourneyIndex, setJourneyMode, setShowJourneyHUD } = useStore();
  const stop = journeyStops[currentJourneyIndex];

  if (!stop) return null;

  const totalLightMinutes = journeyStops
    .slice(0, currentJourneyIndex + 1)
    .reduce((sum, s) => sum + s.lightMinutes, 0);

  return (
    <AnimatePresence>
      {showJourneyHUD && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-35 pointer-events-none"
        >
          {/* 顶部信息 */}
          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute top-16 left-1/2 -translate-x-1/2 sci-panel sci-corner px-6 py-4 pointer-events-auto"
          >
            <div className="text-center">
              <p className="text-[10px] text-sci-cyan/60 uppercase tracking-widest mb-1">
                光速旅程 · {currentJourneyIndex + 1} / {journeyStops.length}
              </p>
              <h2 className="text-xl font-bold text-sci-white sci-text-glow" style={{ fontFamily: 'Orbitron' }}>
                {stop.bodyNameZh}
              </h2>
              <p className="text-sm text-sci-white/70 mt-1">{stop.description}</p>
            </div>
          </motion.div>

          {/* 左下信息面板 */}
          <motion.div
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="absolute bottom-20 left-4 sci-panel sci-corner p-4 max-w-xs pointer-events-auto"
          >
            <div className="space-y-2">
              <InfoRow label="距离太阳" value={`${stop.distanceAU} AU`} />
              <InfoRow label="光速飞行时间" value={formatLightTime(stop.lightMinutes)} />
              <InfoRow label="累计飞行" value={formatLightTime(totalLightMinutes)} />
              {stop.scaleFact && (
                <InfoRow label="尺度感受" value={stop.scaleFact} />
              )}
              {stop.distanceAU > 0 && (
                <InfoRow label="太阳视大小" value={`${solarAngularDiameter(stop.distanceAU).toFixed(2)}°`} />
              )}
            </div>
          </motion.div>

          {/* 底部控制 */}
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto"
          >
            {journeyMode === 'running' ? (
              <button onClick={() => setJourneyMode('paused')} className="sci-button flex items-center gap-1">
                <Pause className="w-4 h-4" /> 暂停
              </button>
            ) : (
              <button onClick={() => setJourneyMode('running')} className="sci-button-primary flex items-center gap-1">
                <Play className="w-4 h-4" /> 继续
              </button>
            )}
            <button onClick={() => setJourneyMode('running')} className="sci-button flex items-center gap-1">
              <SkipForward className="w-4 h-4" /> 跳过
            </button>
            <button
              onClick={() => { setJourneyMode('idle'); setShowJourneyHUD(false); }}
              className="sci-button flex items-center gap-1"
            >
              <X className="w-4 h-4" /> 退出
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-xs text-sci-white/50">{label}</span>
      <span className="text-xs text-sci-cyan font-mono">{value}</span>
    </div>
  );
}
```

### 1.6 Controls 添加旅程入口

在 Controls 底部按钮组添加：
```typescript
<button onClick={() => { setJourneyMode('running'); setCurrentJourneyIndex(0); }} className="sci-button">
  🚀 光速旅程
</button>
```

---

## Task 2: 预测验证 — "猜猜行星在哪里？"

**Files:**
- Create: `src/components/PredictionGame.tsx`
- Modify: `src/store/useStore.ts`
- Modify: `src/data/achievements.ts`（添加"预言家"成就）

### 2.1 Store 扩展

```typescript
interface AppState {
  // ... existing ...

  // 预测游戏
  showPredictionGame: boolean;
  setShowPredictionGame: (show: boolean) => void;
  predictionTarget: { bodyId: string; bodyNameZh: string; currentAngle: number } | null;
  setPredictionTarget: (target: { bodyId: string; bodyNameZh: string; currentAngle: number } | null) => void;
  predictionUserAngle: number;
  setPredictionUserAngle: (angle: number) => void;
  predictionResult: { actualAngle: number; error: number; daysAdvanced: number } | null;
  setPredictionResult: (result: { actualAngle: number; error: number; daysAdvanced: number } | null) => void;
}
```

### 2.2 `src/components/PredictionGame.tsx`

预测验证游戏界面：
- 显示目标行星当前位置和"100天后会在哪里？"
- 圆形角度选择器（0-360°）让用户拖动预测
- "验证"按钮：快进100天，显示实际位置
- 计算误差角度，给出评价：
  - < 15°: "太准了！你简直是天文学家！"
  - 15-45°: "不错！轨道力学确实不容易。"
  - 45-90°: "有点偏差，但方向对了！"
  - > 90°: "没关系！行星轨道比想象的复杂。"
- 显示实际轨道运动轨迹

### 2.3 成就扩展

在 `src/data/achievements.ts` 添加：
```typescript
{ id: 'prophet', name: '预言家', description: '预测行星位置误差小于15°', icon: '🔮', rarity: 'rare', condition: { type: 'prediction_accuracy', threshold: 15 } },
```

---

## Task 3: 沙盘实验 — "如果地球离太阳近一点？"

**Files:**
- Create: `src/components/SandboxPanel.tsx`
- Modify: `src/store/useStore.ts`
- Modify: `src/components/Controls.tsx`

### 3.1 Store 扩展

```typescript
interface AppState {
  // ... existing ...

  // 沙盘实验
  showSandbox: boolean;
  setShowSandbox: (show: boolean) => void;
  sandboxEarthOrbitAU: number; // 默认 1.0
  setSandboxEarthOrbitAU: (au: number) => void;
}
```

### 3.2 `src/components/SandboxPanel.tsx`

沙盘实验面板：
- 滑块：地球轨道半长轴（0.3 AU ~ 3.0 AU，默认1.0）
- 实时计算显示：
  - 新轨道周期（开普勒第三定律）
  - 估算表面温度（简化模型）
  - 是否在宜居带内（绿色=是，红色=否）
  - 季节变化强度
- 可视化：
  - 宜居带用半透明绿色环形区域表示（内0.95 AU，外1.37 AU）
  - 当前地球轨道用虚线圆表示
  - 太阳居中
- 重置按钮
- 教育说明："地球在1 AU处温度适宜。如果太近，水会蒸发；太远，水会结冰。"

### 3.3 3D场景改造

在 `SolarSystem.tsx` 或 `App.tsx` 中，当 `showSandbox` 为 true 时：
- 显示宜居带环（半透明绿色圆环，0.95-1.37 AU）
- 地球使用 `sandboxEarthOrbitAU` 而非真实轨道数据
- 其他行星可以淡化显示

---

## Task 4: 事件锚定时间控制

**Files:**
- Modify: `src/components/Controls.tsx`
- Modify: `src/store/useStore.ts`

### 4.1 时间模式扩展

添加新的时间模式概念：

```typescript
export type TimeMode = 'simulation' | 'light-speed' | 'lifetime';
```

- **simulation**: 现有的 1x/10x/100x/1000x
- **light-speed**: 以光速为参考的时间模式。显示"如果你以光速旅行，每秒钟可以穿越XXX"
- **lifetime**: 一生模式。"如果你活到80岁，按真实速度看，土星公转约 80/29.5 = 2.7 圈"

### 4.2 Controls 时间控制重构

在现有时间控制区域添加模式切换：
- 标签页：模拟速度 / 光速旅行 / 一生视角
- 光速旅行模式：显示光从当前位置到各行星的时间
- 一生视角模式：显示"在你一生中，各行星会公转多少圈"

### 4.3 Store 扩展

```typescript
interface AppState {
  // ... existing ...
  timeMode: 'simulation' | 'light-speed' | 'lifetime';
  setTimeMode: (mode: 'simulation' | 'light-speed' | 'lifetime') => void;
}
```

---

## Task 5: 构建验证

运行 `npm run build`，确保零 TypeScript 错误。

## 依赖关系

```
Task 1 (旅程模式)
  ├── 需要 physics.ts
  └── 需要 journeyData.ts
Task 2 (预测验证)
  ├── 依赖现有 orbit.ts 计算
  └── 依赖现有时间系统
Task 3 (沙盘实验)
  ├── 依赖 physics.ts
  └── 需要修改 3D 渲染（条件渲染宜居带）
Task 4 (事件锚定)
  └── 主要修改 Controls.tsx UI
```
