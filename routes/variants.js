var createApiResourceRoutes = require('./apiResourceRoutes');
var controller = require('../controllers/variants');

module.exports = createApiResourceRoutes(controller);
