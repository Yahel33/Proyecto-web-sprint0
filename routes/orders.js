var createApiResourceRoutes = require('./apiResourceRoutes');
var controller = require('../controllers/orders');
var authenticate = require('../middlewares/authenticate');
var { authorize } = require('../middlewares/authorize');

function orderOwnerId(req) {
  var order = controller.findById(req.params.id);
  return order && order.userId;
}

module.exports = createApiResourceRoutes(controller, {
  list: [authenticate, authorize('orders', 'read', 'any')],
  getById: [authenticate, authorize('orders', 'read', 'own', { getOwnerId: orderOwnerId })],
  create: [authenticate, authorize('orders', 'create', 'any')],
  update: [authenticate, authorize('orders', 'update', 'own', { getOwnerId: orderOwnerId })]
});
