type Cue = "tap" | "evidence" | "wrong" | "correct" | "door";
let ctx: AudioContext | null = null;
let musicGain: GainNode | null = null;
let effectsGain: GainNode | null = null;
let musicOn = true;
let musicBuilt = false;
let musicTimer: number | null = null;
let musicStep = 0;

function audioContext() {
  if (!ctx) {
    ctx = new AudioContext();
    const compressor = ctx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.knee.value = 12;
    compressor.ratio.value = 5;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.18;
    effectsGain = ctx.createGain();
    effectsGain.gain.value = 1.8;
    effectsGain.connect(compressor).connect(ctx.destination);
  }
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
  oscillator.connect(gain).connect(effectsGain!);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.03);
}

function musicTone(frequency: number, duration: number, volume: number) {
  if (!musicGain || !musicOn) return;
  const ac = audioContext();
  const start = ac.currentTime;
  const oscillator = ac.createOscillator();
  const gain = ac.createGain();
  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(musicGain);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.03);
}

function noise(duration: number, volume: number, frequency: number, delay = 0) {
  const ac = audioContext();
  const start = ac.currentTime + delay;
  const buffer = ac.createBuffer(1, ac.sampleRate * duration, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
  const source = ac.createBufferSource();
  const filter = ac.createBiquadFilter();
  const gain = ac.createGain();
  source.buffer = buffer;
  filter.type = "bandpass";
  filter.frequency.value = frequency;
  filter.Q.value = 1.2;
  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  source.connect(filter).connect(gain).connect(effectsGain!);
  source.start(start);
}

export function playCue(cue: Cue) {
  if (cue === "tap") tone(760, 0.075, 0.2, 0, "square");
  if (cue === "evidence") {
    tone(440, 0.13, 0.27, 0, "square");
    tone(660, 0.2, 0.25, 0.09, "sine");
    noise(0.08, 0.16, 1800);
  }
  if (cue === "wrong") {
    tone(220, 0.2, 0.3, 0, "sawtooth");
    tone(165, 0.3, 0.27, 0.12, "sawtooth");
    noise(0.16, 0.2, 500, 0.04);
  }
  if (cue === "correct") {
    tone(523, 0.2, 0.28, 0, "triangle");
    tone(659, 0.24, 0.3, 0.11, "triangle");
    tone(784, 0.32, 0.3, 0.23, "triangle");
    tone(1047, 0.48, 0.24, 0.36, "sine");
    noise(0.12, 0.14, 2800, 0.34);
  }
  if (cue === "door") {
    noise(0.42, 0.32, 360, 0);
    tone(130, 0.52, 0.3, 0, "sawtooth");
    tone(520, 0.22, 0.25, 0.34, "square");
    tone(1040, 0.38, 0.22, 0.5, "sine");
  }
}

function buildMusic() {
  if (musicBuilt) return;
  const ac = audioContext();
  musicGain = ac.createGain();
  musicGain.gain.value = 0.0001;
  musicGain.connect(ac.destination);
  musicBuilt = true;
}

function startMusicPattern() {
  if (musicTimer !== null) return;
  const melody = [
    783.99, 987.77, 1174.66, 987.77, 880, 1046.5, 1318.51, 1046.5,
  ];
  const tick = () => {
    if (!musicOn) return;
    musicTone(melody[musicStep % melody.length], 0.11, 0.18);
    musicStep += 1;
  };
  tick();
  musicTimer = window.setInterval(tick, 1450);
}

function stopMusicPattern() {
  if (musicTimer !== null) window.clearInterval(musicTimer);
  musicTimer = null;
}

export function setMusic(enabled: boolean) {
  buildMusic();
  const ac = audioContext();
  musicOn = enabled;
  if (enabled) startMusicPattern();
  else stopMusicPattern();
  musicGain?.gain.cancelScheduledValues(ac.currentTime);
  musicGain?.gain.setTargetAtTime(
    enabled ? 0.09 : 0.0001,
    ac.currentTime,
    0.35,
  );
  return musicOn;
}

export function musicEnabled() {
  return musicOn;
}

export function armDefaultMusic() {
  const unlock = () => {
    window.removeEventListener("pointerdown", unlock, true);
    window.removeEventListener("keydown", unlock, true);
    if (musicOn) setMusic(true);
  };
  window.addEventListener("pointerdown", unlock, true);
  window.addEventListener("keydown", unlock, true);
  return () => {
    window.removeEventListener("pointerdown", unlock, true);
    window.removeEventListener("keydown", unlock, true);
  };
}
