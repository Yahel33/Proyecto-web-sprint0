var createApiResourceRoutes = require('./apiResourceRoutes');
var controller = require('../controllers/orders');
var authenticate = require('../middlewares/authenticate');
var { authorize } = require('../middlewares/authorize');

async function orderOwnerId(req) {
  var order = await controller.findById(req.params.id);
  return order && order.salesPersonId;
}

module.exports = createApiResourceRoutes(controller, {
  list: [authenticate, authorize('orders', 'read', 'any')],
  getById: [authenticate, authorize('orders', 'read', 'own', { getOwnerId: orderOwnerId })],
  create: [authenticate, authorize('orders', 'create', 'any')],
  update: [authenticate, authorize('orders', 'update', 'own', { getOwnerId: orderOwnerId })]
});