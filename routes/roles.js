var createApiResourceRoutes = require('./apiResourceRoutes');
var controller = require('../controllers/roles');

module.exports = createApiResourceRoutes(controller);
