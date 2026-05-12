import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Target, GitCompare, Eye } from 'lucide-react';
import { useStore } from '../store/useStore';
import { missions, getMissionById, Mission, MissionType } from '../data/missions';
import { getAchievementById } from '../data/achievements';
import { celestialBodies, dwarfPlanets } from '../data/celestialData';

interface MissionPanelProps {
  onClose: () => void;
}

const TypeIcons: Record<MissionType, React.ReactNode> = {
  explore: <Compass size={16} />,
  identify: <Target size={16} />,
  compare: <GitCompare size={16} />,
  observe: <Eye size={16} />,
};

const difficultyLabels = { 1: '青铜', 2: '白银', 3: '黄金' };
const difficultyColors = { 1: '#CD7F32', 2: '#C0C0C0', 3: '#FFD700' };

function buildBodyNameMap(): Map<string, string> {
  const map = new Map<string, string>();
  const addBody = (body: (typeof celestialBodies)[0]) => {
    map.set(body.id, body.nameZh);
    body.satellites?.forEach(addBody);
  };
  celestialBodies.forEach(addBody);
  dwarfPlanets.forEach(addBody);
  return map;
}

const bodyNameMap = buildBodyNameMap();

function getMissionProgress(
  mission: Mission,
  progress: { exploredBodiesInMission: string[]; compareBodies: string[]; observedEvents: string[] }
) {
  const { type, target } = mission;

  if (type === 'explore' || type === 'identify') {
    if (target.bodyId) {
      const done = progress.exploredBodiesInMission.includes(target.bodyId);
      return { current: done ? 1 : 0, total: 1, done };
    }
    if (target.bodyIds) {
      const matched = progress.exploredBodiesInMission.filter((b) => target.bodyIds!.includes(b));
      const required = target.count ?? target.bodyIds.length;
      return { current: matched.length, total: required, done: matched.length >= required };
    }
  }

  if (type === 'compare' && target.bodyIds) {
    const matched = target.bodyIds.filter((b) => progress.compareBodies.includes(b));
    return { current: matched.length, total: target.bodyIds.length, done: matched.length === target.bodyIds.length };
  }

  if (type === 'observe' && target.bodyId) {
    const done = progress.observedEvents.includes(target.bodyId);
    return { current: done ? 1 : 0, total: 1, done };
  }

  return { current: 0, total: 1, done: false };
}

