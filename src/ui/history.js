// Calculation history: a slide-down sheet, saved on the device.
import { expressionText, formatResult } from '../engine/format.js';
import { cascade } from './effects.js';

const STORAGE_KEY = 'lumi.history';
const MAX_ITEMS = 100;

function load() {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(items) ? items.filter((it) => typeof it?.e === 'string' && Number.isFinite(it?.r)) : [];
  } catch {
    return [];
  }
}

export function initHistory({ app, openBtn, panel, list, empty, clearBtn, closeBtn }, onPick) {
  let items = load();

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage full or blocked */
    }
  }

  function renderList() {
    list.replaceChildren(
      ...items.map((item, i) => {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.className = 'h-item';
        btn.dataset.i = i;
        const expr = document.createElement('span');
        expr.className = 'h-expr';
        expr.textContent = item.e;
        const res = document.createElement('span');
        res.className = 'h-res';
        res.textContent = formatResult(item.r);
        btn.append(expr, res);
        li.append(btn);
        return li;
      }),
    );
    empty.hidden = items.length > 0;
    clearBtn.hidden = items.length === 0;
  }

  const isOpen = () => app.classList.contains('history-open');

  function open() {
    renderList();
    list.scrollTop = 0;
    app.classList.add('history-open');
    panel.inert = false;
    openBtn.setAttribute('aria-expanded', 'true');
    cascade(list.querySelectorAll('li:nth-child(-n + 8)'), 30);
  }

  function close() {
    app.classList.remove('history-open');
    panel.inert = true;
    openBtn.setAttribute('aria-expanded', 'false');
  }

  openBtn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  clearBtn.addEventListener('click', () => {
    items = [];
    save();
    renderList();
  });
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('.h-item');
    if (!btn) return;
    onPick(items[Number(btn.dataset.i)].r);
    close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) close();
  });

  return {
    add(entry) {
      items.unshift({ e: expressionText(entry.tokens), r: entry.value });
      if (items.length > MAX_ITEMS) items.length = MAX_ITEMS;
      save();
    },
    isOpen,
  };
}
