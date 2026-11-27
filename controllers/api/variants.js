const createSqlResourceController = require('./sqlResourceController');
const variantService = require('../../services/variant.service');

module.exports = createSqlResourceController(variantService, {
  include: [{ association: 'product' }, { association: 'inventory' }]
});
