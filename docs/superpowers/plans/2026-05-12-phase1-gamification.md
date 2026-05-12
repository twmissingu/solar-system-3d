# Phase 1: 游戏化教育核心系统 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 将现有"天文百科"转化为"任务驱动+成就系统+分层知识+追问链"的游戏化教育体验，解决 educator 提出的 #2/#6/#7/#12 四条核心缺陷。

**Architecture:** 以 Zustand store 为中心，新增 achievements/missions 状态层；UI 层新增 MissionPanel（替代 QuizPanel 入口）+ AchievementPanel/AchievementToast + KnowledgeExplorer（追问链）；数据层新增 achievements.ts + missions.ts + 重写 knowledge.ts 为三级结构。所有新组件复用现有 sci-panel/sci-button Tailwind 样式系统。

**Tech Stack:** React 18 + TypeScript + Vite 5 + Zustand + Framer Motion + Tailwind CSS（现有 stack，零新增依赖）

---

## File Structure

| File | Responsibility |
|------|---------------|
| `src/data/achievements.ts` | 成就徽章定义：id、名称、描述、解锁条件、图标、稀有度 |
| `src/data/missions.ts` | 任务定义：id、类型、标题、描述、目标条件、奖励成就、知识点 |
| `src/data/knowledge.ts` | 重写为三级知识+追问链结构（ bronze/silver/gold + followUp ） |
| `src/store/useStore.ts` | 扩展：成就解锁列表、活跃任务、任务进度、成就通知队列 |
| `src/components/AchievementToast.tsx` | 右下角弹出式成就解锁通知（自动消失） |
| `src/components/AchievementPanel.tsx` | 成就墙面板：已解锁/未解锁徽章网格展示 |
| `src/components/MissionPanel.tsx` | 任务中心：任务列表、当前任务详情、进度追踪、完成反馈 |
| `src/components/KnowledgeExplorer.tsx` | 追问链组件：信息卡片 + 可点击"为什么？"展开链式问答 |
| `src/components/InfoPanel.tsx` | 改造：接入 KnowledgeExplorer，添加三级标签切换 |
| `src/components/Controls.tsx` | 改造：Quiz 入口替换为 Mission 入口，新增 Achievement 入口 |
| `src/App.tsx` | 注册新组件：AchievementToast、AchievementPanel、MissionPanel |
| `src/components/Planet.tsx` | 改造：点击行星时触发成就/任务进度检查 |

---

## Task 1: 成就系统基础设施

**Files:**
- Create: `src/data/achievements.ts`
- Create: `src/components/AchievementToast.tsx`
- Create: `src/components/AchievementPanel.tsx`
- Modify: `src/store/useStore.ts`

### 数据设计

```typescript
// src/data/achievements.ts
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji or lucide icon name
  rarity: Rarity;
  condition: AchievementCondition;
}

export type AchievementCondition =
  | { type: 'explore'; bodyId: string }
  | { type: 'explore_all'; bodyIds: string[] }
  | { type: 'mission_complete'; count: number }
  | { type: 'knowledge_unlock'; level: 'bronze' | 'silver' | 'gold'; count: number }
  | { type: 'time_travel'; days: number }
  | { type: 'eclipse_witness' };

export const achievements: Achievement[] = [
  { id: 'first_step', name: '第一步', description: '点击任意行星开始探索', icon: '🚀', rarity: 'common', condition: { type: 'explore', bodyId: '*' } },
  { id: 'mars_pioneer', name: '火星先驱', description: '成功着陆火星', icon: '🔴', rarity: 'common', condition: { type: 'explore', bodyId: 'mars' } },
  { id: 'saturn_rings', name: '光环探秘者', description: '近距离观察土星光环', icon: '🪐', rarity: 'common', condition: { type: 'explore', bodyId: 'saturn' } },
  { id: 'satellite_hunter', name: '卫星猎人', description: '观察过至少3颗卫星', icon: '🌙', rarity: 'rare', condition: { type: 'explore_all', bodyIds: ['moon', 'io', 'europa', 'ganymede', 'callisto', 'titan', 'enceladus', 'titania', 'triton', 'phobos', 'deimos'] } },
  { id: 'outer_reaches', name: '外域探索者', description: '访问过海王星或更远的天体', icon: '🔵', rarity: 'rare', condition: { type: 'explore_all', bodyIds: ['neptune', 'pluto', 'eris', 'haumea', 'makemake'] } },
  { id: 'mission_rookie', name: '任务新手', description: '完成3个探索任务', icon: '📋', rarity: 'common', condition: { type: 'mission_complete', count: 3 } },
  { id: 'mission_expert', name: '任务专家', description: '完成10个探索任务', icon: '🏆', rarity: 'epic', condition: { type: 'mission_complete', count: 10 } },
  { id: 'bronze_scholar', name: '青铜学者', description: '解锁5个青铜级知识点', icon: '🥉', rarity: 'common', condition: { type: 'knowledge_unlock', level: 'bronze', count: 5 } },
  { id: 'silver_scholar', name: '白银学者', description: '解锁5个白银级知识点', icon: '🥈', rarity: 'rare', condition: { type: 'knowledge_unlock', level: 'silver', count: 5 } },
  { id: 'gold_scholar', name: '黄金学者', description: '解锁3个黄金级知识点', icon: '🥇', rarity: 'epic', condition: { type: 'knowledge_unlock', level: 'gold', count: 3 } },
  { id: 'time_traveler', name: '时间旅行者', description: '快进时间超过1000年', icon: '⏳', rarity: 'rare', condition: { type: 'time_travel', days: 365250 } },
  { id: 'eclipse_witness', name: '月食见证者', description: '观看一次月全食演示', icon: '🌑', rarity: 'common', condition: { type: 'eclipse_witness' } },
  { id: 'solar_system_master', name: '太阳系大师', description: '探索过所有八大行星', icon: '👑', rarity: 'legendary', condition: { type: 'explore_all', bodyIds: ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'] } },
];

export function getAchievementById(id: string): Achievement | undefined {
  return achievements.find((a) => a.id === id);
}

export function getRarityColor(rarity: Rarity): string {
  switch (rarity) {
    case 'common': return '#A0A0A0';
    case 'rare': return '#4ECDC4';
    case 'epic': return '#9B59B6';
    case 'legendary': return '#F1C40F';
  }
}

export function getRarityLabel(rarity: Rarity): string {
  switch (rarity) {
    case 'common': return '普通';
    case 'rare': return '稀有';
    case 'epic': return '史诗';
    case 'legendary': return '传说';
  }
}
```

### Store 扩展

在 `src/store/useStore.ts` 中添加：

```typescript
interface AppState {
  // ... existing fields ...

  // 成就系统
  unlockedAchievements: string[];
  unlockAchievement: (id: string) => void;

  // 成就通知队列
  achievementQueue: string[];
  dequeueAchievement: () => void;

  // 显示成就面板
  showAchievementPanel: boolean;
  setShowAchievementPanel: (show: boolean) => void;

  // 探索历史（用于成就检查）
  exploredBodies: string[];
  addExploredBody: (bodyId: string) => void;

  // 任务完成计数
  completedMissionCount: number;
  incrementMissionCount: () => void;

  // 知识解锁计数
  unlockedKnowledgeCount: { bronze: number; silver: number; gold: number };
  incrementKnowledgeCount: (level: 'bronze' | 'silver' | 'gold') => void;

  // 时间快进累计
  totalTimeAdvanced: number;
  addTimeAdvanced: (days: number) => void;
}
```

在 store 初始化中添加：

