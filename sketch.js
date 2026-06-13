function getToken(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

function getTokenNumber(name, fallback) {
  const value = parseFloat(getToken(name));
  return Number.isFinite(value) ? value : fallback;
}

function drawSketchBorder(element, svg, options = {}) {
  const width = element.clientWidth;
  const height = element.clientHeight;
  const inset = options.inset ?? 6;

  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.replaceChildren();

  const rsvg = rough.svg(svg);
  const node = rsvg.rectangle(inset, inset, width - inset * 2, height - inset * 2, {
    roughness: options.roughness ?? 1.6,
    bowing: options.bowing ?? 1.8,
    stroke: getToken('--sketch-stroke'),
    strokeWidth: options.strokeWidth ?? 1.6,
    fill: 'none',
  });

  svg.appendChild(node);
}

function mountSketchBorder(element, options = {}) {
  element.classList.add('sketch-frame');
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('sketch-border');
  svg.setAttribute('aria-hidden', 'true');
  element.prepend(svg);
  drawSketchBorder(element, svg, options);

  return { element, svg, options };
}

function initSketchBorders() {
  const frames = [];

  document.querySelectorAll('.team').forEach((team) => {
    frames.push(mountSketchBorder(team, {
      inset: getTokenNumber('--sketch-inset-team', 6),
      roughness: getTokenNumber('--sketch-roughness-team', 1.5),
      bowing: getTokenNumber('--sketch-bowing-team', 2),
      strokeWidth: getTokenNumber('--sketch-stroke-width-team', 2),
    }));
  });

  document.querySelectorAll('.app-footer button, .team-controls button').forEach((button) => {
    frames.push(mountSketchBorder(button, {
      inset: getTokenNumber('--sketch-inset-button', 3),
      roughness: getTokenNumber('--sketch-roughness-button', 1.2),
      bowing: getTokenNumber('--sketch-bowing-button', 1.4),
      strokeWidth: getTokenNumber('--sketch-stroke-width-button', 1.4),
    }));
  });

  return frames;
}

function redrawSketchBorders(frames) {
  frames.forEach(({ element, svg, options }) => {
    drawSketchBorder(element, svg, options);
  });
}

let sketchFrames = [];
let redrawTimer;
let redrawFrame;

function scheduleRedraw() {
  clearTimeout(redrawTimer);
  redrawTimer = setTimeout(() => {
    cancelAnimationFrame(redrawFrame);
    redrawFrame = requestAnimationFrame(() => {
      redrawSketchBorders(sketchFrames);
    });
  }, 100);
}

function startSketchBorders() {
  if (typeof rough === 'undefined') return;

  sketchFrames = initSketchBorders();

  window.addEventListener('resize', scheduleRedraw);

  const observer = new ResizeObserver(scheduleRedraw);
  sketchFrames.forEach(({ element }) => observer.observe(element));
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(startSketchBorders);
  } else {
    startSketchBorders();
  }
});

window.redrawSketchBorders = () => scheduleRedraw();
