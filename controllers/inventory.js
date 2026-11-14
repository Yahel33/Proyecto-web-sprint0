const createSqlResourceController = require('./sqlResourceController');
const { Inventory } = require('../models/sql');

module.exports = createSqlResourceController(Inventory, {
  include: [{ association: 'variant' }]
});