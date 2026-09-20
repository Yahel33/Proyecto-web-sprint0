var createApiResourceRoutes = require('./apiResourceRoutes');
var controller = require('../controllers/users');

module.exports = createApiResourceRoutes(controller);
