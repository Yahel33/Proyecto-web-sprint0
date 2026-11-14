const createSqlResourceController = require('./sqlResourceController');
const { ProductVariant } = require('../models/sql');

module.exports = createSqlResourceController(ProductVariant, {
  include: [{ association: 'product' }, { association: 'inventory' }]
});