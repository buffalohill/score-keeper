const SOUND_FILES = {
  pencil: 'pencil-scribble.mp3',
  tear: 'paper-tear.mp3',
  greeting: {
    en: 'greeting-en.mp3',
    fr: 'greeting-fr.mp3',
    de: 'greeting-de.mp3',
  },
};

const SOUND_BASE = new URL('assets/sounds/', document.baseURI);
const audioCache = new Map();

function getVolume() {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--sound-volume')
    .trim();
  const value = parseFloat(raw);
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0.7;
}

function getAudio(filename) {
  if (!audioCache.has(filename)) {
    const audio = new Audio(new URL(filename, SOUND_BASE).href);
    audio.preload = 'auto';
    audioCache.set(filename, audio);
  }
  return audioCache.get(filename);
}

function playAudio(filename) {
  try {
    const audio = getAudio(filename);
    audio.volume = getVolume();
    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch(() => {});
    }
  } catch {
    // Missing file or blocked playback
  }
}

function playSound(key) {
  const filename = SOUND_FILES[key];
  if (filename) playAudio(filename);
}

function playGreeting(localeCode) {
  const filename = SOUND_FILES.greeting[localeCode];
  if (filename) playAudio(filename);
}

function preloadSounds() {
  Object.values(SOUND_FILES).forEach((value) => {
    if (typeof value === 'string') {
      getAudio(value);
    } else {
      Object.values(value).forEach((filename) => getAudio(filename));
    }
  });
}

window.playSound = playSound;
window.playGreeting = playGreeting;

document.addEventListener('DOMContentLoaded', preloadSounds);
