var express = require('express');
var router = express.Router();
var controller = require('../../controllers/web/admin');
var authenticate = require('../../middlewares/authenticate');
var { authorize } = require('../../middlewares/authorize');
var webLocals = require('../../middlewares/webLocals');

// toda el panel requiere sesion, refresca can()/user ya con el usuario autenticado
router.use(authenticate, webLocals);

router.get('/', controller.comingSoon);

// Yahel: F8 administracion de productos
router.get('/productos', authorize('products', 'read', 'any'), controller.comingSoon);

// sin dueno asignado todavia
router.get('/variantes', authorize('variants', 'read', 'any'), controller.comingSoon);

// Yahel: F10 inventario
router.get('/inventario', authorize('inventory', 'read', 'any'), controller.comingSoon);

// sin dueno asignado todavia
router.get('/pedidos', authorize('orders', 'read', 'any'), controller.comingSoon);
router.get('/clientes', authorize('customers', 'read', 'any'), controller.comingSoon);
router.get('/usuarios', authorize('users', 'read', 'any'), controller.comingSoon);
router.get('/roles', authorize('roles', 'read', 'any'), controller.comingSoon);

module.exports = router;
