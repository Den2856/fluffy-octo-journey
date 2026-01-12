import palette from './palette';

type Mode = 'light' | 'dark';

function toKebab(key: string) {
  return key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

function setVars(obj: any, path: string[] = [], root: HTMLElement = document.documentElement) {
  Object.entries(obj).forEach(([k, v]) => {
    const kk = toKebab(k);
    if (v && typeof v === 'object') {
      setVars(v, [...path, kk], root);
    } else {
      const name = `--c-${[...path, kk].join('-')}`;
      root.style.setProperty(name, String(v));
    }
  });
}

export function applyTheme(mode: Mode) {
  const root = document.documentElement;
  root.classList.toggle('dark', mode === 'dark');
  root.dataset.theme = mode;

  const { dark, ...lightPal } = palette as any;
  const pal = mode === 'dark' ? dark : lightPal;
  setVars(pal);
}

export function applyDashboardTheme() {
  const root = document.documentElement;
  root.classList.add('dark');
  root.dataset.theme = 'dashboard';

  const { d } = palette as any;
  setVars(d);
}

export function initAutoTheme() {
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  applyTheme(mq.matches ? 'dark' : 'light');
  mq.addEventListener?.('change', (e) => applyTheme(e.matches ? 'dark' : 'light'));
}

export function toggleTheme() {
  const cur = document.documentElement.dataset.theme as Mode | 'dashboard' | undefined;

  if (cur === 'dashboard') {
    applyTheme('light');
    return;
  }

  const next: Mode = cur === 'dark' ? 'light' : 'dark';
  applyTheme(next);
}

export { palette };
