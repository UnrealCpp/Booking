// const i18next = require('i18next');
// const Backend = require('i18next-node-fs-backend');
// const i18nextMiddleware = require('i18next-http-middleware');

// i18next
//     .use(Backend)
//     .use(i18nextMiddleware.LanguageDetector)
//     .init({
//       debug: false,
//         backend: {
//             loadPath: __dirname + '/resources/locales/{{lng}}/{{ns}}.json'
//         },
//         fallbackLng: 'en',
//         preload: ['en','de','tr']
//     });

//     module.exports = i18next;

module.exports = {
  i18n: {
    debug: false,
      backend: {
          loadPath: __dirname + '/resources/locales/{{lng}}/{{ns}}.json'
      },
      fallbackLng: 'de',
      preload: ['en','de','tr','es','ar','ru-RU','fr']
  }
}