// Main app logic: scores, language switching, and click handling.
// Depends on globals from strings.js (strings, locale, supportedLocales),
// and optional hooks from sketch.js / sounds.js on window.

// --- Constants and state ---

const STORAGE_KEY = 'score-keeper-scores';       // localStorage key for saved scores
const LOCALE_STORAGE_KEY = 'score-keeper-locale'; // localStorage key for chosen language

// Live scores keyed by .team DOM elements (stable for the page lifetime).
const scores = new Map();

// --- Storage ---

// Wraps localStorage so the app still works in sandboxed previews where storage throws.
const safeStorage = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null; // preview / private mode — treat as empty
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Storage unavailable — app keeps working, just won't persist
    }
  },
};

// --- Internationalization ---

// Walk a dot-path like "controls.increase" into the strings object.
function resolveString(obj, path) {
  return path.split('.').reduce((value, key) => value?.[key], obj) ?? ''; // '' if path missing
}

// Pick saved locale, then browser language, then fall back to English.
function detectLocale() {
  const saved = safeStorage.get(LOCALE_STORAGE_KEY);
  if (saved && supportedLocales.includes(saved)) return saved; // user picked before

  const browser = navigator.language.slice(0, 2); // e.g. "de-DE" → "de"
  return supportedLocales.includes(browser) ? browser : 'en';
}

// Push the active locale's copy into every [data-string] element and the page title.
function applyStrings() {
  const copy = strings[locale]; // object for current language, e.g. strings.de
  document.documentElement.lang = locale; // updates <html lang="…"> for accessibility
  document.querySelectorAll('[data-string]').forEach((el) => {
    el.textContent = resolveString(copy, el.dataset.string); // e.g. data-string="controls.increase"
  });
  document.title = copy.appTitle;

  // Text length may change — ask sketch.js to redraw hand-drawn borders.
  if (typeof window.redrawSketchBorders === 'function') {
    window.redrawSketchBorders();
  }
}

// User clicked Language: advance en → de → fr → en and play a greeting sound.
function cycleLocale() {
  const index = supportedLocales.indexOf(locale);
  const next = supportedLocales[(index + 1) % supportedLocales.length]; // wrap around at end
  setLocale(next);
  window.playGreeting?.(locale); // only on user click, not on page load
}

function setLocale(code) {
  locale = supportedLocales.includes(code) ? code : 'en'; // guard invalid codes
  safeStorage.set(LOCALE_STORAGE_KEY, locale);
  applyStrings(); // refresh all visible text
}

// --- Scores ---

// Team h2 ids are stable across locales, so they make good storage keys.
function getTeamId(team) {
  return team.querySelector('h2').id; // e.g. "team-awesome-heading"
}

function updateScore(display, score) {
  display.textContent = score; // updates the big number on screen
}

function saveScores() {
  const data = {};
  scores.forEach((score, team) => {
    data[getTeamId(team)] = score; // { "team-awesome-heading": 3, … }
  });
  safeStorage.set(STORAGE_KEY, JSON.stringify(data));
}

function loadScores() {
  let saved = {};
  try {
    const raw = safeStorage.get(STORAGE_KEY);
    if (raw) saved = JSON.parse(raw);
  } catch {
    saved = {}; // corrupt data — start fresh
  }

  document.querySelectorAll('.team').forEach((team) => {
    const display = team.querySelector('.score');
    const score = saved[getTeamId(team)] ?? 0; // default to 0 if never saved
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

// --- Event handling ---

// One delegated listener on <main> handles every button via data-action attributes.
function handleMainClick(event) {
  // Footer: language button
  if (event.target.closest('[data-action="cycle-locale"]')) {
    cycleLocale();
    return;
  }

  // Footer: reset button
  if (event.target.closest('[data-action="reset-scores"]')) {
    resetScores();
    return;
  }

  // Team increase / decrease — closest() works even if click lands on inner <span>
  const button = event.target.closest('.team button[data-action]');
  if (!button) return;

  const team = button.closest('.team');
  const display = team.querySelector('.score');
  let score = scores.get(team) ?? 0;

  if (button.dataset.action === 'increase') {
    score += 1;
  } else if (button.dataset.action === 'decrease') {
    score = Math.max(0, score - 1); // floor at zero
  } else {
    return; // unknown action — ignore
  }

  scores.set(team, score);
  updateScore(display, score);
  saveScores();
  window.playSound?.('pencil');
}

// --- Init ---

document.addEventListener('DOMContentLoaded', () => {
  const main = document.querySelector('main');
  main.addEventListener('click', handleMainClick); // single listener for all buttons

  // Attach clicks first, then restore persisted state (no sounds on load).
  locale = detectLocale();
  applyStrings();
  loadScores();
});
