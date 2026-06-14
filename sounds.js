// Sound effects for score changes, language switches, and reset.
// Called from script.js via window.playSound / window.playGreeting.

// --- Sound map ---

const SOUND_FILES = {
  pencil: 'pencil-scribble.mp3',  // played on increase / decrease
  tear: 'paper-tear.mp3',         // played on reset
  greeting: {
    en: 'greeting-en.mp3',        // played when switching TO each language
    fr: 'greeting-fr.mp3',
    de: 'greeting-de.mp3',
  },
};

const SOUND_BASE = new URL('assets/sounds/', document.baseURI); // resolve paths relative to page URL
const audioCache = new Map();   // one preloaded Audio object per file
let audioUnlocked = false;      // iOS needs a user gesture before any sound plays

// --- Volume ---

function getVolume() {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--sound-volume')
    .trim();
  const value = parseFloat(raw);
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0.7; // clamp 0–1, default 0.7
}

// --- Audio cache ---

function getAudio(filename) {
  if (!audioCache.has(filename)) {
    const audio = new Audio(new URL(filename, SOUND_BASE).href);
    audio.preload = 'auto';      // start downloading early
    audio.playsInline = true;    // required for iOS inline playback
    audioCache.set(filename, audio);
  }
  return audioCache.get(filename);
}

// iOS Safari requires audio playback during a user gesture before sounds work.
function unlockAudio() {
  if (audioUnlocked) return;
  audioUnlocked = true;

  audioCache.forEach((audio) => {
    const volume = audio.volume;
    audio.volume = 0;            // silent priming play
    const playPromise = audio.play();
    if (playPromise) {
      playPromise
        .then(() => {
          audio.pause();
          audio.currentTime = 0; // rewind for real playback later
          audio.volume = volume;
        })
        .catch(() => {
          audio.volume = volume; // restore even if play was blocked
        });
    }
  });
}

// --- Playback ---

function playAudio(filename) {
  unlockAudio(); // must happen in the same click/tap as the real sound

  try {
    const audio = getAudio(filename).cloneNode(true); // fresh element — iOS ignores replay on same node
    audio.volume = getVolume();
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch(() => {}); // ignore autoplay blocks silently
    }
  } catch {
    // missing file or other error — don't break the app
  }
}

function playSound(key) {
  const filename = SOUND_FILES[key]; // 'pencil' or 'tear'
  if (filename) playAudio(filename);
}

function playGreeting(localeCode) {
  const filename = SOUND_FILES.greeting[localeCode]; // 'en', 'de', or 'fr'
  if (filename) playAudio(filename);
}

function preloadSounds() {
  Object.values(SOUND_FILES).forEach((value) => {
    if (typeof value === 'string') {
      getAudio(value); // top-level sfx files
    } else {
      Object.values(value).forEach((filename) => getAudio(filename)); // greeting files
    }
  });
}

// --- Public API ---

window.playSound = playSound;       // script.js calls this after score changes / reset
window.playGreeting = playGreeting; // script.js calls this after language switch

document.addEventListener('DOMContentLoaded', preloadSounds);