```typescript
export const useStore = create<AppState>((set) => ({
  // ... existing ...

  unlockedAchievements: [],
  unlockAchievement: (id) =>
    set((state) => {
      if (state.unlockedAchievements.includes(id)) return {};
      return {
        unlockedAchievements: [...state.unlockedAchievements, id],
        achievementQueue: [...state.achievementQueue, id],
      };
    }),

  achievementQueue: [],
  dequeueAchievement: () =>
    set((state) => ({
      achievementQueue: state.achievementQueue.slice(1),
    })),

  showAchievementPanel: false,
  setShowAchievementPanel: (show) => set({ showAchievementPanel: show }),

  exploredBodies: [],
  addExploredBody: (bodyId) =>
    set((state) => {
      if (state.exploredBodies.includes(bodyId)) return {};
      return { exploredBodies: [...state.exploredBodies, bodyId] };
    }),

  completedMissionCount: 0,
  incrementMissionCount: () =>
    set((state) => ({
      completedMissionCount: state.completedMissionCount + 1,
    })),

  unlockedKnowledgeCount: { bronze: 0, silver: 0, gold: 0 },
  incrementKnowledgeCount: (level) =>
    set((state) => ({
      unlockedKnowledgeCount: {
        ...state.unlockedKnowledgeCount,
        [level]: state.unlockedKnowledgeCount[level] + 1,
      },
    })),

  totalTimeAdvanced: 0,
  addTimeAdvanced: (days) =>
    set((state) => ({
      totalTimeAdvanced: state.totalTimeAdvanced + days,
    })),

  // resetView 也要重置新状态
  resetView: () =>
    set({
      // ... existing resets ...
      // 注意：成就和探索历史是持久化数据，resetView 不应清除
    }),
}));
```

### AchievementToast 组件

```typescript
// src/components/AchievementToast.tsx
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { getAchievementById, getRarityColor, getRarityLabel } from '../data/achievements';

export default function AchievementToast() {
  const { achievementQueue, dequeueAchievement } = useStore();
  const currentId = achievementQueue[0];
  const achievement = currentId ? getAchievementById(currentId) : null;

  useEffect(() => {
    if (!currentId) return;
    const timer = setTimeout(() => {
      dequeueAchievement();
    }, 4000);
    return () => clearTimeout(timer);
  }, [currentId, dequeueAchievement]);

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 right-4 z-50 max-w-xs"
        >
          <div className="sci-panel sci-corner p-4 flex items-center gap-3"
            style={{ borderColor: `${getRarityColor(achievement.rarity)}40` }}
          >
            <div className="text-3xl">{achievement.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-[10px] uppercase tracking-wider font-bold"
                style={{ color: getRarityColor(achievement.rarity) }}
              >
                成就解锁 · {getRarityLabel(achievement.rarity)}
              </p>
              <p className="text-sm font-bold text-sci-white mt-0.5">{achievement.name}</p>
              <p className="text-xs text-sci-white/60 mt-0.5 truncate">{achievement.description}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### AchievementPanel 组件

```typescript
// src/components/AchievementPanel.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { achievements, getRarityColor, getRarityLabel } from '../data/achievements';
import { Lock } from 'lucide-react';

