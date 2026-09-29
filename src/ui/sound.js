// Key sounds, synthesized with Web Audio (no audio files, works offline).
// Each theme has its own voice; Melody plays real notes on a pentatonic scale.
// The audio engine sleeps after 30 s of silence to save battery.

const root = document.documentElement;
const PENTA = [0, 2, 4, 7, 9];
const CHORDS = { '+': [0, 4, 7], '-': [-3, 0, 4], '*': [5, 9, 12], '/': [7, 11, 14], '^': [2, 5, 9] };
const OPS = ['+', '-', '*', '/', '^'];

let ctx = null;
let master = null;
let noiseBuf = null;
let sleepTimer;

const degree = (i) => PENTA[((i % 5) + 5) % 5] + 12 * Math.floor(i / 5);
const hz = (semi, base = 523.25) => base * 2 ** (semi / 12); // C5

function audio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.4;
    master.connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.05), ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  if (ctx.state === 'suspended') ctx.resume();
  clearTimeout(sleepTimer);
  sleepTimer = setTimeout(() => ctx.suspend(), 30000);
  return ctx;
}

function tone({ freq, type = 'sine', attack = 0.004, decay = 0.25, gain = 0.3, when = 0, slideTo }) {
  const t = ctx.currentTime + when;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + decay * 0.7);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  osc.connect(g).connect(master);
  osc.start(t);
  osc.stop(t + attack + decay + 0.05);
}

function click({ freq = 2800, gain = 0.3, when = 0, q = 1.4 }) {
  const t = ctx.currentTime + when;
  const src = ctx.createBufferSource();
  src.buffer = noiseBuf;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  f.Q.value = q;
  const g = ctx.createGain();
  g.gain.value = gain;
  src.connect(f).connect(g).connect(master);
  src.start(t, 0, 0.03);
}

function musicBox(freq, when = 0, gain = 0.2) {
  tone({ freq, decay: 1.1, gain, when });
  tone({ freq: freq * 2, decay: 0.5, gain: gain * 0.35, when });
  tone({ freq: freq * 3, decay: 0.22, gain: gain * 0.12, when });
}

// One "note" in each theme's voice. i picks the pitch; when delays it.
const VOICES = {
  mono: (i, when) => {
    click({ freq: 2600 + (i % 5) * 180, gain: 0.35, when });
    tone({ freq: 1400 + (i % 5) * 60, type: 'square', decay: 0.018, gain: 0.025, when });
  },
  lavender: (i, when) => {
    const f = hz(degree(i) + 12);
    tone({ freq: f, decay: 0.9, gain: 0.14, when });
    tone({ freq: f * 2.76, decay: 0.3, gain: 0.045, when });
  },
  strawberry: (i, when) => {
    const f = 360 + (i % 8) * 45;
    tone({ freq: f, slideTo: f * 2.5, decay: 0.09, gain: 0.28, when });
  },
  matcha: (i, when) => {
    const f = 480 + (i % 5) * 70;
    tone({ freq: f, type: 'triangle', decay: 0.07, gain: 0.34, when });
    click({ freq: f * 2.2, gain: 0.1, q: 4, when });
  },
  blueberry: (i, when) => {
    const f = hz(degree(i) - 5);
    tone({ freq: f, decay: 0.34, gain: 0.24, when });
    tone({ freq: f * 4, decay: 0.07, gain: 0.05, when });
  },
  melody: (i, when) => musicBox(hz(degree(i)), when),
};

const voice = (name = root.dataset.theme) => VOICES[name] ?? VOICES.mono;

function keyIndex(key) {
  if (/^[0-9]$/.test(key)) return key === '0' ? 9 : Number(key) - 1;
  if (OPS.includes(key)) return 5 + OPS.indexOf(key);
  return 3 + (key.length % 5);
}

export function initSound({ button }) {
  let on = true;
  try {
    on = localStorage.getItem('lumi.sound') !== 'off';
  } catch {
    /* default on */
  }

  function sync() {
    root.classList.toggle('muted', !on);
    button.setAttribute('aria-pressed', String(on));
    button.setAttribute('aria-label', on ? 'Sound on' : 'Sound off');
  }

  const ready = () => on && audio();

  function key(k) {
    if (!ready()) return;
    const theme = root.dataset.theme;
    if (theme === 'melody' && CHORDS[k]) {
      CHORDS[k].forEach((s) => musicBox(hz(s), 0, 0.12));
    } else if (k === 'back') {
      voice()(1, 0);
    } else {
      voice()(keyIndex(k), 0);
    }
  }

  function arpeggio(steps, gap, name) {
    if (!ready()) return;
    steps.forEach((i, n) => voice(name)(i, n * gap));
  }

  sync();
  button.addEventListener('click', () => {
    on = !on;
    try {
      localStorage.setItem('lumi.sound', on ? 'on' : 'off');
    } catch {
      /* not remembered in private mode */
    }
    sync();
    arpeggio([2, 4], 0.08);
  });

  return {
    key,
    result: () => arpeggio([0, 2, 3, 5], 0.085),
    clear: () => arpeggio([6, 4, 2, 0], 0.05),
    error: () => {
      if (!ready()) return;
      tone({ freq: 190, type: 'triangle', slideTo: 95, decay: 0.32, gain: 0.3 });
    },
    theme: (name) => arpeggio([0, 2, 4, 7], 0.07, name),
  };
}
