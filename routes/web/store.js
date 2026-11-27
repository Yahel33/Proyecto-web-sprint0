var express = require('express');
var router = express.Router();
var controller = require('../../controllers/web/store');

// Emilio: F2 inicio y catalogo
router.get('/', controller.comingSoon);
router.get('/catalogo', controller.comingSoon);

// Emilio: F3 detalle de producto
router.get('/catalogo/:id', controller.comingSoon);

// sin dueno asignado todavia, placeholder mientras se implementa
router.get('/bolsa', controller.comingSoon);
router.get('/checkout', controller.comingSoon);
router.get('/confirmacion', controller.comingSoon);
router.get('/pedidos', controller.comingSoon);

module.exports = router;
