const createSqlResourceController = require('./sqlResourceController');
const { User } = require('../models/sql');

module.exports = createSqlResourceController(User, {
  include: [{ association: 'role' }]
});