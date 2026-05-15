import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, Target, GitCompare, Eye, X, AlertCircle } from 'lucide-react';
import { useStore, MAX_ACTIVE_MISSIONS } from '../store/useStore';
import { missions, getMissionById, Mission, MissionType } from '../data/missions';
import { getAchievementById } from '../data/achievements';
import { evaluateAchievements } from '../utils/achievements';
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

function MissionCard({
  mission,
  progress,
  hintIndex,
  onComplete,
  onAbandon,
}: {
  mission: Mission;
  progress: { exploredBodiesInMission: string[]; compareBodies: string[]; observedEvents: string[] };
  hintIndex: number;
  onComplete: () => void;
  onAbandon: () => void;
}) {
  const nextHint = useStore((s) => s.nextHint);
  const progressData = getMissionProgress(mission, progress);

  return (
    <div className="sci-panel p-3 sm:p-4 flex flex-col gap-3">
      {/* Header */}
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

      {/* Progress */}
      <div className="space-y-2">
        {(mission.type === 'explore' || mission.type === 'identify') && mission.target.bodyIds && (
          <div>
            <div className="flex justify-between text-xs text-sci-white/60 mb-1">
              <span>探索进度</span>
              <span>{progressData.current} / {progressData.total}</span>
            </div>
            <div className="h-2 bg-space-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-sci-cyan rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(progressData.current / progressData.total) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>
        )}

        {(mission.type === 'identify' && !mission.target.bodyIds) && (
          <div className="flex items-center gap-2 text-sm">
            {progressData.done ? (
              <><span className="text-sci-success">✓</span><span className="text-green-300">已找到目标天体</span></>
            ) : (
              <><span className="text-sci-white/40">○</span><span className="text-sci-white/50">寻找目标天体中...</span></>
            )}
          </div>
        )}

        {mission.type === 'compare' && mission.target.bodyIds && (
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-sci-white/60">比较目标</span>
            {mission.target.bodyIds.map((bodyId) => {
              const done = progress.compareBodies.includes(bodyId);
              return (
                <div key={bodyId} className="flex items-center gap-2 text-sm">
                  {done ? (
                    <><span className="text-sci-success">✓</span><span className="text-green-300">{bodyNameMap.get(bodyId) || bodyId}</span></>
                  ) : (
                    <><span className="text-sci-white/40">○</span><span className="text-sci-white/50">{bodyNameMap.get(bodyId) || bodyId}</span></>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {mission.type === 'observe' && (
          <div className="flex items-center gap-2 text-sm">
            {progressData.done ? (
              <><span className="text-sci-success">✓</span><span className="text-green-300">已观察目标事件</span></>
            ) : (
              <><span className="text-sci-white/40">○</span><span className="text-sci-white/50">等待观察目标事件...</span></>
            )}
          </div>
        )}
      </div>

      {/* Hints */}
      <div className="space-y-1.5">
        <h4 className="text-[10px] font-bold text-sci-white/50 uppercase tracking-wider">提示</h4>
        <div className="flex flex-col gap-1">
          {mission.hints.slice(0, hintIndex + 1).map((hint, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2 }}
              className="text-[11px] text-sci-white/70 bg-space-700/30 border border-sci-white/10 rounded px-2.5 py-1.5"
            >
              {hint}
            </motion.div>
          ))}
        </div>
        {hintIndex < mission.hints.length - 1 && (
          <button onClick={() => nextHint(mission.id)} className="sci-button text-[10px] px-2.5 py-1">
            还需要更多提示？
          </button>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 pt-1">
        {progressData.done && (
          <div className="space-y-1.5">
            {mission.rewardAchievementId && (
              <p className="text-[10px] text-sci-cyan">
                完成奖励：解锁成就「{getAchievementById(mission.rewardAchievementId)?.name || mission.rewardAchievementId}」
              </p>
            )}
            <button onClick={onComplete} className="sci-button-primary w-full text-xs py-2">
              完成任务
            </button>
          </div>
        )}
        <button onClick={onAbandon} className="sci-button w-full text-xs py-1.5">
          放弃任务
        </button>
      </div>
    </div>
  );
}

export default function MissionPanel({ onClose }: MissionPanelProps) {
  const [tab, setTab] = useState<'available' | 'active' | 'completed'>('available');
  const [expandedCompletedId, setExpandedCompletedId] = useState<string | null>(null);

  const {
    activeMissionIds,
    addActiveMission,
    removeActiveMission,
    completedMissions,
    completeMission,
    missionProgressMap,
    hintIndexMap,
    unlockAchievement,
    incrementMissionCount,
  } = useStore();

  const activeMissions = useMemo(
    () => activeMissionIds.map((mid) => getMissionById(mid)).filter(Boolean) as Mission[],
    [activeMissionIds]
  );

  const availableMissions = useMemo(
    () => missions.filter((m) => !completedMissions.includes(m.id) && !activeMissionIds.includes(m.id)),
    [completedMissions, activeMissionIds]
  );

  const completedMissionList = useMemo(
    () => missions.filter((m) => completedMissions.includes(m.id)),
    [completedMissions]
  );

  const canAcceptMore = activeMissionIds.length < MAX_ACTIVE_MISSIONS;

  const handleAcceptMission = (missionId: string) => {
    addActiveMission(missionId);
    setTab('active');
  };

  const handleAbandonMission = (missionId: string) => {
    removeActiveMission(missionId);
  };

  const handleCompleteMission = (missionId: string) => {
    const mission = getMissionById(missionId);
    if (!mission) return;
    completeMission(missionId);
    incrementMissionCount();
    if (mission.rewardAchievementId) {
      unlockAchievement(mission.rewardAchievementId);
    }
    evaluateAchievements();
  };

  const tabConfig = [
    { key: 'available' as const, label: '可接任务', count: availableMissions.length },
    { key: 'active' as const, label: '进行中', count: activeMissionIds.length },
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
            <X size={16} />
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
                {/* 任务上限提示 */}
                {!canAcceptMore && (
                  <div className="flex items-center gap-2 mb-3 text-xs text-sci-warning bg-sci-warning/10 border border-sci-warning/20 rounded px-3 py-2">
                    <AlertCircle size={14} />
                    <span>同时最多进行 {MAX_ACTIVE_MISSIONS} 个任务，请先完成或放弃已有任务</span>
                  </div>
                )}

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
                            disabled={!canAcceptMore}
                            className={`text-xs px-3 py-1.5 rounded font-medium transition-all ${
                              canAcceptMore
                                ? 'sci-button-primary'
                                : 'bg-sci-white/5 text-sci-white/30 cursor-not-allowed'
                            }`}
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
                {activeMissions.length === 0 ? (
                  <p className="text-sci-white/50 text-sm text-center py-8">当前没有进行中的任务</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {activeMissions.map((mission) => (
                      <MissionCard
                        key={mission.id}
                        mission={mission}
                        progress={missionProgressMap[mission.id] || { exploredBodiesInMission: [], compareBodies: [], observedEvents: [] }}
                        hintIndex={hintIndexMap[mission.id] ?? 0}
                        onComplete={() => handleCompleteMission(mission.id)}
                        onAbandon={() => handleAbandonMission(mission.id)}
                      />
                    ))}
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
                      <div key={mission.id} className="flex flex-col">
                        <button
                          onClick={() => setExpandedCompletedId(expandedCompletedId === mission.id ? null : mission.id)}
                          className="w-full text-left"
                        >
                          <div className="flex items-center gap-3 p-3 rounded bg-green-500/5 border border-green-500/20">
                            <span className="text-green-400 text-lg shrink-0">✓</span>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-bold text-sci-white truncate">{mission.title}</h4>
                              <span className="text-[10px]" style={{ color: difficultyColors[mission.difficulty] }}>
                                {difficultyLabels[mission.difficulty]}
                              </span>
                            </div>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`text-sci-white/30 transition-transform ${expandedCompletedId === mission.id ? 'rotate-180' : ''}`}>
                              <path d="M6 9l6 6 6-6" />
                            </svg>
                          </div>
                        </button>
                        <AnimatePresence>
                          {expandedCompletedId === mission.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 py-2 bg-space-700/20 border border-green-500/10 border-t-0 rounded-b">
                                <p className="text-xs text-sci-white/60">{mission.description}</p>
                                {mission.rewardAchievementId && (
                                  <p className="text-[10px] text-sci-cyan mt-1">奖励：{mission.rewardAchievementId}</p>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
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
