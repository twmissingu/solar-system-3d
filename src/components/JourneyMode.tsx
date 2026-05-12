import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { journeyStops } from '../data/journeyData';
import { getHeliocentricPosition } from '../utils/orbit';
import { celestialBodies, dwarfPlanets } from '../data/celestialData';

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

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentDayRef = useRef(currentDay);

  useEffect(() => {
    currentDayRef.current = currentDay;
  }, [currentDay]);

  const flyToStop = useCallback((index: number) => {
    if (index >= journeyStops.length) {
      setJourneyMode('completed');
      setShowJourneyHUD(false);
      return;
    }

    const stop = journeyStops[index];
    setCurrentJourneyIndex(index);
    setShowJourneyHUD(true);

    if (stop.bodyId === 'sun') {
      setCameraTarget([8, 3, 8]);
      setCameraLookAt([0, 0, 0]);
    } else {
      const body = celestialBodies.find((b) => b.id === stop.bodyId) ||
                   dwarfPlanets.find((b) => b.id === stop.bodyId);
      if (body) {
        const pos = getHeliocentricPosition(body.orbit, currentDayRef.current);
        const camDist = Math.max(body.visualRadius * 8, 3);
        setCameraTarget([pos[0] + camDist, pos[1] + camDist * 0.5, pos[2] + camDist]);
        setCameraLookAt(pos);
      }
    }

    timerRef.current = setTimeout(() => {
      flyToStop(index + 1);
    }, 5000);
  }, [setCameraTarget, setCameraLookAt, setCurrentJourneyIndex, setJourneyMode, setShowJourneyHUD]);

  useEffect(() => {
    if (journeyMode === 'running') {
      flyToStop(currentJourneyIndex);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [journeyMode, flyToStop]);

  useEffect(() => {
    if (journeyMode === 'paused' && timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, [journeyMode]);

  return null;
}
