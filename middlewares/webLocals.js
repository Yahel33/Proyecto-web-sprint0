const { accessControlForRole, accessMethod } = require('./authorize');
const { formatPrice, formatDate } = require('../utils/format');

// expone en las vistas can(), user, locale, currentPath y los formatos de precio/fecha
async function webLocals(req, res, next) {
  try {
    res.locals.__ = req.__.bind(req);
    res.locals.locale = req.getLocale();
    res.locals.currentPath = req.path;
    res.locals.user = req.user || null;
    res.locals.formatPrice = (value) => formatPrice(value, res.locals.locale);
    res.locals.formatDate = (value) => formatDate(value, res.locals.locale);

    let authorization = null;
    if (req.user && req.user.roleId) {
      authorization = await accessControlForRole(req.user.roleId);
    }

    res.locals.can = function can(resource, action, possession = 'any') {
      if (!authorization) return false;
      return authorization.ac.can(authorization.role.name)[accessMethod(action, possession)](resource).granted;
    };

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = webLocals;
