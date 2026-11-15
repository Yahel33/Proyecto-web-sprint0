var createApiResourceRoutes = require('./apiResourceRoutes');
var controller = require('../controllers/roles');
var authenticate = require('../middlewares/authenticate');
var { authorize } = require('../middlewares/authorize');

module.exports = createApiResourceRoutes(controller, {
  list: [authenticate, authorize('roles', 'read', 'any')],
  getById: [authenticate, authorize('roles', 'read', 'any')],
  create: [authenticate, authorize('roles', 'create', 'any')],
  update: [authenticate, authorize('roles', 'update', 'any')],
  remove: [authenticate, authorize('roles', 'delete', 'any')]
});
