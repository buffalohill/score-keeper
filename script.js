// Team card: .team > h2, .score, .team-controls > button[data-action]

const STORAGE_KEY = 'score-keeper-scores';
const LOCALE_STORAGE_KEY = 'score-keeper-locale';
const scores = new Map();

const safeStorage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage unavailable (e.g. sandboxed preview)
    }
  },
};

function resolveString(obj, path) {
  return path.split('.').reduce((value, key) => value[key], obj);
}

function detectLocale() {
  const saved = safeStorage.get(LOCALE_STORAGE_KEY);
  if (saved && supportedLocales.includes(saved)) return saved;

  const browser = navigator.language.slice(0, 2);
  return supportedLocales.includes(browser) ? browser : 'en';
}

function applyStrings() {
  const copy = strings[locale];
  document.documentElement.lang = locale;
  document.querySelectorAll('[data-string]').forEach((el) => {
    el.textContent = resolveString(copy, el.dataset.string);
  });
  document.title = copy.appTitle;

  const languageSwitch = document.querySelector('.language-switch');
  if (languageSwitch) {
    languageSwitch.dataset.currentLocale = locale;
  }

  if (typeof window.redrawSketchBorders === 'function') {
    window.redrawSketchBorders();
  }
}

function cycleLocale() {
  const index = supportedLocales.indexOf(locale);
  const next = supportedLocales[(index + 1) % supportedLocales.length];
  setLocale(next);
  window.playGreeting?.(locale);
}

function setLocale(code) {
  locale = supportedLocales.includes(code) ? code : 'en';
  safeStorage.set(LOCALE_STORAGE_KEY, locale);
  applyStrings();
}

function getTeamId(team) {
  return team.querySelector('h2').id;
}

function updateScore(display, score) {
  display.textContent = score;
}

function saveScores() {
  const data = {};
  scores.forEach((score, team) => {
    data[getTeamId(team)] = score;
  });
  safeStorage.set(STORAGE_KEY, JSON.stringify(data));
}

function loadScores() {
  let saved = {};
  try {
    const raw = safeStorage.get(STORAGE_KEY);
    if (raw) saved = JSON.parse(raw);
  } catch {
    saved = {};
  }

  document.querySelectorAll('.team').forEach((team) => {
    const display = team.querySelector('.score');
    const score = saved[getTeamId(team)] ?? 0;
    scores.set(team, score);
    updateScore(display, score);
  });
}

function resetScores() {
  document.querySelectorAll('.team').forEach((team) => {
    const display = team.querySelector('.score');
    scores.set(team, 0);
    updateScore(display, 0);
  });
  saveScores();
  window.playSound?.('tear');
}

function handleMainClick(event) {
  if (event.target.closest('[data-action="cycle-locale"]')) {
    cycleLocale();
    return;
  }

  if (event.target.closest('[data-action="reset-scores"]')) {
    resetScores();
    return;
  }

  const button = event.target.closest('.team button[data-action]');
  if (!button) return;

  const team = button.closest('.team');
  const display = team.querySelector('.score');
  let score = scores.get(team) ?? 0;

  if (button.dataset.action === 'increase') {
    score += 1;
  } else {
    score -= 1;
  }

  scores.set(team, score);
  updateScore(display, score);
  saveScores();
  window.playSound?.('pencil');
}

document.addEventListener('DOMContentLoaded', () => {
  const main = document.querySelector('main');
  main.addEventListener('click', handleMainClick);

  locale = detectLocale();
  applyStrings();
  loadScores();
});
