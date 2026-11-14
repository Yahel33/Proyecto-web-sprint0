const createMongoResourceController = require('./mongoResourceController');
const { Customer } = require('../models/mongo');

module.exports = createMongoResourceController(Customer);