var createApiResourceRoutes = require('./apiResourceRoutes');
var controller = require('../../controllers/api/inventory');
var authenticate = require('../../middlewares/authenticate');
var { authorize } = require('../../middlewares/authorize');

module.exports = createApiResourceRoutes(controller, {
  list: [authenticate, authorize('inventory', 'read', 'any')],
  getById: [authenticate, authorize('inventory', 'read', 'any')],
  create: [authenticate, authorize('inventory', 'create', 'any')],
  update: [authenticate, authorize('inventory', 'update', 'any')],
  remove: [authenticate, authorize('inventory', 'delete', 'any')]
});
