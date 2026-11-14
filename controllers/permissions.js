const createSqlResourceController = require('./sqlResourceController');
const { Permission } = require('../models/sql');

module.exports = createSqlResourceController(Permission);