const createSqlResourceController = require('./sqlResourceController');
const { Role } = require('../models/sql');

module.exports = createSqlResourceController(Role, {
  include: [{ association: 'permissions' }]
});