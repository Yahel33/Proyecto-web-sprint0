const { Product } = require('../models/sql');

// centraliza el acceso a Product para que api y web no repitan la consulta
module.exports = {
  findAll: (options) => Product.findAll(options),
  findByPk: (id, options) => Product.findByPk(id, options),
  create: (data) => Product.create(data)
};
