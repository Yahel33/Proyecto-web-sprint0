var createApiResourceRoutes = require('./apiResourceRoutes');
var controller = require('../../controllers/api/variants');
var authenticate = require('../../middlewares/authenticate');
var { authorize } = require('../../middlewares/authorize');

module.exports = createApiResourceRoutes(controller, {
  list: [authenticate, authorize('variants', 'read', 'any')],
  getById: [authenticate, authorize('variants', 'read', 'any')],
  create: [authenticate, authorize('variants', 'create', 'any')],
  update: [authenticate, authorize('variants', 'update', 'any')],
  remove: [authenticate, authorize('variants', 'delete', 'any')]
});
