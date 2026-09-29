import './styles/tokens.css';
import './styles/base.css';
import './styles/display.css';
import './styles/keys.css';
import './styles/panels.css';

import { initialState, press, loadValue } from './engine/calculator.js';
import { createDisplay } from './ui/display.js';
import { initKeypad } from './ui/keypad.js';
import { initTheme } from './ui/theme.js';
import { initHistory } from './ui/history.js';
import { initScientific } from './ui/scientific.js';

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

initTheme({ dots: document.querySelectorAll('.dot'), modeBtn: $('modeBtn'), logoSpark });
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
  },
  history.isOpen,
);

display.render(state, null, null);
