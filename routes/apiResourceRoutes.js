var express = require('express');

function asArray(value) {
  return value ? (Array.isArray(value) ? value : [value]) : [];
}

function createApiResourceRoutes(controller, middleware = {}) {
  var router = express.Router();

  router.get('/', ...asArray(middleware.list), controller.list);
  router.get('/:id', ...asArray(middleware.getById), controller.getById);
  router.post('/', ...asArray(middleware.create), controller.create);
  router.put('/:id', ...asArray(middleware.update), controller.update);
  router.delete('/:id', ...asArray(middleware.remove), controller.remove);

  return router;
}

module.exports = createApiResourceRoutes;
