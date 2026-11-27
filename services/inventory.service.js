const { Inventory } = require('../models/sql');

// centraliza el acceso a Inventory para que api y web no repitan la consulta
module.exports = {
  findAll: (options) => Inventory.findAll(options),
  findByPk: (id, options) => Inventory.findByPk(id, options),
  create: (data) => Inventory.create(data)
};
