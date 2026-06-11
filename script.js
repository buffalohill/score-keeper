// Team card: .team > h2, .score, .team-controls > button[data-action]

const STORAGE_KEY = 'score-keeper-scores';
const scores = new Map();

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

  loadScores();

  main.addEventListener('click', (event) => {
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
