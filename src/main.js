import './styles/tokens.css';
import './styles/base.css';
import './styles/display.css';
import './styles/keys.css';
import './styles/panels.css';
import './styles/scenery.css';

import { initialState, press, loadValue } from './engine/calculator.js';
import { createDisplay } from './ui/display.js';
import { initKeypad } from './ui/keypad.js';
import { initTheme } from './ui/theme.js';
import { initHistory } from './ui/history.js';
import { initScientific } from './ui/scientific.js';
import { initScenery } from './ui/scenery.js';
import { initSound } from './ui/sound.js';

const $ = (id) => document.getElementById(id);
const app = $('app');
const logoSpark = document.querySelector('.logo-spark');

function savedAngle() {
  try {
    return localStorage.getItem('lumi.angle') === 'rad' ? 'rad' : 'deg';
  } catch {
    return 'deg';
  }
}

let state = initialState(savedAngle());
const chips = document.querySelectorAll('.chip-th');

const scenery = initScenery({
  board: $('board'),
  edge: $('edge'),
  bgStickers: $('bgStickers'),
  falls: $('falls'),
  garland: $('garland'),
  fxLayer: $('fxLayer'),
  emptySticker: $('emptySticker'),
  chips,
});
const sound = initSound({ button: $('soundBtn') });
const centerOf = (el) => {
  const r = el.getBoundingClientRect();
  return [r.left + r.width / 2, r.top + r.height / 2];
};

const display = createDisplay({
  screen: $('screen'),
  expr: $('expr'),
  main: $('main'),
  preview: $('preview'),
  sr: $('sr'),
  sheenEl: document.querySelector('.sheen'),
  sparklesEl: document.querySelector('.sparkles'),
  angleTag: $('angleTag'),
  angleKey: $('angleKey'),
  logoSpark,
  onLayout: () => scenery.avoid([$('expr'), $('main'), $('preview'), $('sciBtn')]),
});

const history = initHistory(
  {
    app,
    openBtn: $('historyBtn'),
    panel: $('history'),
    list: $('historyList'),
    empty: $('historyEmpty'),
    clearBtn: $('clearHistory'),
    closeBtn: $('closeHistory'),
  },
  (value) => {
    state = loadValue(state, value);
    display.render(state, null, 'load');
  },
);

initTheme({
  chips,
  modeBtn: $('modeBtn'),
  logoSpark,
  toast: $('toast'),
  onChange: () => {
    scenery.render(true);
    display.fit();
  },
  onPick: (el, name) => {
    scenery.jelly(el);
    scenery.burst(...centerOf(el), 8, 1.3);
    sound.theme(name);
  },
});
initScientific({ btn: $('sciBtn'), panel: $('sci') }, display.fit);

initKeypad(
  app,
  (key) => {
    const prev = state;
    state = press(state, key);
    if (state.entry) history.add(state.entry);
    if (state.angle !== prev.angle) {
      try {
        localStorage.setItem('lumi.angle', state.angle);
      } catch {
        /* not remembered in private mode */
      }
    }
    display.render(state, prev, key);
    if (state.entry) {
      scenery.celebrate();
      scenery.confetti($('screen'));
      sound.result();
    } else if (state.error && !prev.error) {
      scenery.dizzy();
      sound.error();
    } else if (key === 'ac') {
      sound.clear();
    } else {
      sound.key(key);
    }
  },
  history.isOpen,
  (keyEl, e) => {
    if (!keyEl.classList.contains('eq')) scenery.burst(e.clientX, e.clientY, keyEl.matches('.op, .fn') ? 4 : 3);
  },
);

display.render(state, null, null);