export default function AchievementPanel() {
  const { showAchievementPanel, setShowAchievementPanel, unlockedAchievements } = useStore();
  const unlockedCount = unlockedAchievements.length;
  const totalCount = achievements.length;

  return (
    <AnimatePresence>
      {showAchievementPanel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center"
          style={{ background: 'rgba(5, 11, 20, 0.92)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowAchievementPanel(false); }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="max-w-2xl w-full mx-4"
          >
            <div className="sci-panel sci-corner p-5 sm:p-6 max-h-[80vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-sci-white sci-text-glow" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    探索徽章
                  </h2>
                  <p className="text-xs text-sci-white/50 mt-1">
                    已收集 {unlockedCount} / {totalCount}
                  </p>
                </div>
                <button
                  onClick={() => setShowAchievementPanel(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-sci-white/50 hover:text-sci-cyan hover:bg-sci-cyan/10 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 1l12 12M13 1L1 13" />
                  </svg>
                </button>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-space-700 rounded-full overflow-hidden mb-5 shrink-0">
                <motion.div
                  className="h-full bg-sci-cyan rounded-full"
                  animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              {/* Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto pr-1">
                {achievements.map((ach) => {
                  const isUnlocked = unlockedAchievements.includes(ach.id);
                  return (
                    <div
                      key={ach.id}
                      className={`rounded-lg p-3 border transition-all ${
                        isUnlocked
                          ? 'bg-space-700/50 border-sci-cyan/20'
                          : 'bg-space-900/30 border-sci-white/5 opacity-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-2xl ${isUnlocked ? '' : 'grayscale'}`}>{ach.icon}</span>
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                          style={{
                            background: `${getRarityColor(ach.rarity)}20`,
                            color: getRarityColor(ach.rarity),
                          }}
                        >
                          {getRarityLabel(ach.rarity)}
                        </span>
                      </div>
                      <p className={`text-sm font-bold ${isUnlocked ? 'text-sci-white' : 'text-sci-white/40'}`}>
                        {isUnlocked ? ach.name : '???'}
                      </p>
                      <p className="text-xs text-sci-white/50 mt-1">
                        {isUnlocked ? ach.description : <Lock className="w-3 h-3 inline" />}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

---

## Task 2: 任务驱动系统（替代 Quiz）

**Files:**
- Create: `src/data/missions.ts`
- Create: `src/components/MissionPanel.tsx`
- Modify: `src/store/useStore.ts`
- Modify: `src/components/Controls.tsx`（Quiz入口替换为Mission入口）

### 数据设计

```typescript
// src/data/missions.ts
export type MissionType = 'explore' | 'identify' | 'compare' | 'observe';

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  // 任务目标
  target: {
    bodyId?: string;
    bodyIds?: string[];
    attribute?: string;
    attributeValue?: number;
    minValue?: number;
  };
  // 任务提示（最多3条，逐步给出）
  hints: string[];
  // 奖励
  rewardAchievementId?: string;
  // 关联知识点（完成后展示）
  knowledgeId: string;
  // 难度
  difficulty: 1 | 2 | 3; // 1=青铜, 2=白银, 3=黄金
}

export const missions: Mission[] = [
  {
    id: 'm1',
    type: 'explore',
    title: '火星登陆计划',
    description: '作为太阳系探索员，你的第一个任务是前往火星。点击火星，观察它的颜色和两颗卫星。',
    target: { bodyId: 'mars' },
    hints: ['火星是红色的行星', '它位于地球轨道外侧', '找一找那颗红色的行星'],
    rewardAchievementId: 'mars_pioneer',
    knowledgeId: 'mars_exploration',
    difficulty: 1,
  },
  {
    id: 'm2',
    type: 'identify',
    title: '寻找风暴之王',
    description: '有一颗行星的表面有一个持续了350多年的巨大风暴。找到它！',
    target: { bodyId: 'jupiter' },
    hints: ['这颗行星是太阳系最大的', '它的表面有个大红斑', '它有很多卫星'],
    rewardAchievementId: undefined,
    knowledgeId: 'jupiter-red-spot',
    difficulty: 1,
  },
  {
    id: 'm3',
    type: 'explore',
    title: '光环探秘',
    description: '前往拥有最美丽光环的行星，近距离观察它的光环系统。',
    target: { bodyId: 'saturn' },
    hints: ['这颗行星的环非常著名', '它是气态巨行星', '它位于木星之外'],
    rewardAchievementId: 'saturn_rings',
    knowledgeId: 'saturn-rings',
    difficulty: 1,
  },
  {
    id: 'm4',
    type: 'identify',
    title: '太阳系边缘',
    description: '找到太阳系最远的巨行星。它拥有最强烈的风暴。',
    target: { bodyId: 'neptune' },
    hints: ['它是最远的巨行星', '它的颜色是深蓝色', '风速可达2100公里/小时'],
    knowledgeId: 'neptune',
    difficulty: 2,
  },
  {
    id: 'm5',
    type: 'compare',
    title: '温度挑战',
    description: '找出太阳系中表面温度最高的行星和最冷的行星。',
    target: { bodyIds: ['venus', 'neptune'] },
    hints: ['高温行星有极强的温室效应', '最冷的行星离太阳最远'],
    knowledgeId: 'temperature_comparison',
    difficulty: 2,
  },
  {
    id: 'm6',
    type: 'observe',
    title: '月全食见证者',
    description: '观看一次月全食演示，观察地球阴影如何覆盖月球。',
    target: { bodyId: 'moon' },
    hints: ['点击控制栏的月全食演示按钮', '观察月球如何变成暗红色'],
    rewardAchievementId: 'eclipse_witness',
    knowledgeId: 'lunar-eclipse',
    difficulty: 1,
  },
  {
    id: 'm7',
    type: 'explore',
    title: '卫星大搜索',
    description: '找到至少3颗不同的卫星并观察它们。',
    target: { bodyIds: ['moon', 'io', 'europa', 'ganymede', 'callisto', 'titan', 'enceladus', 'titania', 'triton', 'phobos', 'deimos'], count: 3 },
    hints: ['地球有一颗卫星叫月球', '木星有很多卫星', '土星也有卫星'],
    rewardAchievementId: 'satellite_hunter',
    knowledgeId: 'satellites',
    difficulty: 2,
  },
  {
    id: 'm8',
    type: 'identify',
    title: '躺着的行星',
    description: '有一颗行星几乎是"横躺"着自转的，找到它！',
    target: { bodyId: 'uranus' },
    hints: ['它的自转轴倾角接近98度', '它是冰巨星', '它位于土星之外'],
    knowledgeId: 'uranus',
    difficulty: 2,
  },
  {
    id: 'm9',
    type: 'explore',
    title: '外域之旅',
    description: '访问一颗位于海王星轨道之外的天体。',
    target: { bodyIds: ['pluto', 'eris', 'haumea', 'makemake'] },
    hints: ['冥王星曾经是第九大行星', '柯伊伯带有很多矮行星'],
    rewardAchievementId: 'outer_reaches',
    knowledgeId: 'pluto',
    difficulty: 3,
  },
  {
    id: 'm10',
    type: 'identify',
    title: '最热的行星',
    description: '很多人以为是水星，但另一颗行星因为温室效应更热。找到它！',
    target: { bodyId: 'venus' },
    hints: ['它有极厚的大气层', '表面温度462°C', '它被称为地球的"姐妹星"'],
    knowledgeId: 'venus',
    difficulty: 3,
  },
];

export function getMissionById(id: string): Mission | undefined {
  return missions.find((m) => m.id === id);
}

export function getMissionsByDifficulty(difficulty: number): Mission[] {
  return missions.filter((m) => m.difficulty === difficulty);
}
```

### Store 扩展

```typescript
// 添加到 AppState
interface AppState {
  // ... existing + Task1 additions ...

  // 任务系统
  activeMissionId: string | null;
  setActiveMissionId: (id: string | null) => void;

  missionProgress: {
    exploredBodiesInMission: string[];
    compareBodies: string[];
    observedEvents: string[];
  };
  resetMissionProgress: () => void;
  addMissionExploredBody: (bodyId: string) => void;
  addMissionCompareBody: (bodyId: string) => void;
  addMissionObservedEvent: (eventId: string) => void;

  completedMissions: string[];
  completeMission: (id: string) => void;

  showMissionPanel: boolean;
  setShowMissionPanel: (show: boolean) => void;

  // 当前任务提示索引
  currentHintIndex: number;
  nextHint: () => void;
}

// Store 初始化
activeMissionId: null,
setActiveMissionId: (id) => set({ activeMissionId: id, missionProgress: { exploredBodiesInMission: [], compareBodies: [], observedEvents: [] }, currentHintIndex: 0 }),

missionProgress: { exploredBodiesInMission: [], compareBodies: [], observedEvents: [] },
resetMissionProgress: () => set({ missionProgress: { exploredBodiesInMission: [], compareBodies: [], observedEvents: [] }, currentHintIndex: 0 }),
addMissionExploredBody: (bodyId) =>
  set((state) => ({
    missionProgress: {
      ...state.missionProgress,
      exploredBodiesInMission: state.missionProgress.exploredBodiesInMission.includes(bodyId)
        ? state.missionProgress.exploredBodiesInMission
        : [...state.missionProgress.exploredBodiesInMission, bodyId],
    },
  })),
addMissionCompareBody: (bodyId) =>
  set((state) => ({
    missionProgress: {
      ...state.missionProgress,
      compareBodies: state.missionProgress.compareBodies.includes(bodyId)
        ? state.missionProgress.compareBodies
        : [...state.missionProgress.compareBodies, bodyId],
    },
  })),
addMissionObservedEvent: (eventId) =>
  set((state) => ({
    missionProgress: {
      ...state.missionProgress,
      observedEvents: state.missionProgress.observedEvents.includes(eventId)
        ? state.missionProgress.observedEvents
        : [...state.missionProgress.observedEvents, eventId],
    },
  })),

completedMissions: [],
completeMission: (id) =>
  set((state) => {
    if (state.completedMissions.includes(id)) return {};
    return {
      completedMissions: [...state.completedMissions, id],
      completedMissionCount: state.completedMissionCount + 1,
    };
  }),

showMissionPanel: false,
setShowMissionPanel: (show) => set({ showMissionPanel: show }),

currentHintIndex: 0,
nextHint: () => set((state) => ({ currentHintIndex: state.currentHintIndex + 1 })),
```

### MissionPanel 组件

```typescript
// src/components/MissionPanel.tsx
import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { missions, getMissionById } from '../data/missions';
import { getAchievementById } from '../data/achievements';
import { ChevronRight, Compass, Eye, Target, GitCompare, Lightbulb, CheckCircle, Lock } from 'lucide-react';

const typeIcons = { explore: Compass, identify: Target, compare: GitCompare, observe: Eye };
const difficultyLabels = { 1: '青铜', 2: '白银', 3: '黄金' };
const difficultyColors = { 1: '#CD7F32', 2: '#C0C0C0', 3: '#FFD700' };

export default function MissionPanel() {
  const {
    showMissionPanel,
    setShowMissionPanel,
    activeMissionId,
    setActiveMissionId,
    completedMissions,
    missionProgress,
    currentHintIndex,
    nextHint,
    completeMission,
    unlockAchievement,
    incrementMissionCount,
  } = useStore();

  const [tab, setTab] = useState<'available' | 'active' | 'completed'>('available');

  const activeMission = activeMissionId ? getMissionById(activeMissionId) : null;

  const availableMissions = useMemo(
    () => missions.filter((m) => !completedMissions.includes(m.id) && m.id !== activeMissionId),
    [completedMissions, activeMissionId]
  );
  const completedMissionList = useMemo(
    () => missions.filter((m) => completedMissions.includes(m.id)),
    [completedMissions]
  );

  const checkMissionComplete = useCallback(
    (mission: typeof missions[0]): boolean => {
      if (!mission) return false;
      switch (mission.type) {
        case 'explore':
          if (mission.target.count) {
            return missionProgress.exploredBodiesInMission.length >= mission.target.count;
          }
          return mission.target.bodyId ? missionProgress.exploredBodiesInMission.includes(mission.target.bodyId) : false;
        case 'identify':
          return mission.target.bodyId ? missionProgress.exploredBodiesInMission.includes(mission.target.bodyId) : false;
        case 'compare':
          if (mission.target.bodyIds) {
            return mission.target.bodyIds.every((id) => missionProgress.compareBodies.includes(id));
          }
          return false;
        case 'observe':
          return mission.target.bodyId ? missionProgress.observedEvents.includes(mission.target.bodyId) : false;
        default:
          return false;
      }
    },
    [missionProgress]
  );

  const isCurrentMissionComplete = activeMission ? checkMissionComplete(activeMission) : false;

  const handleAcceptMission = (id: string) => {
    setActiveMissionId(id);
    setTab('active');
  };

  const handleComplete = () => {
    if (!activeMission) return;
    completeMission(activeMission.id);
    if (activeMission.rewardAchievementId) {
      unlockAchievement(activeMission.rewardAchievementId);
    }
    incrementMissionCount();
    setActiveMissionId(null);
    setTab('completed');
  };

  return (
    <AnimatePresence>
      {showMissionPanel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center"
          style={{ background: 'rgba(5, 11, 20, 0.92)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowMissionPanel(false); }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="max-w-xl w-full mx-4"
          >
            <div className="sci-panel sci-corner p-5 sm:p-6 max-h-[80vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 shrink-0">
                <h2 className="text-xl font-bold text-sci-white sci-text-glow" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  🚀 探索任务中心
                </h2>
                <button onClick={() => setShowMissionPanel(false)} className="w-8 h-8 flex items-center justify-center rounded-md text-sci-white/50 hover:text-sci-cyan hover:bg-sci-cyan/10 transition-colors">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 1l12 12M13 1L1 13" /></svg>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-4 shrink-0 bg-space-800/50 rounded-lg p-1">
                {[
                  { key: 'available', label: `可接任务 (${availableMissions.length})` },
                  { key: 'active', label: '进行中' },
                  { key: 'completed', label: `已完成 (${completedMissionList.length})` },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTab(t.key as typeof tab)}
                    className={`flex-1 py-1.5 px-2 rounded-md text-xs font-medium transition-all ${
                      tab === t.key
                        ? 'bg-sci-cyan/20 text-sci-cyan border border-sci-cyan/30'
                        : 'text-sci-white/50 hover:text-sci-white/70'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <AnimatePresence mode="wait">
                  {tab === 'available' && (
                    <motion.div key="available" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
                      {availableMissions.length === 0 ? (
                        <p className="text-center text-sci-white/40 py-8">所有任务已完成！你是最棒的探索员！🌟</p>
                      ) : (
                        availableMissions.map((m) => {
                          const Icon = typeIcons[m.type];
                          return (
                            <div key={m.id} className="bg-space-700/30 rounded-lg p-3 border border-sci-white/5 hover:border-sci-cyan/20 transition-all">
                              <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-lg bg-sci-cyan/10 flex items-center justify-center shrink-0">
                                  <Icon className="w-4 h-4 text-sci-cyan" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="text-sm font-bold text-sci-white">{m.title}</p>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ background: `${difficultyColors[m.difficulty]}20`, color: difficultyColors[m.difficulty] }}>
                                      {difficultyLabels[m.difficulty]}
                                    </span>
                                  </div>
                                  <p className="text-xs text-sci-white/60 leading-relaxed">{m.description}</p>
                                </div>
                                <button onClick={() => handleAcceptMission(m.id)} className="sci-button-primary text-xs px-3 py-1.5 shrink-0">
                                  接受
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </motion.div>
                  )}

                  {tab === 'active' && (
                    <motion.div key="active" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      {!activeMission ? (
                        <div className="text-center py-8">
                          <Compass className="w-12 h-12 text-sci-white/20 mx-auto mb-3" />
                          <p className="text-sci-white/40">当前没有进行中的任务</p>
                          <p className="text-xs text-sci-white/30 mt-1">从"可接任务"中选择一个开始探索吧！</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {/* 任务详情 */}
                          <div className="bg-sci-cyan/5 border border-sci-cyan/20 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                              {(() => {
                                const Icon = typeIcons[activeMission.type];
                                return <Icon className="w-5 h-5 text-sci-cyan" />;
                              })()}
                              <p className="text-lg font-bold text-sci-white">{activeMission.title}</p>
                            </div>
                            <p className="text-sm text-sci-white/70 leading-relaxed mb-3">{activeMission.description}</p>

                            {/* 进度 */}
                            <div className="bg-space-800/50 rounded-lg p-3">
                              <p className="text-xs text-sci-white/50 mb-2">任务进度</p>
                              <MissionProgressDisplay mission={activeMission} progress={missionProgress} />
                            </div>
                          </div>

                          {/* 提示系统 */}
                          <div className="bg-space-700/30 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb className="w-4 h-4 text-sci-gold" />
                              <p className="text-xs font-bold text-sci-gold">探索提示</p>
                            </div>
                            {currentHintIndex < activeMission.hints.length ? (
                              <>
                                <p className="text-sm text-sci-white/70">{activeMission.hints[currentHintIndex]}</p>
                                {currentHintIndex < activeMission.hints.length - 1 && (
                                  <button onClick={nextHint} className="text-xs text-sci-cyan/70 hover:text-sci-cyan mt-2 flex items-center gap-1">
                                    还需要更多提示？ <ChevronRight className="w-3 h-3" />
                                  </button>
                                )}
                              </>
                            ) : (
                              <p className="text-xs text-sci-white/40">已显示所有提示</p>
                            )}
                          </div>

                          {/* 完成按钮 */}
                          {isCurrentMissionComplete && (
                            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                              <button onClick={handleComplete} className="sci-button-primary px-6 py-2.5 text-base">
                                <CheckCircle className="w-4 h-4 inline mr-2" />
                                完成任务
                              </button>
                              {activeMission.rewardAchievementId && (
                                <p className="text-xs text-sci-gold mt-2">
                                  奖励：{getAchievementById(activeMission.rewardAchievementId)?.name} 徽章
                                </p>
                              )}
                            </motion.div>
                          )}

                          {/* 放弃任务 */}
                          <button onClick={() => setActiveMissionId(null)} className="text-xs text-sci-white/30 hover:text-sci-white/50 w-full text-center py-2">
                            放弃当前任务
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {tab === 'completed' && (
                    <motion.div key="completed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
                      {completedMissionList.length === 0 ? (
                        <p className="text-center text-sci-white/40 py-8">还没有完成的任务，快去接受一个吧！</p>
                      ) : (
                        completedMissionList.map((m) => {
                          const Icon = typeIcons[m.type];
                          return (
                            <div key={m.id} className="bg-green-500/5 border border-green-500/20 rounded-lg p-3 flex items-center gap-3">
                              <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                              <div className="flex-1">
                                <p className="text-sm font-bold text-sci-white">{m.title}</p>
                                <p className="text-xs text-sci-white/50">{difficultyLabels[m.difficulty]}难度 · {m.type === 'explore' ? '探索' : m.type === 'identify' ? '识别' : m.type === 'compare' ? '比较' : '观察'}</p>
                              </div>
                              <Icon className="w-4 h-4 text-green-400/50" />
                            </div>
                          );
                        })
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MissionProgressDisplay({ mission, progress }: { mission: typeof missions[0]; progress: typeof useStore.getState().missionProgress }) {
  switch (mission.type) {
    case 'explore': {
      const targetIds = mission.target.count ? mission.target.bodyIds || [] : [mission.target.bodyId!];
      const count = mission.target.count || 1;
      const explored = missionProgress.exploredBodiesInMission.filter((id) => targetIds.includes(id)).length;
      return (
        <div>
          <div className="flex justify-between text-xs text-sci-white/60 mb-1">
            <span>已探索 {explored} / {count}</span>
            <span>{Math.round((explored / count) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-space-700 rounded-full overflow-hidden">
            <motion.div className="h-full bg-sci-cyan rounded-full" animate={{ width: `${(explored / count) * 100}%` }} />
          </div>
        </div>
      );
    }
    case 'identify': {
      const found = mission.target.bodyId ? progress.exploredBodiesInMission.includes(mission.target.bodyId) : false;
      return (
        <div className={`text-sm ${found ? 'text-green-400' : 'text-sci-white/50'}`}>
          {found ? '✓ 已找到目标天体' : '○ 寻找目标天体中...'}
        </div>
      );
    }
    case 'compare': {
      const targets = mission.target.bodyIds || [];
      return (
        <div className="space-y-1">
          {targets.map((id) => (
            <div key={id} className={`flex items-center gap-2 text-xs ${progress.compareBodies.includes(id) ? 'text-green-400' : 'text-sci-white/50'}`}>
              {progress.compareBodies.includes(id) ? <CheckCircle className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              <span>已观察 {id}</span>
            </div>
          ))}
        </div>
      );
    }
    case 'observe': {
      const observed = mission.target.bodyId ? progress.observedEvents.includes(mission.target.bodyId) : false;
      return (
        <div className={`text-sm ${observed ? 'text-green-400' : 'text-sci-white/50'}`}>
          {observed ? '✓ 已观察目标事件' : '○ 等待观察目标事件...'}
        </div>
      );
    }
    default:
      return null;
  }
}
```

---

## Task 3: 三级知识 + 追问链

**Files:**
- Create: `src/data/knowledgeV2.ts`（保留旧文件兼容，实际使用新文件）
- Create: `src/components/KnowledgeExplorer.tsx`
- Modify: `src/components/InfoPanel.tsx`
- Modify: `src/store/useStore.ts`

### 数据设计

```typescript
// src/data/knowledgeV2.ts
export type KnowledgeLevel = 'bronze' | 'silver' | 'gold';

export interface FollowUpItem {
  id: string;
  question: string;
  answer: string;
  nextId: string | null;
}

export interface KnowledgeLevelData {
  title: string;
  content: string;
  funFact: string;
  // 解锁条件：null = 默认解锁，需要成就ID = 需要解锁该成就
  unlockRequirement: string | null;
}

export interface KnowledgeItemV2 {
  id: string;
  targetBody: string | null;
  levels: Record<KnowledgeLevel, KnowledgeLevelData>;
  followUpChain: FollowUpItem[];
}

export const knowledgeDataV2: KnowledgeItemV2[] = [
  {
    id: 'seasons',
    targetBody: 'Earth',
    levels: {
      bronze: {
        title: '地球为什么会有四季？',
        content: '地球在绕太阳公转时，身体有一点"歪"——地轴倾斜了大约23.5度。当北半球歪向太阳时，阳光更集中、更暖和，就是夏天；歪向远离太阳的方向时，就是冬天。',
        funFact: '你知道吗？水星没有四季，因为它的身体几乎没有倾斜！',
        unlockRequirement: null,
      },
      silver: {
        title: '四季形成的深层机制',
        content: '地轴倾斜23.5°导致太阳直射点在南北回归线之间移动。夏至时直射北回归线（23.5°N），冬至时直射南回归线（23.5°S）。春分和秋分时直射赤道。直射角度决定了单位面积接收到的太阳辐射量，这是季节变化的根本原因。',
        funFact: '火星的自转轴倾斜25.2°，也有四季，但每个季节约是地球的两倍长！',
        unlockRequirement: 'bronze_scholar',
      },
      gold: {
        title: '米兰科维奇循环与长期气候',
        content: '地球轨道的偏心率、地轴倾角和岁差（进动）共同构成米兰科维奇循环，周期分别为10万年、4.1万年和2.6万年。这些轨道参数的变化影响了地球接收到的太阳辐射分布，是冰期-间冰期循环的主要驱动因素。当前我们处于间冰期，地轴倾角正在减小。',
        funFact: '约1.2万年后，北极星将不再是现在的勾陈一，而是织女星！',
        unlockRequirement: 'silver_scholar',
      },
    },
    followUpChain: [
      { id: 'why-tilt', question: '为什么地轴会倾斜？', answer: '科学家认为，在地球形成早期，一颗名为"忒伊亚"的行星撞击了地球。这次巨大的碰撞不仅创造了月球，还让地球的自转轴倾斜了约23.5度。', nextId: 'theia' },
      { id: 'theia', question: '忒伊亚现在在哪里？', answer: '忒伊亚的大部分物质与地球融合，剩余碎片在轨道聚集形成了月球。这就是为什么月球的成分和地球地幔非常相似。', nextId: 'moon-formation' },
      { id: 'moon-formation', question: '月球对地球有什么影响？', answer: '月球引力稳定了地球的自转轴倾角，如果没有月球，地轴倾斜可能在0°到85°之间大幅摆动，气候将变得极端不稳定，生命可能难以演化。', nextId: null },
    ],
  },
  {
    id: 'moon-phases',
    targetBody: 'Moon',
    levels: {
      bronze: {
        title: '月亮为什么每天看起来不一样？',
        content: '月球自己不会发光，它像一面大镜子反射太阳的光。随着月球绕地球公转，我们看到被太阳照亮的部分不断变化，这就是月相变化！',
        funFact: '你看到的月亮总是同一面！因为月球自转和公转周期相同，这叫"潮汐锁定"。',
        unlockRequirement: null,
      },
      silver: {
        title: '月相的数学规律',
        content: '月相变化周期为朔望月，约29.5天（不是恒星月的27.3天）。新月时月球位于地球和太阳之间，月球的暗面朝向地球；满月时地球位于太阳和月球之间，月球的亮面完全朝向地球。上弦月和下弦月时，月球-地球-太阳形成90°角。',
        funFact: '古人通过观察月相变化发明了阴历，但阴历一年只有354天，比阳历少11天！',
        unlockRequirement: 'bronze_scholar',
      },
      gold: {
        title: '潮汐锁定的物理机制',
        content: '潮汐锁定由潮汐摩擦引起。地球对月球不同部位的引力差异产生潮汐隆起，月球内部的摩擦使自转动能逐渐耗散，直到自转周期与公转周期同步。同样，地球的自转也在被月球潮汐力减慢——每世纪增加约1.7毫秒。约50亿年后，地球也可能被太阳潮汐锁定。',
        funFact: '冥王星和它的卫星卡戎互相潮汐锁定，彼此永远只展示同一面！',
        unlockRequirement: 'silver_scholar',
      },
    },
    followUpChain: [
      { id: 'why-tidal-lock', question: '潮汐锁定是怎么发生的？', answer: '地球引力拉长了月球，使月球变得像一个橄榄球。当月球自转快于公转时，这个"橄榄球"就会倾斜，地球引力就会产生一个扭力，让月球越转越慢，直到永远用同一面朝向地球。', nextId: 'tidal-friction' },
      { id: 'tidal-friction', question: '潮汐摩擦会永远持续吗？', answer: '不会！潮汐摩擦让月球正在以每年约3.8厘米的速度远离地球。当距离足够远时，地球的自转周期会和月球的公转周期同步，两者互相潮汐锁定——那时一天将有约50小时，一个月也将是50天。', nextId: null },
    ],
  },
  {
    id: 'jupiter-red-spot',
    targetBody: 'Jupiter',
    levels: {
      bronze: {
        title: '木星上的"大红斑"是什么？',
        content: '木星的大红斑是一个超级巨大的风暴！它已经吹了至少350年——比你的爷爷的爷爷的爷爷……还要早得多！这个风暴大到可以装下整个地球。',
        funFact: '木星转得特别快，一天只有约10小时！所以大红斑虽然在缩小，但短期内还不会消失。',
        unlockRequirement: null,
      },
      silver: {
        title: '大红斑：一个反气旋风暴的解剖',
        content: '大红斑是一个巨大的反气旋风暴（高压系统），直径约1.6万公里，高度约300公里。它的颜色来自木星大气中的复杂有机分子（可能是磷化氢或含硫化合物），在不同光照条件下颜色会从深红变为橙色。风暴风速可达每小时680公里。科学家通过卡西尼号发现，大红斑正在以每年约930公里的速度缩小。',
        funFact: '木星大气中至少有12个类似的大红斑级别的风暴，但大红斑是最大的！',
        unlockRequirement: 'bronze_scholar',
      },
      gold: {
        title: '大红斑与深层射流的卡西尼关系',
        content: '卡西尼定律描述了流体行星的自转：内部区域以不同速度旋转（差动自转）。大红斑位于木星大气层的"南赤道带"，深度延伸至数百公里以下，与木星内部的对流层密切相关。朱诺号引力测量显示，大红斑深度可能超过300公里，暗示它不仅是表面现象。深层射流的能量输送维持了这个超长寿风暴。',
        funFact: '如果大红斑的能量可以转化为电力，它可以供应全人类用电数千年！',
        unlockRequirement: 'silver_scholar',
      },
    },
    followUpChain: [
      { id: 'why-so-long', question: '为什么能持续350年？', answer: '地球上的风暴几天就消散了，但木星没有固体表面，风暴可以在大气中持续旋转。大红斑通过吸收周围的小风暴获得能量，就像一个"风暴吞噬者"。', nextId: 'jupiter-interior' },
      { id: 'jupiter-interior', question: '木星内部是什么样的？', answer: '木星是一颗气态巨行星，没有固体表面。越往下气压和温度越高，氢气先变成液态金属氢（可以导电），核心可能是岩石和冰的混合物，温度高达24000°C！', nextId: null },
    ],
  },
  {
    id: 'saturn-rings',
    targetBody: 'Saturn',
    levels: {
      bronze: {
        title: '土星为什么戴着漂亮的"项链"？',
        content: '土星的光环其实是由无数块冰块和岩石组成的，它们就像微小的"小月亮"，围绕着土星旋转。这些碎片有的只有沙粒大小，有的像房子一样大！',
        funFact: '土星环虽然宽达28万公里，但厚度只有约1公里！比一张纸还薄得多（相对比例来说）。',
        unlockRequirement: null,
      },
      silver: {
        title: '土星环的结构与动力学',
        content: '土星环主要由水冰（93%）和硅酸盐（7%）组成，温度约-180°C。环分为A、B、C、D、E、F、G七个主要环，由卡西尼缝和恩克缝分隔。环内存在"牧羊卫星"——如普罗米修斯和潘多拉——它们的引力维持着环的边缘锋利。卡西尼号发现环内存在螺旋密度波，类似星系中的旋臂结构。',
        funFact: '土星环的年龄可能只有1-4亿年，比土星本身年轻得多！',
        unlockRequirement: 'bronze_scholar',
      },
      gold: {
        title: '环的起源与行星形成学',
        content: '土星环的起源有两种假说：(1) 被土星潮汐力撕裂的小卫星（洛希极限内）；(2) 原始太阳星盘的残余物未聚合成卫星。卡西尼号"大结局"数据支持第一种假说：环的质量衰减率表明它们不会比1亿年更老。这一发现对行星形成理论有重要意义——它暗示了类似事件在其他行星系统中也可能发生。',
        funFact: '如果地球也有环，夜晚的天空会被环光照亮，季节变化将完全不同！',
        unlockRequirement: 'silver_scholar',
      },
    },
    followUpChain: [
      { id: 'roche-limit', question: '什么是洛希极限？', answer: '洛希极限是一个天体被另一个天体的潮汐力撕裂的临界距离。如果一颗卫星离行星太近，行星对卫星近侧和远侧的引力差异会超过卫星自身的引力，导致它被撕裂成碎片。土星环就位于土星的洛希极限内。', nextId: 'ring-age' },
      { id: 'ring-age', question: '环会永远存在吗？', answer: '不会！卡西尼号发现环中的物质正在以"环雨"的形式落入土星大气，环可能在未来3亿年内完全消失。我们现在可能正处于土星环的"黄金时代"！', nextId: null },
    ],
  },
  {
    id: 'lunar-eclipse',
    targetBody: 'Moon',
    levels: {
      bronze: {
        title: '月食是怎么发生的？',
        content: '月食发生时，地球跑到了太阳和月球中间。太阳的光被地球挡住，地球的影子就投射到了月球上。不过月球不会完全变黑——地球大气层会把一部分阳光弯曲并散射到月球表面，这些光中红色光最多，所以月球常常变成暗红色！',
        funFact: '月食时，如果当时你站在月球上，你会看到地球把太阳完全挡住，周围有一圈红色的光环！',
        unlockRequirement: null,
      },
      silver: {
        title: '月食的分类与几何学',
        content: '月食分为三种：(1) 半影月食——月球仅进入地球半影区，亮度轻微变暗；(2) 月偏食——月球部分进入地球本影区；(3) 月全食——月球完全进入本影区。地球本影的直径约9200公里，月球轨道倾角5.1°意味着并非每个满月都会发生月食。月食只发生在满月且月球位于升交点或降交点附近时（食季）。',
        funFact: '最长月全食可长达1小时47分钟——因为地球本影在月球轨道处的直径约为月球的2.7倍。',
        unlockRequirement: 'bronze_scholar',
      },
      gold: {
        title: '月食在古代天文学中的意义',
        content: '月食是验证天文理论的关键观测。古希腊人通过月食时地球影子的圆形边缘推断地球是球形。古代中国天文学家通过精确记录月食时刻验证历法的准确性——如公元720年僧一行的大衍历就利用月食数据修正了历法误差。月食也是测量月球轨道和地球大气折射率的重要工具：通过测量月食各阶段的精确时间，可以反推月球轨道参数。',
        funFact: '公元前4世纪，阿里斯塔克斯通过月食时地球影子的角度估算地月距离，误差仅约10%！',
        unlockRequirement: 'silver_scholar',
      },
    },
    followUpChain: [
      { id: 'why-red', question: '为什么是红色而不是完全黑？', answer: '地球大气层像一面透镜，把阳光中的红光弯曲到月球表面。蓝光被散射掉了（这就是为什么天空是蓝色的），而红光穿透力更强，所以月球变成了暗红色。火山爆发后大气中尘埃增多，月食可能变得更暗甚至呈黑色。', nextId: 'saros-cycle' },
      { id: 'saros-cycle', question: '月食有规律吗？', answer: '有！沙罗周期约18年11天，之后几乎相同的月食会重复发生。这是因为月球轨道周期、地球公转周期和交点线退行周期在这个时间后重新对齐。古巴比伦人在公元前7世纪就发现了这个周期！', nextId: null },
    ],
  },
  {
    id: 'sun-nuclear',
    targetBody: 'Sun',
    levels: {
      bronze: {
        title: '太阳为什么会发光发热？',
        content: '太阳就像宇宙中的一个超级大锅炉。它的核心温度高达1500万摄氏度，压力大得难以想象。在这种极端条件下，氢原子会发生"核聚变"——4个氢原子合并成1个氦原子，同时释放出巨大的能量！',
        funFact: '太阳已经燃烧了约46亿年，但它还有约50亿年的燃料！你可以放心地晒太阳。',
        unlockRequirement: null,
      },
      silver: {
        title: '核聚变：质子-质子链反应',
        content: '太阳核心通过质子-质子链反应（pp链）进行核聚变：两个质子（氢核）融合形成氘，释放正电子和中微子；氘再与质子融合形成氦-3；两个氦-3融合形成氦-4并释放两个质子。整个过程将0.7%的质量转化为能量（E=mc²）。太阳每秒将400万吨物质转化为能量，但核心燃料足够燃烧约100亿年。',
        funFact: '你看到的阳光诞生于约17万年前——光子在太阳内部要经过无数次随机散射才能到达表面！',
        unlockRequirement: 'bronze_scholar',
      },
      gold: {
        title: '太阳结构与恒星演化',
        content: '太阳从内到外分为：核心（核聚变区，1500万K）、辐射区（能量通过光子随机行走传递，约700万K至200万K）、对流区（热等离子体对流，约200万K至5800K）、光球层（可见表面）、色球层和日冕（温度反常地达到100-300万K，加热机制仍是未解之谜）。太阳将在约50亿年后耗尽核心氢燃料，膨胀为红巨星，吞噬水星和金星，地球可能被烤焦。',
        funFact: '太阳的质量占整个太阳系的99.86%——所有行星加起来只占0.14%！',
        unlockRequirement: 'silver_scholar',
      },
    },
    followUpChain: [
      { id: 'fusion-barrier', question: '为什么核聚变只在核心发生？', answer: '核聚变需要极高的温度和压力来克服质子之间的静电斥力。太阳核心的温度约1500万K，密度是水的150倍，质子有足够动能突破库仑势垒。离开核心后温度和压力迅速下降，不足以维持聚变反应。', nextId: 'solar-wind' },
      { id: 'solar-wind', question: '太阳风是什么？', answer: '太阳风是从太阳日冕持续向外喷射的带电粒子流，速度约400-800公里/秒。它形成了"日球层"——一个保护太阳系免受星际介质冲击的巨大气泡。太阳风也是地球极光的原因！', nextId: null },
    ],
  },
];

export function getKnowledgeForBody(bodyId: string): KnowledgeItemV2 | undefined {
  return knowledgeDataV2.find((k) => k.targetBody === bodyId);
}

export function getKnowledgeById(id: string): KnowledgeItemV2 | undefined {
  return knowledgeDataV2.find((k) => k.id === id);
}
```

### KnowledgeExplorer 组件

```typescript
// src/components/KnowledgeExplorer.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KnowledgeItemV2, KnowledgeLevel } from '../data/knowledgeV2';
import { useStore } from '../store/useStore';
import { ChevronRight, Lock, HelpCircle } from 'lucide-react';

interface KnowledgeExplorerProps {
  knowledge: KnowledgeItemV2;
}

const levelConfig: Record<KnowledgeLevel, { label: string; color: string; bg: string }> = {
  bronze: { label: '青铜', color: '#CD7F32', bg: '#CD7F3220' },
  silver: { label: '白银', color: '#C0C0C0', bg: '#C0C0C020' },
  gold: { label: '黄金', color: '#FFD700', bg: '#FFD70020' },
};

export default function KnowledgeExplorer({ knowledge }: KnowledgeExplorerProps) {
  const [activeLevel, setActiveLevel] = useState<KnowledgeLevel>('bronze');
  const [followUpIndex, setFollowUpIndex] = useState<number>(-1); // -1 = 未展开
  const { unlockedAchievements, incrementKnowledgeCount, unlockedKnowledgeCount } = useStore();

  // 检查层级是否解锁
  const isLevelUnlocked = (level: KnowledgeLevel): boolean => {
    const levelData = knowledge.levels[level];
    if (!levelData.unlockRequirement) return true;
    return unlockedAchievements.includes(levelData.unlockRequirement);
  };

  // 首次访问某层级时增加计数
  const handleLevelChange = (level: KnowledgeLevel) => {
    if (!isLevelUnlocked(level)) return;

    // 检查是否是首次解锁这个知识点在这个层级
    const key = `${knowledge.id}-${level}`;
    const visitedKey = `visited-${key}`;
    if (!localStorage.getItem(visitedKey)) {
      localStorage.setItem(visitedKey, 'true');
      incrementKnowledgeCount(level);
    }

    setActiveLevel(level);
    setFollowUpIndex(-1);
  };

  const activeData = knowledge.levels[activeLevel];
  const currentFollowUp = followUpIndex >= 0 ? knowledge.followUpChain[followUpIndex] : null;

  return (
    <div className="space-y-3">
      {/* 层级标签 */}
      <div className="flex gap-1">
        {(Object.keys(levelConfig) as KnowledgeLevel[]).map((level) => {
          const unlocked = isLevelUnlocked(level);
          const config = levelConfig[level];
          return (
            <button
              key={level}
              onClick={() => handleLevelChange(level)}
              disabled={!unlocked}
              className={`flex-1 py-1.5 px-2 rounded-md text-xs font-bold transition-all ${
                activeLevel === level
                  ? 'text-space-900'
                  : unlocked
                  ? 'text-sci-white/60 hover:text-sci-white'
                  : 'text-sci-white/20 cursor-not-allowed'
              }`}
              style={
                activeLevel === level
                  ? { background: config.color }
                  : unlocked
                  ? { background: config.bg }
                  : {}
              }
            >
              <div className="flex items-center justify-center gap-1">
                {!unlocked && <Lock className="w-3 h-3" />}
                <span>{config.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 知识内容 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeLevel}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-base font-bold text-sci-cyan mb-2 flex items-center gap-2">
            <span className="w-1 h-5 rounded-full" style={{ background: levelConfig[activeLevel].color }} />
            {activeData.title}
          </h3>
          <p className="text-sm text-sci-white/80 leading-relaxed mb-3">{activeData.content}</p>

          {/* 追问链 */}
          {knowledge.followUpChain.length > 0 && (
            <div className="border-t border-sci-cyan/10 pt-3 mt-3">
              <p className="text-xs text-sci-white/40 mb-2 flex items-center gap-1">
                <HelpCircle className="w-3 h-3" />
                点击展开追问链，深入探索
              </p>

              {/* 已展开的追问 */}
              <div className="space-y-2">
                {knowledge.followUpChain.slice(0, followUpIndex + 1).map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-space-700/30 rounded-lg p-3"
                  >
                    <p className="text-xs text-sci-cyan/70 font-medium mb-1">Q: {item.question}</p>
                    <p className="text-sm text-sci-white/70 leading-relaxed">{item.answer}</p>
                  </motion.div>
                ))}

                {/* 下一个追问按钮 */}
                {currentFollowUp && currentFollowUp.nextId ? (
                  <button
                    onClick={() => {
                      const nextIdx = knowledge.followUpChain.findIndex((f) => f.id === currentFollowUp.nextId);
                      if (nextIdx >= 0) setFollowUpIndex(nextIdx);
                    }}
                    className="w-full text-left py-2 px-3 rounded-lg text-sm text-sci-cyan/70 hover:text-sci-cyan hover:bg-sci-cyan/5 transition-all flex items-center gap-1"
                  >
                    <ChevronRight className="w-4 h-4" />
                    {(() => {
                      const nextItem = knowledge.followUpChain.find((f) => f.id === currentFollowUp.nextId);
                      return nextItem ? `继续追问：${nextItem.question}` : '';
                    })()}
                  </button>
                ) : followUpIndex < 0 ? (
                  <button
                    onClick={() => setFollowUpIndex(0)}
                    className="w-full text-left py-2 px-3 rounded-lg text-sm text-sci-cyan/70 hover:text-sci-cyan hover:bg-sci-cyan/5 transition-all flex items-center gap-1"
                  >
                    <ChevronRight className="w-4 h-4" />
                    {knowledge.followUpChain[0]?.question}
                  </button>
                ) : null}
              </div>
            </div>
          )}

          {/* 趣味知识 */}
          <div className="bg-sci-cyan/5 border border-sci-cyan/20 rounded-lg p-3 mt-3">
            <div className="flex items-start gap-2">
              <span className="text-sci-gold text-lg shrink-0">💡</span>
              <div>
                <p className="text-xs text-sci-cyan font-medium mb-1">趣味知识</p>
                <p className="text-sm text-sci-white/70 leading-relaxed">{activeData.funFact}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

### InfoPanel 改造

修改 `src/components/InfoPanel.tsx`：

1. 导入 `KnowledgeExplorer` 和 `knowledgeDataV2`
2. 在知识展示区域用 `KnowledgeExplorer` 替换现有的 `knowledge.content` 展示
3. 保持原有的数据指标网格不变
4. 如果没有找到 knowledge，显示引导文案

具体替换位置（第91-120行）：

```typescript
// 将原来的科普知识区域替换为：
<div className="flex-1 overflow-y-auto p-4 sm:p-5 min-h-0">
  {knowledge ? (
    <KnowledgeExplorer knowledge={knowledge} />
  ) : (
    <div className="text-center py-8">
      <p className="text-sm text-sci-white/40 italic mb-2">暂无该天体的详细科普内容。</p>
      <p className="text-xs text-sci-white/30">完成任务可以解锁更多知识！</p>
    </div>
  )}
</div>
```

---

## Task 4: 系统集成与触发逻辑

**Files:**
- Modify: `src/components/Controls.tsx`
- Modify: `src/components/Planet.tsx`
- Modify: `src/App.tsx`
- Modify: `src/store/useStore.ts`（resetView 更新）

### Controls 改造

将 Quiz 按钮替换为 Mission 按钮，新增 Achievement 按钮：

```typescript
// 在 Controls.tsx 底部按钮区域：
<div className="flex gap-2 justify-end">
  <button
    onClick={() => setShowMissionPanel(true)}
    className="sci-button-primary text-[10px] sm:text-xs flex items-center justify-center gap-1 py-1.5 px-2 sm:py-2 sm:px-3"
  >
    🚀 <span className="hidden sm:inline">探索任务</span>
    <span className="sm:hidden">任务</span>
  </button>
  <button
    onClick={() => setShowAchievementPanel(true)}
    className="sci-button text-[10px] sm:text-xs flex items-center justify-center gap-1 py-1.5 px-2 sm:py-2 sm:px-3"
  >
    🏅 <span className="hidden sm:inline">探索徽章</span>
    <span className="sm:hidden">徽章</span>
  </button>
  <button onClick={handleLunarEclipse} ... />
  <button onClick={resetView} ... />
</div>
```

移除 Quiz 相关引用（showQuiz, setShowQuiz）。

### Planet 改造

在 `Planet.tsx` 中，点击行星时触发成就/任务进度：

在 `onClick` 处理中（大约处理选择天体的位置），添加：

```typescript
const {
  addExploredBody,
  addMissionExploredBody,
  unlockAchievement,
  activeMissionId,
} = useStore();

// 在 handleClick 中：
const handleClick = () => {
  setSelectedBody(body);
  // 成就：记录探索
  addExploredBody(body.id);
  // 任务：记录探索进度
  if (activeMissionId) {
    addMissionExploredBody(body.id);
  }
  // 检查并解锁成就
  checkAndUnlockAchievements(body.id);
};

// 成就检查辅助函数
function checkAndUnlockAchievements(bodyId: string) {
  const { unlockedAchievements, exploredBodies, totalTimeAdvanced } = useStore.getState();

  // 第一步成就
  if (!unlockedAchievements.includes('first_step')) {
    unlockAchievement('first_step');
  }

  // 火星先驱
  if (bodyId === 'mars' && !unlockedAchievements.includes('mars_pioneer')) {
    unlockAchievement('mars_pioneer');
  }

  // 光环探秘者
  if (bodyId === 'saturn' && !unlockedAchievements.includes('saturn_rings')) {
    unlockAchievement('saturn_rings');
  }

  // 太阳系大师
  const planetIds = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
  if (planetIds.every((id) => exploredBodies.includes(id)) && !unlockedAchievements.includes('solar_system_master')) {
    unlockAchievement('solar_system_master');
  }

  // 卫星猎人
  const satelliteIds = ['moon', 'io', 'europa', 'ganymede', 'callisto', 'titan', 'enceladus', 'titania', 'triton', 'phobos', 'deimos'];
  const satelliteCount = satelliteIds.filter((id) => exploredBodies.includes(id)).length;
  if (satelliteCount >= 3 && !unlockedAchievements.includes('satellite_hunter')) {
    unlockAchievement('satellite_hunter');
  }

  // 外域探索者
  const outerIds = ['neptune', 'pluto', 'eris', 'haumea', 'makemake'];
  if (outerIds.some((id) => exploredBodies.includes(id)) && !unlockedAchievements.includes('outer_reaches')) {
    unlockAchievement('outer_reaches');
  }

  // 时间旅行者
  if (totalTimeAdvanced >= 365250 && !unlockedAchievements.includes('time_traveler')) {
    unlockAchievement('time_traveler');
  }
}
```

**注意：** 由于 `useStore.getState()` 可以在组件外部调用，但 `unlockAchievement` 是 store action，可以在 Planet 组件内直接使用 store hook 获取。更好的方式是把 `checkAndUnlockAchievements` 作为纯函数放在 `utils/achievements.ts` 中，接收当前状态和 action dispatchers。

创建一个 `src/utils/achievements.ts`：

```typescript
import { achievements } from '../data/achievements';
import { useStore } from '../store/useStore';

export function evaluateAchievements() {
  const state = useStore.getState();
  const { unlockedAchievements, exploredBodies, completedMissionCount, unlockedKnowledgeCount, totalTimeAdvanced, unlockAchievement } = state;

  achievements.forEach((ach) => {
    if (unlockedAchievements.includes(ach.id)) return;

    const cond = ach.condition;
    let shouldUnlock = false;

    switch (cond.type) {
      case 'explore':
        if (cond.bodyId === '*') {
          shouldUnlock = exploredBodies.length > 0;
        } else {
          shouldUnlock = exploredBodies.includes(cond.bodyId);
        }
        break;
      case 'explore_all':
        shouldUnlock = cond.bodyIds.some((id) => exploredBodies.includes(id));
        break;
      case 'mission_complete':
        shouldUnlock = completedMissionCount >= cond.count;
        break;
      case 'knowledge_unlock':
        shouldUnlock = unlockedKnowledgeCount[cond.level] >= cond.count;
        break;
      case 'time_travel':
        shouldUnlock = totalTimeAdvanced >= cond.days;
        break;
      case 'eclipse_witness':
        // 由月食演示按钮单独触发
        break;
    }

    if (shouldUnlock) {
      unlockAchievement(ach.id);
    }
  });
}
```

在 `Planet.tsx` 的 `onClick` 中调用 `evaluateAchievements()`。

在 `Controls.tsx` 的月食演示按钮中添加：

```typescript
const { addMissionObservedEvent, evaluateAchievements } = useStore(); // 需要从store获取

const handleLunarEclipse = () => {
  setCurrentDay(lunarEclipseDemo.julianDay - 2451545.0);
  setCameraTarget([18, 4, 12]);
  setCameraLookAt([0, 0, 0]);
  // 任务进度
  if (activeMissionId && getMissionById(activeMissionId)?.type === 'observe') {
    addMissionObservedEvent('moon');
  }
  // 成就检查
  evaluateAchievements();
};
```

### App.tsx 注册

```typescript
import AchievementToast from './components/AchievementToast'
import AchievementPanel from './components/AchievementPanel'
import MissionPanel from './components/MissionPanel'

// 在 return 中：
<AchievementToast />
<AchievementPanel />
<MissionPanel />
{/* 移除 QuizPanel */}
```

### SolarSystem 时间累计

在 `src/components/SolarSystem.tsx` 的 `useFrame` 中，时间推进时累计：

```typescript
const { timeSpeed, addTimeAdvanced } = useStore();

// 在 useFrame 的时间推进逻辑中：
const daysPerSecond: Record<TimeSpeed, number> = {
  pause: 0,
  '1x': 1 / 86400,
  '10x': 10 / 86400,
  '100x': 100 / 86400,
  '1000x': 1000 / 86400,
};

const timeDelta = daysPerSecond[timeSpeed] * delta * 86400; // 转换为天数
if (timeDelta > 0) {
  addTimeAdvanced(Math.abs(timeDelta));
}
```

**注意：** 需要精确计算。当前 `currentDay` 的更新逻辑需要检查并修改。

查看 SolarSystem.tsx 的当前时间推进逻辑，确认如何集成 `addTimeAdvanced`。

---

## Task 5: 构建验证与最终审查

**Files:**
- 修改: `tailwind.config.js`（确保 sci-gold 等颜色已定义）
- 运行: `npm run build`
- 运行: 视觉检查（dev server）

### Tailwind 颜色检查

确认 `tailwind.config.js` 中包含：
- `sci-gold` 或类似的金色（如果缺失需要添加）
- `space-700`, `space-800`, `space-900`

---

## 依赖关系图

```
Task 1 (成就系统基础设施)
  ├── data/achievements.ts (NEW)
  ├── store/useStore.ts (MODIFY)
  ├── components/AchievementToast.tsx (NEW)
  └── components/AchievementPanel.tsx (NEW)
       │
       ▼
Task 2 (任务系统)
  ├── data/missions.ts (NEW)
  ├── store/useStore.ts (MODIFY)
  ├── components/MissionPanel.tsx (NEW)
  └── components/Controls.tsx (MODIFY - 替换Quiz入口)
       │
       ▼
Task 3 (三级知识+追问链)
  ├── data/knowledgeV2.ts (NEW)
  ├── components/KnowledgeExplorer.tsx (NEW)
  └── components/InfoPanel.tsx (MODIFY)
       │
       ▼
Task 4 (系统集成)
  ├── components/Planet.tsx (MODIFY - 成就/任务触发)
  ├── components/Controls.tsx (MODIFY - 月食任务触发)
  ├── components/SolarSystem.tsx (MODIFY - 时间累计)
  ├── App.tsx (MODIFY - 注册组件)
  └── utils/achievements.ts (NEW)
       │
       ▼
Task 5 (构建验证)
  └── npm run build
```

---

## 测试策略

**无单元测试框架**（项目现有）。采用手动验证清单：

1. [ ] 启动 dev server，页面正常加载
2. [ ] 点击任意行星 → 右下角弹出"第一步"成就通知
3. [ ] 点击火星 → 弹出"火星先驱"成就
4. [ ] 打开"探索徽章"面板 → 看到已解锁和未解锁徽章
5. [ ] 打开"探索任务"面板 → 看到可接任务列表
6. [ ] 接受"火星登陆计划"任务 → 切换到"进行中"标签
7. [ ] 点击火星 → 任务进度更新 → 点击完成任务 → 获得成就
8. [ ] 打开地球信息面板 → 看到青铜/白银/黄金三级标签
9. [ ] 点击青铜标签 → 看到追问链 → 点击展开"为什么地轴会倾斜？"
10. [ ] 白银标签显示锁定 → 需要"青铜学者"成就解锁
11. [ ] 快进时间1000年以上 → 弹出"时间旅行者"成就
12. [ ] `npm run build` 零 TypeScript 错误
