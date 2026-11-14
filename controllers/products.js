const createSqlResourceController = require('./sqlResourceController');
const { Product } = require('../models/sql');

module.exports = createSqlResourceController(Product, {
  include: [{ association: 'variants', include: [{ association: 'inventory' }] }]
});