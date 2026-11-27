var express = require('express');
var router = express.Router();
var controller = require('../../controllers/web/store');

// Emilio: F2 inicio y catalogo
router.get('/', controller.comingSoon);
router.get('/products', controller.comingSoon);

// Emilio: F3 detalle de producto
router.get('/products/:id', controller.comingSoon);

// sin dueno asignado todavia, placeholder mientras se implementa
router.get('/cart', controller.comingSoon);
router.get('/checkout', controller.comingSoon);
router.get('/my/orders', controller.comingSoon);

// F5: confirmacion de pedido
router.get('/my/orders/:id/confirmation', controller.comingSoon);

module.exports = router;
