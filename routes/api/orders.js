var createApiResourceRoutes = require('./apiResourceRoutes');
var controller = require('../../controllers/api/orders');
var { Customer } = require('../../models/mongo');
var authenticate = require('../../middlewares/authenticate');
var { authorize } = require('../../middlewares/authorize');

async function orderOwnerId(req) {
  var order = await controller.findById(req.params.id);
  if (!order || !order.customerId) return null;

  var customerId = order.customerId._id || order.customerId;
  var customer = await Customer.findById(customerId);

  return customer && customer.userId;
}

module.exports = createApiResourceRoutes(controller, {
  list: [authenticate, authorize('orders', 'read', 'any')],
  getById: [authenticate, authorize('orders', 'read', 'own', { getOwnerId: orderOwnerId })],
  create: [authenticate, authorize('orders', 'create', 'any')],
  update: [authenticate, authorize('orders', 'update', 'own', { getOwnerId: orderOwnerId })],
  remove: [authenticate, authorize('orders', 'delete', 'any')]
});
