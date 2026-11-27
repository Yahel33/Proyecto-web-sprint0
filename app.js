require('./config/validate');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

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
const i18n = require('./config/i18n');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(i18n.init);

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


// 404 controlado para rutas inexistentes.
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      message: req.__('common.unauthorized'),
      error: err.message
    });
  }
  next(err);
});

app.use(function (err, req, res, _next) {
  if (req.path.startsWith('/api')) {
    return res.status(err.status || 500).json({
      message: req.__(err.status === 404 ? 'common.routeNotFound' : 'common.serverError'),
      error: err.message
    });
  }


  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  return res.render('error');
});

module.exports = app;
