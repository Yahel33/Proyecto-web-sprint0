var createApiResourceRoutes = require('./apiResourceRoutes');
var controller = require('../../controllers/api/customers');
var authenticate = require('../../middlewares/authenticate');
var { authorize } = require('../../middlewares/authorize');

module.exports = createApiResourceRoutes(controller, {
  list: [authenticate, authorize('customers', 'read', 'any')],
  getById: [authenticate, authorize('customers', 'read', 'any')],
  create: [authenticate, authorize('customers', 'create', 'any')],
  update: [authenticate, authorize('customers', 'update', 'any')],
  remove: [authenticate, authorize('customers', 'delete', 'any')]
});
