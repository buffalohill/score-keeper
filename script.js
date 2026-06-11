// Team card: .team > h2, .score, .team-controls > button[data-action]

const STORAGE_KEY = 'score-keeper-scores';
const LOCALE_STORAGE_KEY = 'score-keeper-locale';
const scores = new Map();

function resolveString(obj, path) {
  return path.split('.').reduce((value, key) => value[key], obj);
}

function detectLocale() {
  const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
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
}

function cycleLocale() {
  const index = supportedLocales.indexOf(locale);
  const next = supportedLocales[(index + 1) % supportedLocales.length];
  setLocale(next);
}

function setLocale(code) {
  locale = supportedLocales.includes(code) ? code : 'en';
  localStorage.setItem(LOCALE_STORAGE_KEY, locale);
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
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function loadScores() {
  let saved = {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
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

document.addEventListener('DOMContentLoaded', () => {
  const main = document.querySelector('main');

  locale = detectLocale();
  applyStrings();
  loadScores();

  main.addEventListener('click', (event) => {
    if (event.target.closest('[data-action="cycle-locale"]')) {
      cycleLocale();
      return;
    }

    const button = event.target.closest('.team button[data-action]');
    if (!button) return;

    const team = button.closest('.team');
    const display = team.querySelector('.score');
    let score = scores.get(team);

    if (button.dataset.action === 'increase') {
      score += 1;
    } else {
      score -= 1;
    }

    scores.set(team, score);
    updateScore(display, score);
    saveScores();
  });
});
