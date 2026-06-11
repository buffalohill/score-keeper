// Team card: .team > h2, .score, .team-controls > button[data-action]

const scores = new Map();

function updateScore(display, score) {
  display.textContent = score;
}

function initTeam(team) {
  const display = team.querySelector('.score');
  scores.set(team, 0);
  updateScore(display, 0);
}

document.addEventListener('DOMContentLoaded', () => {
  const main = document.querySelector('main');

  document.querySelectorAll('.team').forEach(initTeam);

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
  });
});
