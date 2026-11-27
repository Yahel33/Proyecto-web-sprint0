// placeholder para pantallas de la tienda sin dueno asignado todavia
function comingSoon(req, res) {
  res.render('store/proximamente', {
    title: req.__('store.comingSoon.title'),
    description: req.__('store.comingSoon.description')
  });
}

module.exports = { comingSoon };
