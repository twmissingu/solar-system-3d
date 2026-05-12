import { create } from 'zustand';
import { CelestialBody } from '../data/celestialData';

export type ViewMode = 'overview' | 'focused';
export type TimeSpeed = 'pause' | '1x' | '10x' | '100x' | '1000x';
export type ScaleMode = 'exaggerated' | 'realistic';

interface AppState {
  // 当前选中天体
  selectedBody: CelestialBody | null;
  setSelectedBody: (body: CelestialBody | null) => void;

  // 视角模式
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // 时间控制
  timeSpeed: TimeSpeed;
  setTimeSpeed: (speed: TimeSpeed) => void;
  currentDay: number; // 相对于J2000.0的天数
  setCurrentDay: (day: number | ((prev: number) => number)) => void;

  // 是否显示轨道
  showOrbits: boolean;
  setShowOrbits: (show: boolean) => void;

  // 是否显示标签
  showLabels: boolean;
  setShowLabels: (show: boolean) => void;

  // 相机目标位置（用于动画过渡）
  cameraTarget: [number, number, number] | null;
  setCameraTarget: (target: [number, number, number] | null) => void;
  // 相机注视目标
  cameraLookAt: [number, number, number] | null;
  setCameraLookAt: (target: [number, number, number] | null) => void;

  // 是否显示知识面板
  showKnowledge: boolean;
  setShowKnowledge: (show: boolean) => void;

  // 尺度模式
  scaleMode: ScaleMode;
  setScaleMode: (mode: ScaleMode) => void;

  // 重置状态
  resetView: () => void;

  // Achievement system
  unlockedAchievements: string[];
  unlockAchievement: (id: string) => void;
  achievementQueue: string[];
  dequeueAchievement: () => void;
  showAchievementPanel: boolean;
  setShowAchievementPanel: (show: boolean) => void;

  // Exploration tracking
  exploredBodies: string[];
  addExploredBody: (bodyId: string) => void;

  // Mission counters
  completedMissionCount: number;
  incrementMissionCount: () => void;

  // Knowledge counters
  unlockedKnowledgeCount: { bronze: number; silver: number; gold: number };
  incrementKnowledgeCount: (level: 'bronze' | 'silver' | 'gold') => void;

  // Time tracking
  totalTimeAdvanced: number;
  addTimeAdvanced: (days: number) => void;

  // Mission system (needed by Task 2)
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
  currentHintIndex: number;
  nextHint: () => void;
}

export const useStore = create<AppState>((set) => ({
  selectedBody: null,
  setSelectedBody: (body) => set({ selectedBody: body, showKnowledge: !!body }),

  viewMode: 'overview',
  setViewMode: (mode) => set({ viewMode: mode }),

  timeSpeed: '1x',
  setTimeSpeed: (speed) => set({ timeSpeed: speed }),
  currentDay: 0,
  setCurrentDay: (day) =>
    set((state) => ({
      currentDay: typeof day === 'function' ? day(state.currentDay) : day,
    })),

  showOrbits: true,
  setShowOrbits: (show) => set({ showOrbits: show }),

  showLabels: true,
  setShowLabels: (show) => set({ showLabels: show }),

  cameraTarget: null,
  setCameraTarget: (target) => set({ cameraTarget: target }),
  cameraLookAt: null,
  setCameraLookAt: (target) => set({ cameraLookAt: target }),

  showKnowledge: false,
  setShowKnowledge: (show) => set({ showKnowledge: show }),

  scaleMode: 'exaggerated',
  setScaleMode: (mode) => set({ scaleMode: mode }),

  resetView: () =>
    set({
      selectedBody: null,
      viewMode: 'overview',
      cameraTarget: null,
      cameraLookAt: null,
      showKnowledge: false,
      scaleMode: 'exaggerated',
    }),

  // Achievement system
  unlockedAchievements: [],
  unlockAchievement: (id) =>
    set((state) => {
      if (state.unlockedAchievements.includes(id)) {
        return {};
      }
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

  // Exploration tracking
  exploredBodies: [],
  addExploredBody: (bodyId) =>
    set((state) => {
      if (state.exploredBodies.includes(bodyId)) {
        return {};
      }
      return {
        exploredBodies: [...state.exploredBodies, bodyId],
      };
    }),

  // Mission counters
  completedMissionCount: 0,
  incrementMissionCount: () =>
    set((state) => ({
      completedMissionCount: state.completedMissionCount + 1,
    })),

  // Knowledge counters
  unlockedKnowledgeCount: { bronze: 0, silver: 0, gold: 0 },
  incrementKnowledgeCount: (level) =>
    set((state) => ({
      unlockedKnowledgeCount: {
        ...state.unlockedKnowledgeCount,
        [level]: state.unlockedKnowledgeCount[level] + 1,
      },
    })),

  // Time tracking
  totalTimeAdvanced: 0,
  addTimeAdvanced: (days) =>
    set((state) => ({
      totalTimeAdvanced: state.totalTimeAdvanced + days,
    })),

  // Mission system
  activeMissionId: null,
  setActiveMissionId: (id) =>
    set({
      activeMissionId: id,
      missionProgress: {
        exploredBodiesInMission: [],
        compareBodies: [],
        observedEvents: [],
      },
      currentHintIndex: 0,
    }),
  missionProgress: {
    exploredBodiesInMission: [],
    compareBodies: [],
    observedEvents: [],
  },
  resetMissionProgress: () =>
    set({
      missionProgress: {
        exploredBodiesInMission: [],
        compareBodies: [],
        observedEvents: [],
      },
    }),
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
    set((state) => ({
      completedMissions: state.completedMissions.includes(id)
        ? state.completedMissions
        : [...state.completedMissions, id],
    })),
  showMissionPanel: false,
  setShowMissionPanel: (show) => set({ showMissionPanel: show }),
  currentHintIndex: 0,
  nextHint: () =>
    set((state) => ({
      currentHintIndex: state.currentHintIndex + 1,
    })),
}));
