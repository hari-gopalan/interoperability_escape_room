type Cue = "tap" | "evidence" | "wrong" | "correct" | "door";
let ctx: AudioContext | null = null;
let musicGain: GainNode | null = null;
let musicOn = false;
let musicBuilt = false;
let musicTimer: number | null = null;
let musicStep = 0;

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

function musicTone(frequency: number, duration: number, volume: number) {
  if (!musicGain || !musicOn) return;
  const ac = audioContext();
  const start = ac.currentTime;
  const oscillator = ac.createOscillator();
  const gain = ac.createGain();
  oscillator.type = "triangle";
  oscillator.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.018);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(musicGain);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.03);
}

export function playCue(cue: Cue) {
  if (cue === "tap") tone(620, 0.075, 0.09, 0, "sine");
  if (cue === "evidence") {
    tone(330, 0.12, 0.11, 0, "triangle");
    tone(494, 0.18, 0.1, 0.08, "sine");
  }
  if (cue === "wrong") {
    tone(185, 0.18, 0.12, 0, "triangle");
    tone(147, 0.25, 0.1, 0.1, "triangle");
  }
  if (cue === "correct") {
    tone(392, 0.22, 0.11, 0, "sine");
    tone(523, 0.28, 0.13, 0.12, "sine");
    tone(659, 0.42, 0.11, 0.26, "sine");
    tone(784, 0.5, 0.07, 0.38, "triangle");
  }
  if (cue === "door") {
    tone(110, 0.5, 0.12, 0, "sine");
    tone(220, 0.38, 0.1, 0.18, "triangle");
    tone(440, 0.32, 0.08, 0.38, "sine");
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
  const melody = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46];
  const tick = () => {
    if (!musicOn) return;
    musicTone(melody[musicStep % melody.length], 0.22, 0.2);
    if (musicStep % 4 === 0)
      musicTone(melody[musicStep % melody.length] / 2, 0.32, 0.11);
    musicStep += 1;
  };
  tick();
  musicTimer = window.setInterval(tick, 680);
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
    enabled ? 0.12 : 0.0001,
    ac.currentTime,
    0.35,
  );
  return musicOn;
}

export function musicEnabled() {
  return musicOn;
}
