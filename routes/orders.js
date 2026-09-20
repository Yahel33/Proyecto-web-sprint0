var createApiResourceRoutes = require('./apiResourceRoutes');
var controller = require('../controllers/orders');

module.exports = createApiResourceRoutes(controller);
