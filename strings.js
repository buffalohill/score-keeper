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
    },
    languageSwitch: 'Langue',
  },
};

const supportedLocales = ['en', 'de', 'fr'];
let locale = 'en';
