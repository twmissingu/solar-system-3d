import { useEffect, useRef, useCallback } from 'react';
import { useStore } from '../store/useStore';
import { journeyStops } from '../data/journeyData';
import { getHeliocentricPosition, getSatellitePosition } from '../utils/orbit';
import { celestialBodies, dwarfPlanets, getVisualRadius, type CelestialBody } from '../data/celestialData';

export default function JourneyMode() {
  const {
    journeyMode,
    currentJourneyIndex,
    setCurrentJourneyIndex,
    setJourneyMode,
    setCameraFocus,
    setShowJourneyHUD,
    currentDay,
    planetScale,
    timeSpeed,
    setTimeSpeed,
    setSelectedBody,
  } = useStore();

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentDayRef = useRef(currentDay);
  const savedTimeSpeedRef = useRef<typeof timeSpeed | undefined>(undefined);

  useEffect(() => {
    currentDayRef.current = currentDay;
  }, [currentDay]);

  const flyToStop = useCallback(
    (index: number) => {
      if (index >= journeyStops.length) {
        setJourneyMode('completed');
        setShowJourneyHUD(false);
        return;
      }

      const stop = journeyStops[index];
      setCurrentJourneyIndex(index);
      setShowJourneyHUD(true);

      // 递归搜索所有天体（含嵌套卫星如月球）
      const allBodies = [...celestialBodies, ...dwarfPlanets];
      const findBody = (id: string, list = allBodies): CelestialBody | undefined => {
        for (const b of list) {
          if (b.id === id) return b;
          if (b.satellites?.length) {
            const found = findBody(id, b.satellites);
            if (found) return found;
          }
        }
        return undefined;
      };

      const body = findBody(stop.bodyId);
      if (!body) return;

      // 清除已选天体，防止 SolarSystem 的跟踪系统在动画完成后干扰视角
      setSelectedBody(null);

      const makeCameraFocus = (
        bodyPos: [number, number, number],
        radiusKm: number,
        isSun: boolean
      ) => {
        const effectiveRadius = isSun
          ? getVisualRadius(radiusKm)
          : getVisualRadius(radiusKm) * planetScale;
        const dist = Math.max(effectiveRadius * 5, 3);
        setCameraFocus(
          [bodyPos[0] + dist, bodyPos[1] + dist * 0.3, bodyPos[2] + dist],
          bodyPos
        );
      };

      if (stop.bodyId === 'sun') {
        // 太阳固定位于原点
        makeCameraFocus([0, 0, 0], body.radiusKm, true);
      } else if (stop.bodyId === 'moon') {
        // 月球是地球的卫星：地球位置 + 卫星相对位置
        const earth = findBody('earth');
        if (earth) {
          const earthPos = getHeliocentricPosition(earth.orbit, currentDayRef.current);
          const moonRel = getSatellitePosition(body.orbit, currentDayRef.current);
          const moonPos: [number, number, number] = [
            earthPos[0] + moonRel[0],
            earthPos[1] + moonRel[1],
            earthPos[2] + moonRel[2],
          ];
          makeCameraFocus(moonPos, body.radiusKm, false);
        }
      } else {
        const pos = getHeliocentricPosition(body.orbit, currentDayRef.current);
        makeCameraFocus(pos, body.radiusKm, false);
      }

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        flyToStop(index + 1);
      }, 5000);
    },
    [planetScale, setCameraFocus, setCurrentJourneyIndex, setJourneyMode, setShowJourneyHUD, setSelectedBody]
  );

  useEffect(() => {
    if (journeyMode === 'running') {
      flyToStop(currentJourneyIndex);
    } else {
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [journeyMode, currentJourneyIndex, flyToStop]);

  // 旅程开始时暂停模拟时间（否则星体运动会失去焦点），结束时恢复
  useEffect(() => {
    if (journeyMode === 'running') {
      // 只在首次进入旅程时保存原始速度，不重复覆盖
      if (savedTimeSpeedRef.current === undefined || savedTimeSpeedRef.current === 'pause') {
        savedTimeSpeedRef.current = timeSpeed;
      }
      setTimeSpeed('pause');
    } else if (journeyMode === 'idle' || journeyMode === 'completed') {
      if (savedTimeSpeedRef.current !== undefined) {
        setTimeSpeed(savedTimeSpeedRef.current);
        savedTimeSpeedRef.current = undefined;
      }
    }
  }, [journeyMode, setTimeSpeed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setJourneyMode('idle');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setJourneyMode]);

  return null;
}
