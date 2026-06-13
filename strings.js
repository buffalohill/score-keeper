const strings = {
  en: {
    appTitle: 'Score Keeper',
    teams: {
      awesome: 'Team Awesome',
      boring: 'Team Boring',
    },
    controls: {
      increase: 'Increase',
      decrease: 'Decrease',
      reset: 'Reset',
    },
    languageSwitch: 'Language',
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

const supportedLocales = ['en', 'de', 'fr'];
let locale = 'en';
