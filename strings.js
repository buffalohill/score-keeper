// UI copy for all supported languages.
// HTML elements use data-string="dot.path" to look up text here (see script.js applyStrings).

const strings = {
  en: {
    appTitle: 'Score Keeper',           // <title> and <h1 data-string="appTitle">
    teams: {
      awesome: 'Team Awesome',            // h2 data-string="teams.awesome"
      boring: 'Team Boring',              // h2 data-string="teams.boring"
    },
    controls: {
      increase: 'Increase',             // button span data-string="controls.increase"
      decrease: 'Decrease',
      reset: 'Reset',                     // footer reset button
    },
    languageSwitch: 'Language',         // footer language button label
  },
  de: {
    appTitle: 'Punktestand',
    teams: {
      awesome: 'Team Fantastisch',
      boring: 'Team Langweilig',
    },
    controls: {
      increase: 'Erhöhen',
      decrease: 'Verringern',
      reset: 'Zurücksetzen',
    },
    languageSwitch: 'Sprache',
  },
  fr: {
    appTitle: 'Tableau de score',
    teams: {
      awesome: 'Équipe Géniale',
      boring: 'Équipe Ennuyeuse',
    },
    controls: {
      increase: 'Augmenter',
      decrease: 'Diminuer',
      reset: 'Réinitialiser',
    },
    languageSwitch: 'Langue',
  },
};

// Order determines the Language button cycle: en → de → fr → en.
const supportedLocales = ['en', 'de', 'fr'];

// Active locale; read and updated by script.js (starts as 'en' until detectLocale runs).
let locale = 'en';
