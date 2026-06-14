// Hand-drawn borders via Rough.js. Reads sketch settings from CSS tokens in tokens.css.

// --- Token helpers ---

function getToken(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); // e.g. "--sketch-stroke"
}

function getTokenNumber(name, fallback) {
  const value = parseFloat(getToken(name));
  return Number.isFinite(value) ? value : fallback; // use fallback if token missing or invalid
}

// --- Drawing ---

// Draw one wobbly rectangle inside an element, sized to its current layout box.
function drawSketchBorder(element, svg, options = {}) {
  const width = element.clientWidth;   // live pixel size after layout
  const height = element.clientHeight;
  const inset = options.inset ?? 6;    // padding inside the border

  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '100%');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`); // coordinate system matches element
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.replaceChildren(); // clear previous rough.js paths before redraw

  const rsvg = rough.svg(svg); // Rough.js helper bound to this SVG
  const node = rsvg.rectangle(inset, inset, width - inset * 2, height - inset * 2, {
    roughness: options.roughness ?? 1.6,   // how sketchy the line looks
    bowing: options.bowing ?? 1.8,         // how much lines curve
    stroke: getToken('--sketch-stroke'),   // pencil colour from tokens.css
    strokeWidth: options.strokeWidth ?? 1.6,
    fill: 'none',
  });

  svg.appendChild(node);
}

// Insert an SVG overlay as the first child and draw the initial border.
function mountSketchBorder(element, options = {}) {
  element.classList.add('sketch-frame'); // CSS positions the SVG behind content
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('sketch-border');
  svg.setAttribute('aria-hidden', 'true'); // decorative — hide from screen readers
  element.prepend(svg); // SVG goes first so text/buttons sit on top
  drawSketchBorder(element, svg, options);

  return { element, svg, options }; // kept for later redraws
}

// --- Init ---

function initSketchBorders() {
  const frames = []; // list of everything we need to redraw

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
      inset: getTokenNumber('--sketch-inset-button', 3), // buttons use tighter inset
      roughness: getTokenNumber('--sketch-roughness-button', 1.2),
      bowing: getTokenNumber('--sketch-bowing-button', 1.4),
      strokeWidth: getTokenNumber('--sketch-stroke-width-button', 1.4),
    }));
  });

  return frames;
}

function redrawSketchBorders(frames) {
  frames.forEach(({ element, svg, options }) => {
    drawSketchBorder(element, svg, options); // same options, new random wobble each time
  });
}

// --- Redraw pipeline ---

let sketchFrames = []; // populated once at startup
let redrawTimer;
let redrawFrame;

// Debounce rapid resize / locale changes, then redraw on the next animation frame.
function scheduleRedraw() {
  clearTimeout(redrawTimer);
  redrawTimer = setTimeout(() => {
    cancelAnimationFrame(redrawFrame);
    redrawFrame = requestAnimationFrame(() => {
      redrawSketchBorders(sketchFrames); // batch redraw after layout settles
    });
  }, 100);
}

function startSketchBorders() {
  if (typeof rough === 'undefined') return; // Rough.js CDN failed to load

  sketchFrames = initSketchBorders();

  window.addEventListener('resize', scheduleRedraw); // viewport changed

  const observer = new ResizeObserver(scheduleRedraw); // element size changed (e.g. longer label)
  sketchFrames.forEach(({ element }) => observer.observe(element));
}

// Wait for the hand-written font so border sizes match the final layout.
document.addEventListener('DOMContentLoaded', () => {
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(startSketchBorders); // defer until Homemade Apple has loaded
  } else {
    startSketchBorders(); // older browsers without Font Loading API
  }
});

// Called by script.js after language changes (label widths may shift).
window.redrawSketchBorders = () => scheduleRedraw();
