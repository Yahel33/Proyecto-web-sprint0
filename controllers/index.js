const { Product } = require('../models/sql');

function healthCheck(req, res) {
  res.status(200).json({
    status: 'UP'
  });
}

// Pagina de inicio con 4 productos destacados
async function home(req, res, next) {
  try {
    const products = await Product.findAll({ where: { active: true }, limit: 4 });
    res.render('index', { title: 'Stride & Co.', products });
  } catch (err) {
    next(err);
  }
}

// Catalogo con todos los productos
async function catalog(req, res, next) {
  try {
    const products = await Product.findAll({ where: { active: true } });
    res.render('products', { title: 'Catalogo | Stride & Co.', products });
  } catch (err) {
    next(err);
  }
}

module.exports = { healthCheck, home, catalog };
