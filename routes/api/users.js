var createApiResourceRoutes = require('./apiResourceRoutes');
var controller = require('../../controllers/api/users');
var authenticate = require('../../middlewares/authenticate');
var { authorize } = require('../../middlewares/authorize');

module.exports = createApiResourceRoutes(controller, {
  list: [authenticate, authorize('users', 'read', 'any')],
  getById: [authenticate, authorize('users', 'read', 'any')],
  create: [authenticate, authorize('users', 'create', 'any')],
  update: [authenticate, authorize('users', 'update', 'any')],
  remove: [authenticate, authorize('users', 'delete', 'any')]
});