export default function MissionPanel({ onClose }: MissionPanelProps) {
  const [tab, setTab] = useState<'available' | 'active' | 'completed'>('available');
  const [hintIndex, setHintIndex] = useState(0);

  const {
    activeMissionId,
    setActiveMissionId,
    completedMissions,
    completeMission,
    missionProgress,
    resetMissionProgress,
    unlockAchievement,
    incrementMissionCount,
  } = useStore();

  const activeMission = activeMissionId ? getMissionById(activeMissionId) : null;

  const availableMissions = useMemo(
    () => missions.filter((m) => !completedMissions.includes(m.id) && m.id !== activeMissionId),
    [completedMissions, activeMissionId]
  );

  const completedMissionList = useMemo(
    () => missions.filter((m) => completedMissions.includes(m.id)),
    [completedMissions]
  );

  const handleAcceptMission = (missionId: string) => {
    setActiveMissionId(missionId);
    resetMissionProgress();
    setHintIndex(0);
    setTab('active');
  };

  const handleAbandonMission = () => {
    setActiveMissionId(null);
    resetMissionProgress();
    setHintIndex(0);
  };

  const handleCompleteMission = () => {
    if (!activeMission) return;
    completeMission(activeMission.id);
    incrementMissionCount();
    if (activeMission.rewardAchievementId) {
      unlockAchievement(activeMission.rewardAchievementId);
    }
    setActiveMissionId(null);
    resetMissionProgress();
    setHintIndex(0);
    setTab('completed');
  };

  const tabConfig = [
    { key: 'available' as const, label: '可接任务', count: availableMissions.length },
    { key: 'active' as const, label: '进行中', count: activeMissionId ? 1 : 0 },
    { key: 'completed' as const, label: '已完成', count: completedMissionList.length },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center backdrop-blur-md"
      style={{ background: 'rgba(5, 11, 20, 0.85)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="max-w-xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2
            className="text-xl sm:text-2xl font-bold text-sci-white sci-text-glow"
            style={{ fontFamily: 'Orbitron, sans-serif' }}
          >
            探索任务
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-md text-sci-white/50 hover:text-sci-cyan hover:bg-sci-cyan/10 transition-colors"
            aria-label="关闭任务面板"
            title="关闭"
          >
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M1 1l12 12M13 1L1 13" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 shrink-0">
          {tabConfig.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-3 py-1.5 rounded text-xs sm:text-sm font-medium transition-all ${
                tab === t.key
                  ? 'bg-sci-cyan/20 text-sci-cyan border border-sci-cyan/40'
                  : 'text-sci-white/50 hover:text-sci-white/70 border border-transparent'
              }`}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="sci-panel sci-corner p-4 sm:p-6 overflow-y-auto min-h-0 flex-1">
          <AnimatePresence mode="wait">
            {tab === 'available' && (
              <motion.div
                key="available"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {availableMissions.length === 0 ? (
                  <p className="text-sci-white/50 text-sm text-center py-8">暂无可用任务</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {availableMissions.map((mission) => (
                      <div key={mission.id} className="sci-panel p-3 sm:p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-sci-cyan shrink-0">{TypeIcons[mission.type]}</span>
                            <h3 className="text-sm font-bold text-sci-white truncate">{mission.title}</h3>
                          </div>
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0"
                            style={{
                              color: difficultyColors[mission.difficulty],
                              borderColor: `${difficultyColors[mission.difficulty]}40`,
                              backgroundColor: `${difficultyColors[mission.difficulty]}15`,
                            }}
                          >
                            {difficultyLabels[mission.difficulty]}
                          </span>
                        </div>
                        <p className="text-xs text-sci-white/60 leading-relaxed">{mission.description}</p>
                        <div className="flex justify-end">
                          <button
                            onClick={() => handleAcceptMission(mission.id)}
                            className="sci-button-primary text-xs px-3 py-1.5"
                          >
                            接受
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {tab === 'active' && (
              <motion.div
                key="active"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {!activeMission ? (
                  <p className="text-sci-white/50 text-sm text-center py-8">当前没有进行中的任务</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sci-cyan shrink-0">{TypeIcons[activeMission.type]}</span>
                        <h3 className="text-base font-bold text-sci-white truncate">{activeMission.title}</h3>
                      </div>
                      <span
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0"
                        style={{
                          color: difficultyColors[activeMission.difficulty],
                          borderColor: `${difficultyColors[activeMission.difficulty]}40`,
                          backgroundColor: `${difficultyColors[activeMission.difficulty]}15`,
                        }}
                      >
                        {difficultyLabels[activeMission.difficulty]}
                      </span>
                    </div>
                    <p className="text-sm text-sci-white/70 leading-relaxed">{activeMission.description}</p>

                    {/* Progress */}
                    <div className="space-y-3">
                      {(() => {
                        const progress = getMissionProgress(activeMission, missionProgress);
                        if (activeMission.type === 'explore') {
                          return (
                            <div>
                              <div className="flex justify-between text-xs text-sci-white/60 mb-1">
                                <span>探索进度</span>
                                <span>
                                  {progress.current} / {progress.total}
                                </span>
                              </div>
                              <div className="h-2 bg-space-700 rounded-full overflow-hidden">
                                <motion.div
                                  className="h-full bg-sci-cyan rounded-full"
                                  initial={{ width: 0 }}
                                  animate={{
                                    width: `${Math.min(100, progress.total > 0 ? (progress.current / progress.total) * 100 : 0)}%`,
                                  }}
                                  transition={{ duration: 0.4 }}
                                />
                              </div>
                            </div>
                          );
                        }
                        if (activeMission.type === 'identify') {
                          return (
                            <div className="flex items-center gap-2 text-sm">
                              {progress.done ? (
                                <>
                                  <span className="text-green-400">✓</span>
                                  <span className="text-green-300">已找到目标天体</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-sci-white/40">○</span>
                                  <span className="text-sci-white/50">寻找目标天体中...</span>
                                </>
                              )}
                            </div>
                          );
                        }
                        if (activeMission.type === 'compare') {
                          return (
                            <div className="flex flex-col gap-1.5">
                              <span className="text-xs text-sci-white/60 mb-1">比较目标</span>
                              {activeMission.target.bodyIds?.map((bodyId) => {
                                const done = missionProgress.compareBodies.includes(bodyId);
                                return (
                                  <div key={bodyId} className="flex items-center gap-2 text-sm">
                                    {done ? (
                                      <>
                                        <span className="text-green-400">✓</span>
                                        <span className="text-green-300">{bodyNameMap.get(bodyId) || bodyId}</span>
                                      </>
                                    ) : (
                                      <>
                                        <span className="text-sci-white/40">○</span>
                                        <span className="text-sci-white/50">{bodyNameMap.get(bodyId) || bodyId}</span>
                                      </>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        }
                        if (activeMission.type === 'observe') {
                          return (
                            <div className="flex items-center gap-2 text-sm">
                              {progress.done ? (
                                <>
                                  <span className="text-green-400">✓</span>
                                  <span className="text-green-300">已观察目标事件</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-sci-white/40">○</span>
                                  <span className="text-sci-white/50">等待观察目标事件...</span>
                                </>
                              )}
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {/* Hints */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-sci-white/50 uppercase tracking-wider">提示</h4>
                      <div className="flex flex-col gap-1.5">
                        {activeMission.hints.slice(0, hintIndex + 1).map((hint, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-xs text-sci-white/70 bg-space-700/30 border border-sci-white/10 rounded px-3 py-2"
                          >
                            {hint}
                          </motion.div>
                        ))}
                      </div>
                      {hintIndex < activeMission.hints.length - 1 && (
                        <button
                          onClick={() => setHintIndex((i) => i + 1)}
                          className="sci-button text-xs px-3 py-1.5"
                        >
                          还需要更多提示？
                        </button>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 pt-2">
                      {getMissionProgress(activeMission, missionProgress).done && (
                        <div className="space-y-2">
                          {activeMission.rewardAchievementId && (
                            <p className="text-xs text-sci-cyan">
                              完成奖励：解锁成就「
                              {getAchievementById(activeMission.rewardAchievementId)?.name || activeMission.rewardAchievementId}
                              」
                            </p>
                          )}
                          <button
                            onClick={handleCompleteMission}
                            className="sci-button-primary w-full text-sm py-2"
                          >
                            完成任务
                          </button>
                        </div>
                      )}
                      <button
                        onClick={handleAbandonMission}
                        className="sci-button w-full text-sm py-2"
                      >
                        放弃当前任务
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {tab === 'completed' && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {completedMissionList.length === 0 ? (
                  <p className="text-sci-white/50 text-sm text-center py-8">暂无已完成任务</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {completedMissionList.map((mission) => (
                      <div
                        key={mission.id}
                        className="flex items-center gap-3 p-3 rounded bg-green-500/5 border border-green-500/20"
                      >
                        <span className="text-green-400 text-lg shrink-0">✓</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-sci-white truncate">{mission.title}</h4>
                          <span className="text-[10px]" style={{ color: difficultyColors[mission.difficulty] }}>
                            {difficultyLabels[mission.difficulty]}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
