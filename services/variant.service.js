const { ProductVariant } = require('../models/sql');

// centraliza el acceso a ProductVariant para que api y web no repitan la consulta
module.exports = {
  findAll: (options) => ProductVariant.findAll(options),
  findByPk: (id, options) => ProductVariant.findByPk(id, options),
  create: (data) => ProductVariant.create(data)
};
