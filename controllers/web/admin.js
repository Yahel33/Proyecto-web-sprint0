// placeholder para pantallas del panel sin dueno asignado todavia
function comingSoon(req, res) {
  res.render('admin/proximamente', {
    pageTitle: req.__('admin.comingSoon.title'),
    title: req.__('admin.comingSoon.title'),
    description: req.__('admin.comingSoon.description')
  });
}

module.exports = { comingSoon };
