const i18n = require('../config/i18n');

const LOCALE_COOKIE = 'lang';
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

// guarda en una cookie el idioma pedido por query para que las siguientes peticiones sin query (incluidos los post) lo mantengan
function persistLocale(req, res, next) {
  const requested = req.query.lang;
  if (typeof requested === 'string' && i18n.getLocales().includes(requested)) {
    res.cookie(LOCALE_COOKIE, requested, { path: '/', maxAge: ONE_YEAR_MS });
  }
  next();
}

module.exports = persistLocale;
