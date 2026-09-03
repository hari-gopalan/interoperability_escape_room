type Cue = "tap" | "evidence" | "wrong" | "correct" | "door";
let ctx: AudioContext | null = null;
let musicGain: GainNode | null = null;
let musicOn = false;
let musicBuilt = false;

function audioContext() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(
  frequency: number,
  duration: number,
  volume: number,
  delay = 0,
  type: OscillatorType = "sine",
) {
  const ac = audioContext();
  const start = ac.currentTime + delay;
  const oscillator = ac.createOscillator();
  const gain = ac.createGain();
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(ac.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.03);
}

export function playCue(cue: Cue) {
  if (cue === "tap") tone(520, 0.07, 0.025, 0, "sine");
  if (cue === "evidence") {
    tone(330, 0.12, 0.035, 0, "triangle");
    tone(494, 0.16, 0.03, 0.08, "sine");
  }
  if (cue === "wrong") {
    tone(185, 0.18, 0.04, 0, "triangle");
    tone(147, 0.25, 0.035, 0.1, "triangle");
  }
  if (cue === "correct") {
    tone(392, 0.22, 0.035, 0, "sine");
    tone(523, 0.28, 0.04, 0.12, "sine");
    tone(659, 0.42, 0.035, 0.26, "sine");
  }
  if (cue === "door") {
    tone(110, 0.5, 0.035, 0, "sine");
    tone(220, 0.38, 0.025, 0.18, "triangle");
  }
}

function buildMusic() {
  if (musicBuilt) return;
  const ac = audioContext();
  musicGain = ac.createGain();
  musicGain.gain.value = 0.0001;
  musicGain.connect(ac.destination);
  [110, 164.81, 220].forEach((frequency, index) => {
    const oscillator = ac.createOscillator();
    const voice = ac.createGain();
    oscillator.type = index === 0 ? "sine" : "triangle";
    oscillator.frequency.value = frequency;
    voice.gain.value = index === 0 ? 0.42 : 0.13;
    oscillator.connect(voice).connect(musicGain!);
    oscillator.start();
  });
  const shimmer = ac.createOscillator();
  const shimmerGain = ac.createGain();
  const lfo = ac.createOscillator();
  const lfoGain = ac.createGain();
  shimmer.type = "sine";
  shimmer.frequency.value = 440;
  shimmerGain.gain.value = 0.035;
  lfo.frequency.value = 0.08;
  lfoGain.gain.value = 35;
  lfo.connect(lfoGain).connect(shimmer.frequency);
  shimmer.connect(shimmerGain).connect(musicGain);
  shimmer.start();
  lfo.start();
  musicBuilt = true;
}

export function setMusic(enabled: boolean) {
  buildMusic();
  const ac = audioContext();
  musicOn = enabled;
  musicGain?.gain.cancelScheduledValues(ac.currentTime);
  musicGain?.gain.setTargetAtTime(
    enabled ? 0.025 : 0.0001,
    ac.currentTime,
    0.35,
  );
  return musicOn;
}

export function musicEnabled() {
  return musicOn;
}
