var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var rolesRouter = require('./routes/roles');
var permissionsRouter = require('./routes/permissions');
var productsRouter = require('./routes/products');
var variantsRouter = require('./routes/variants');
var inventoryRouter = require('./routes/inventory');
var customersRouter = require('./routes/customers');
var ordersRouter = require('./routes/orders');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/roles', rolesRouter);
app.use('/api/permissions', permissionsRouter);
app.use('/api/products', productsRouter);
app.use('/api/variants', variantsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/customers', customersRouter);
app.use('/api/orders', ordersRouter);

// 404 controlado para rutas inexistentes.
app.use(function (req, res, next) {
  next(createError(404));
});

app.use(function (err, req, res, _next) {
  if (req.path.startsWith('/api')) {
    return res.status(err.status || 500).json({
      message: err.status === 404 ? 'Ruta no encontrada' : 'Error del servidor',
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
