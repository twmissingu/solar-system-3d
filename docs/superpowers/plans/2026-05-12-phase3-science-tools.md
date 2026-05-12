# Phase 3: 科学实践工具 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development

**Goal:** 解决 educator 意见 #5（航天器）、#13（虚拟仪器）、#14（建造设计）、#15（月食实验），让孩子动手做科学而不是只看。

**Architecture:** 航天器作为3D场景中的可点击轨迹线+图标；虚拟仪器作为InfoPanel内的可切换工具标签；霍曼转移作为2D交互式SVG轨道图；月食实验作为参数滑块+实时阴影渲染。

**Tech Stack:** React 18 + TypeScript + Vite 5 + Zustand + Framer Motion + Tailwind CSS + React Three Fiber + Three.js Line

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/data/spacecraft.ts` | 航天器数据：Voyager1/2, Juno, New Horizons的轨道、任务故事、成就 |
| `src/components/Spacecraft.tsx` | 3D航天器轨迹渲染：轨迹线、当前位置、任务标记 |
| `src/components/SpacecraftPanel.tsx` | 航天器信息面板：任务故事、关键节点、科学发现 |
| `src/components/InstrumentsPanel.tsx` | 虚拟科学仪器：光谱仪、雷达测距仪、引力透镜 |
| `src/components/HohmannDesigner.tsx` | 霍曼转移轨道设计器：2D SVG交互式轨道计算 |
| `src/components/EclipseLab.tsx` | 月食实验：3参数滑块+实时阴影渲染 |
| `src/store/useStore.ts` | 扩展：航天器/仪器/建造/实验状态 |
| `src/components/Controls.tsx` | 添加科学工具入口按钮 |

---

## Task 1: 航天器系统（意见 #5）

**Files:**
- Create: `src/data/spacecraft.ts`
- Create: `src/components/Spacecraft.tsx`
- Create: `src/components/SpacecraftPanel.tsx`
- Modify: `src/store/useStore.ts`
- Modify: `src/components/Controls.tsx`
- Modify: `src/App.tsx`

### 1.1 `src/data/spacecraft.ts`

```typescript
export interface Spacecraft {
  id: string;
  name: string;
  nameZh: string;
  launchDate: string;
  missionType: string;
  description: string;
  trajectory: { date: string; bodyId: string; event: string; angle: number; distanceAU: number }[];
  keyDiscoveries: string[];
  status: 'active' | 'inactive';
  color: string;
}

