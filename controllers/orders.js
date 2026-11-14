const createMongoResourceController = require('./mongoResourceController');
const { Order } = require('../models/mongo');

module.exports = createMongoResourceController(Order, { populate: ['customerId'] });