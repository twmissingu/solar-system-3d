let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isMuted = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(audioCtx.destination);
  }
  return audioCtx;
}

export function playUISound(type: 'hover' | 'click' | 'success') {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    switch (type) {
      case 'hover':
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        break;
      case 'click':
        osc.frequency.value = 1200;
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        break;
      case 'success':
        osc.frequency.value = 600;
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        break;
    }

    osc.connect(gain);
    gain.connect(masterGain!);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // AudioContext may be suspended; silently ignore
  }
}

export function playAmbientDrone(planetId: string) {
  if (isMuted) return undefined;
  try {
    const ctx = getAudioContext();
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

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(masterGain!);

    osc1.start();
    osc2.start();

    return () => {
      osc1.stop();
      osc2.stop();
    };
  } catch {
    return undefined;
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
