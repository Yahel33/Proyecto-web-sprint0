const createSqlResourceController = require('./sqlResourceController');
const productService = require('../../services/product.service');

module.exports = createSqlResourceController(productService, {
  include: [{ association: 'variants', include: [{ association: 'inventory' }] }]
});
