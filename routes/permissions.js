var createApiResourceRoutes = require('./apiResourceRoutes');
var controller = require('../controllers/permissions');
var authenticate = require('../middlewares/authenticate');
var { authorize } = require('../middlewares/authorize');

module.exports = createApiResourceRoutes(controller, {
  list: [authenticate, authorize('permissions', 'read', 'any')],
  getById: [authenticate, authorize('permissions', 'read', 'any')],
  create: [authenticate, authorize('permissions', 'create', 'any')],
  update: [authenticate, authorize('permissions', 'update', 'any')],
  remove: [authenticate, authorize('permissions', 'delete', 'any')]
});
