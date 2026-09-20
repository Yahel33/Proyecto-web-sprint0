var createApiResourceRoutes = require('./apiResourceRoutes');
var controller = require('../controllers/permissions');

module.exports = createApiResourceRoutes(controller);
