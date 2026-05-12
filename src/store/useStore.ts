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

  // 知识问答
  showQuiz: boolean;
  setShowQuiz: (show: boolean) => void;

  // 重置状态
  resetView: () => void;
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

  showQuiz: false,
  setShowQuiz: (show) => set({ showQuiz: show }),

  resetView: () =>
    set({
      selectedBody: null,
      viewMode: 'overview',
      cameraTarget: null,
      cameraLookAt: null,
      showKnowledge: false,
      showQuiz: false,
      scaleMode: 'exaggerated',
    }),
}));