export const spacecraftData: Spacecraft[] = [
  {
    id: 'voyager1',
    name: 'Voyager 1',
    nameZh: '旅行者1号',
    launchDate: '1977-09-05',
    missionType: '外行星探测',
    description: '旅行者1号是人类飞得最远的航天器。1977年发射，先后探访了木星和土星，然后利用引力弹弓加速向外太阳系飞行。2012年，它成为第一个进入星际空间的人造物体。',
    trajectory: [
      { date: '1977-09-05', bodyId: 'earth', event: '从地球发射', angle: 0, distanceAU: 1 },
      { date: '1979-03-05', bodyId: 'jupiter', event: '近距离飞掠木星', angle: 45, distanceAU: 5.2 },
      { date: '1980-11-12', bodyId: 'saturn', event: '近距离飞掠土星', angle: 90, distanceAU: 9.6 },
      { date: '1990-02-14', bodyId: 'none', event: '拍摄"暗淡蓝点"照片', angle: 120, distanceAU: 40 },
      { date: '2012-08-25', bodyId: 'none', event: '进入星际空间', angle: 150, distanceAU: 121 },
    ],
    keyDiscoveries: ['木星大红斑的详细结构', '土卫六浓厚的大气层', '土星环的复杂结构', '太阳系边缘的宇宙射线'],
    status: 'active',
    color: '#FFD700',
  },
  {
    id: 'voyager2',
    name: 'Voyager 2',
    nameZh: '旅行者2号',
    launchDate: '1977-08-20',
    missionType: '外行星探测（大满贯）',
    description: '旅行者2号是唯一能访问所有四颗巨行星的航天器。它先后探访了木星、土星、天王星和海王星，是人类探索外太阳系的先驱。',
    trajectory: [
      { date: '1977-08-20', bodyId: 'earth', event: '从地球发射', angle: 180, distanceAU: 1 },
      { date: '1979-07-09', bodyId: 'jupiter', event: '飞掠木星', angle: 200, distanceAU: 5.2 },
      { date: '1981-08-25', bodyId: 'saturn', event: '飞掠土星', angle: 230, distanceAU: 9.6 },
      { date: '1986-01-24', bodyId: 'uranus', event: '首次探访天王星', angle: 260, distanceAU: 19.2 },
      { date: '1989-08-25', bodyId: 'neptune', event: '首次探访海王星', angle: 290, distanceAU: 30.1 },
      { date: '2018-11-05', bodyId: 'none', event: '进入星际空间', angle: 310, distanceAU: 119 },
    ],
    keyDiscoveries: ['木星Io火山的首次详细观测', '土卫二Enceladus的活跃喷泉', '天王星的10颗新卫星', '海王星的大暗斑和复杂环系'],
    status: 'active',
    color: '#4ECDC4',
  },
  {
    id: 'juno',
    name: 'Juno',
    nameZh: '朱诺号',
    launchDate: '2011-08-05',
    missionType: '木星轨道探测器',
    description: '朱诺号是第一个使用太阳能到达木星的航天器。它在木星极轨道上运行，研究木星的引力场、磁场和大气成分，试图揭开木星内部的秘密。',
    trajectory: [
      { date: '2011-08-05', bodyId: 'earth', event: '从地球发射', angle: 60, distanceAU: 1 },
      { date: '2013-10-09', bodyId: 'earth', event: '利用地球引力弹弓', angle: 75, distanceAU: 1 },
      { date: '2016-07-04', bodyId: 'jupiter', event: '进入木星轨道', angle: 95, distanceAU: 5.2 },
    ],
    keyDiscoveries: ['木星极光的能量来源', '木星大气深层的水含量', '木星磁场的非偶极结构', '大红斑的深度超过300公里'],
    status: 'active',
    color: '#E74C3C',
  },
  {
    id: 'new-horizons',
    name: 'New Horizons',
    nameZh: '新视野号',
    launchDate: '2006-01-19',
    missionType: '冥王星/柯伊伯带探测',
    description: '新视野号是有史以来发射速度最快的人造物体。它飞掠了冥王星，拍摄了第一张清晰的冥王星表面照片，然后继续飞向柯伊伯带，探访了天涯海角（Arrokoth）。',
    trajectory: [
      { date: '2006-01-19', bodyId: 'earth', event: '从地球发射', angle: 300, distanceAU: 1 },
      { date: '2007-02-28', bodyId: 'jupiter', event: '木星引力弹弓加速', angle: 320, distanceAU: 5.2 },
      { date: '2015-07-14', bodyId: 'pluto', event: '首次飞掠冥王星', angle: 340, distanceAU: 39.5 },
      { date: '2019-01-01', bodyId: 'none', event: '飞掠Arrokoth小行星', angle: 355, distanceAU: 44 },
    ],
    keyDiscoveries: ['冥王星表面的心形平原（斯普尼克平原）', '冥王星的蓝色大气层', '冥卫一卡戎的巨大峡谷', '柯伊伯带天体Arrokoth的"雪人"形状'],
    status: 'active',
    color: '#9B59B6',
  },
];
```

### 1.2 `src/components/Spacecraft.tsx`

3D场景中渲染航天器轨迹线。

- 使用 Three.js `Line` 或 `@react-three/drei` `Line` 组件
- 每条轨迹用不同颜色（ spacecraft.color ）
- 轨迹点基于 angle + distanceAU 计算位置
- 在轨迹节点处放置小标记（小球体）
- 标记可点击，点击后打开 SpacecraftPanel
- 轨迹线有透明度，不遮挡行星

```typescript
import { Line } from '@react-three/drei';
import { useRef, useState } from 'react';
import { useStore } from '../store/useStore';
import { spacecraftData } from '../data/spacecraft';

export default function Spacecraft() {
  const { setShowSpacecraftPanel, setSelectedSpacecraft } = useStore();

  return (
    <group>
      {spacecraftData.map((sc) => (
        <SpacecraftTrajectory
          key={sc.id}
          spacecraft={sc}
          onClick={() => {
            setSelectedSpacecraft(sc.id);
            setShowSpacecraftPanel(true);
          }}
        />
      ))}
    </group>
  );
}

