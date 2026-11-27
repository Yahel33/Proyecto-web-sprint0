require('./config/validate');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var config = require('config');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/api/users');
var rolesRouter = require('./routes/api/roles');
var permissionsRouter = require('./routes/api/permissions');
var productsRouter = require('./routes/api/products');
var variantsRouter = require('./routes/api/variants');
var inventoryRouter = require('./routes/api/inventory');
var customersRouter = require('./routes/api/customers');
var ordersRouter = require('./routes/api/orders');
var authRouter = require('./routes/api/auth');
var webAuthRouter = require('./routes/web/auth');
var storeRouter = require('./routes/web/store');
var adminRouter = require('./routes/web/admin');
const i18n = require('./config/i18n');
const persistLocale = require('./middlewares/localeCookie');
const flash = require('./middlewares/flash');
const webLocals = require('./middlewares/webLocals');

var app = express();

// render esta detras de un proxy, lo necesita la cookie secure en produccion
app.set('trust proxy', 1);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(config.get('jwt.secret')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(i18n.init);
app.use(persistLocale);
app.use(flash);
app.use(webLocals);

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/permissions', permissionsRouter);
app.use('/api/products', productsRouter);
app.use('/api/variants', variantsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/customers', customersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/auth', authRouter);
app.use('/', webAuthRouter);
app.use('/admin', adminRouter);
app.use('/', storeRouter);


// 404 controlado para rutas inexistentes.
app.use(function (req, res, next) {
  next(createError(404));
});

// manejador central: json en /api, paginas html en el resto, sin stack en la respuesta
app.use(function (err, req, res, _next) {
  const status = err.name === 'UnauthorizedError' ? 401 : (err.status || 500);
  const isApi = req.originalUrl.startsWith('/api');

  if (status >= 500) {
    console.error(err);
  }

  if (isApi) {
    const messageKey = status === 404 ? 'common.routeNotFound'
      : status === 401 ? 'common.unauthorized'
        : status === 403 ? 'common.forbidden'
          : 'common.serverError';

    return res.status(status).json({ message: req.__(messageKey), error: err.message });
  }

  if (status === 404) {
    return res.status(404).render('errors/404');
  }

  if (status === 401 || status === 403) {
    const message = req.__(status === 401 ? 'errors.401.message' : 'errors.403.message');
    return res.status(status).render('errors/403', { status, message });
  }

  return res.status(500).render('errors/500');
});

module.exports = app;
