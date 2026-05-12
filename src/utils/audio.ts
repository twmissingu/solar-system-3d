let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isMuted = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = isMuted ? 0 : 0.3;
    masterGain.connect(audioCtx.destination);
  }
  return audioCtx;
}

export function playUISound(type: 'hover' | 'click' | 'success') {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    let stopTime = 0.5;
    switch (type) {
      case 'hover':
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        stopTime = 0.15;
        break;
      case 'click':
        osc.frequency.value = 1200;
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        stopTime = 0.2;
        break;
      case 'success':
        osc.frequency.value = 600;
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        stopTime = 0.5;
        break;
    }

    if (!masterGain) return;
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    osc.stop(ctx.currentTime + stopTime);
  } catch {
    // AudioContext may be suspended; silently ignore
  }
}

export function playAmbientDrone(planetId: string) {
  if (isMuted) return () => {};
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const freqMap: Record<string, number> = {
      sun: 110, mercury: 220, venus: 196, earth: 164.81,
      mars: 146.83, jupiter: 82.41, saturn: 73.42,
      uranus: 65.41, neptune: 58.27, pluto: 55,
    };
    const baseFreq = freqMap[planetId] || 110;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.frequency.value = baseFreq;
    osc1.type = 'sine';
    osc2.frequency.value = baseFreq * 1.5;
    osc2.type = 'triangle';

    gain.gain.value = 0.05;

    if (!masterGain) return () => {};
    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(masterGain);

    osc1.start();
    osc2.start();

    return () => {
      try { osc1.stop(); } catch {}
      try { osc2.stop(); } catch {}
      try { osc1.disconnect(); } catch {}
      try { osc2.disconnect(); } catch {}
      try { gain.disconnect(); } catch {}
    };
  } catch {
    return () => {};
  }
}

export function toggleMute(): boolean {
  isMuted = !isMuted;
  if (masterGain) {
    masterGain.gain.setTargetAtTime(isMuted ? 0 : 0.3, getAudioContext().currentTime, 0.1);
  }
  return isMuted;
}

export function getMuteState(): boolean {
  return isMuted;
}