function SpacecraftTrajectory({ spacecraft, onClick }: { spacecraft: typeof spacecraftData[0]; onClick: () => void }) {
  const points = spacecraft.trajectory.map((tp) => {
    const angle = (tp.angle * Math.PI) / 180;
    const dist = tp.distanceAU * 15; // scale for visibility
    return [Math.cos(angle) * dist, 0.5, Math.sin(angle) * dist] as [number, number, number];
  });

  return (
    <group>
      <Line
        points={points}
        color={spacecraft.color}
        lineWidth={1}
        transparent
        opacity={0.6}
      />
      {spacecraft.trajectory.map((tp, i) => {
        const angle = (tp.angle * Math.PI) / 180;
        const dist = tp.distanceAU * 15;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * dist, 0.5, Math.sin(angle) * dist]}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
          >
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshBasicMaterial color={spacecraft.color} />
          </mesh>
        );
      })}
    </group>
  );
}
```

### 1.3 `src/components/SpacecraftPanel.tsx`

航天器信息面板（类似 InfoPanel）。

- 显示航天器名称、发射日期、任务类型
- 任务故事时间线（垂直时间线）
- 关键发现列表（带✓图标）
- 当前状态（活跃/退役）
- 轨迹在3D场景中的简要说明

### 1.4 Store 扩展

```typescript
showSpacecraftPanel: boolean;
setShowSpacecraftPanel: (show: boolean) => void;
selectedSpacecraft: string | null;
setSelectedSpacecraft: (id: string | null) => void;
```

---

## Task 2: 虚拟科学仪器（意见 #13）

**Files:**
- Create: `src/components/InstrumentsPanel.tsx`
- Modify: `src/components/InfoPanel.tsx`
- Modify: `src/store/useStore.ts`

### 2.1 `src/components/InstrumentsPanel.tsx`

在 InfoPanel 中添加"科学仪器"标签页。

三个虚拟仪器：

**光谱仪 (Spectrometer):**
- 显示行星大气的吸收光谱图（SVG条形图）
- 不同行星有不同的元素特征（H、He、CH4、NH3、H2O等）
- 教育说明："科学家通过分析星光穿过大气层时的吸收线，知道行星大气里有什么"

**雷达测距仪 (Radar Rangefinder):**
- 点击按钮"发射雷达信号"
- 动画：信号从地球到行星再返回
- 显示距离（AU和km）
- 教育说明："雷达信号以光速飞行，通过测量往返时间计算距离"

**引力透镜模拟器 (Gravity Lens Simulator):**
- 2D SVG：一个恒星（太阳）和背景中的遥远恒星
- 滑块：改变背景恒星的位置
- 显示光线如何被太阳引力弯曲
- 教育说明："爱因斯坦预言大质量天体可以弯曲光线。1919年日全食时，爱丁顿验证了这一预言"

### 2.2 InfoPanel 改造

在 InfoPanel 的知识区域上方添加仪器标签切换：
```
[知识探索] [科学仪器]
```

点击"科学仪器"显示 InstrumentsPanel。

---

## Task 3: 霍曼转移轨道设计器（意见 #14）

**Files:**
- Create: `src/components/HohmannDesigner.tsx`
- Modify: `src/components/Controls.tsx`
- Modify: `src/store/useStore.ts`

### 3.1 `src/components/HohmannDesigner.tsx`

2D SVG交互式霍曼转移轨道设计器。

- 中心：太阳
- 内圈：地球轨道（1 AU）
- 外圈：目标行星轨道（可变）
- 转移轨道：一个与两个圆相切的椭圆
- 控制：
  - 下拉选择目标行星（火星、木星、土星等）
  - 自动计算：转移时间、所需速度变化（Δv）
  - 显示发射窗口（每隔多久有一次机会）
- 教育说明：
  - "霍曼转移是最省燃料的轨道转移方式"
  - "需要一个椭圆形轨道，近日点在地球轨道，远日点在目标轨道"
  - "去火星大约需要259天"

---

## Task 4: 月食实验（意见 #15）

**Files:**
- Create: `src/components/EclipseLab.tsx`
- Modify: `src/components/Controls.tsx`
- Modify: `src/store/useStore.ts`

### 4.1 `src/components/EclipseLab.tsx`

月食参数实验面板。

- 3个滑块：
  1. 地球-太阳距离（0.9-1.1 AU）
  2. 月球轨道倾角（0-10°）
  3. 月球大小（0.5-2.0x）
- 实时计算：
  - 本影锥是否覆盖月球
  - 月食类型（无/半影/偏食/全食）
  - 用CSS绘制简化的阴影锥示意图
- 教育说明：
  - "调节参数，发现什么条件下会发生月全食？"
  - "如果月球轨道倾角太大，阴影会错过月球"

---

## Task 5: Controls 添加入口 + App 注册

在 Controls 底部按钮组添加：
- 🛰️ 航天器
- 🔬 月食实验

在 App.tsx 注册：
- Spacecraft
- SpacecraftPanel
- EclipseLab
- HohmannDesigner

---

## 构建验证

Run `npm run build`, zero TypeScript errors.
