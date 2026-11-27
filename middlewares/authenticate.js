const { expressjwt } = require('express-jwt');
const { User } = require('../models/sql');
const config = require('config');

// el token llega por el header Authorization (api) o por la cookie access_token (web)
function getToken(req) {
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    return req.headers.authorization.split(' ')[1];
  }
  if (req.cookies && req.cookies.access_token) {
    return req.cookies.access_token;
  }
  return undefined;
}

const verifyToken = expressjwt({
  secret: config.get('jwt.secret'),
  algorithms: ['HS256'],
  issuer: config.get('jwt.issuer'),
  audience: config.get('jwt.audience'),
  getToken
});

// en /api responde 401 json como antes, en web redirige a login con la ruta pedida
function rejectUnauthenticated(req, res) {
  if (req.originalUrl.startsWith('/api')) {
    return res.status(401).json({ message: req.__('common.unauthorized') });
  }
  return res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
}

function authenticate(req, res, next) {
  verifyToken(req, res, async function (error) {
    if (error) {
      if (req.originalUrl.startsWith('/api')) {
        return next(error);
      }
      return rejectUnauthenticated(req, res);
    }

    try {
      const user = await User.findByPk(req.auth.sub);
      if (!user || !user.active) {
        return rejectUnauthenticated(req, res);
      }

      req.user = user;
      return next();
    } catch (databaseError) {
      return next(databaseError);
    }
  });
}

module.exports = authenticate;
