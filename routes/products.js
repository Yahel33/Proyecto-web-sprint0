var createApiResourceRoutes = require('./apiResourceRoutes');
var controller = require('../controllers/products');
var authenticate = require('../middlewares/authenticate');
var { authorize } = require('../middlewares/authorize');

module.exports = createApiResourceRoutes(controller, {
  list: [authenticate, authorize('products', 'read', 'any')],
  getById: [authenticate, authorize('products', 'read', 'any')],
  create: [authenticate, authorize('products', 'create', 'any')],
  update: [authenticate, authorize('products', 'update', 'any')],
  remove: [authenticate, authorize('products', 'delete', 'any')]
});
