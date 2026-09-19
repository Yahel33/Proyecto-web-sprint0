var createApiResourceRoutes = require('./apiResourceRoutes');
var controller = require('../controllers/customers');

module.exports = createApiResourceRoutes(controller);
