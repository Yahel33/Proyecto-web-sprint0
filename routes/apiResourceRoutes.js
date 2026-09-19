var express = require('express');

function createApiResourceRoutes(controller) {
  var router = express.Router();

  router.get('/', controller.list);
  router.get('/:id', controller.getById);
  router.post('/', controller.create);
  router.put('/:id', controller.update);
  router.delete('/:id', controller.remove);

  return router;
}

module.exports = createApiResourceRoutes;
