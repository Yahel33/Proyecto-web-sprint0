const createSqlResourceController = require('./sqlResourceController');
const inventoryService = require('../../services/inventory.service');

module.exports = createSqlResourceController(inventoryService, {
  include: [{ association: 'variant' }]
});
