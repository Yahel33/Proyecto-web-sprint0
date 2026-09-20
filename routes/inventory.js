var createApiResourceRoutes = require('./apiResourceRoutes');
var controller = require('../controllers/inventory');

module.exports = createApiResourceRoutes(controller);
