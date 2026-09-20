var createApiResourceRoutes = require('./apiResourceRoutes');
var controller = require('../controllers/products');

module.exports = createApiResourceRoutes(controller);
