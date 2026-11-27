function localeTag(locale) {
  return locale === 'en' ? 'en-US' : 'es-MX';
}

// precios siempre en MXN, solo cambia el formato segun el idioma activo
function formatPrice(value, locale) {
  return new Intl.NumberFormat(localeTag(locale), { style: 'currency', currency: 'MXN' }).format(value);
}

function formatDate(value, locale) {
  return new Intl.DateTimeFormat(localeTag(locale), { dateStyle: 'medium' }).format(new Date(value));
}

module.exports = { formatPrice, formatDate };
