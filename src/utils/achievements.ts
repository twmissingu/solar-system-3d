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
        // Handled separately in Controls.tsx
        break;
    }

    if (shouldUnlock) {
      unlockAchievement(ach.id);
    }
  });
}
