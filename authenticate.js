const { expressjwt } = require('express-jwt');
const { User } = require('../models/relationals');

function authenticate(req, res, next) {
  const { JWT_SECRET, JWT_ISSUER, JWT_AUDIENCE } = process.env;

  // Evita que la aplicación falle al cargarse si todavía no se configuró el .env.
  if (!JWT_SECRET || !JWT_ISSUER || !JWT_AUDIENCE) {
    return res.status(500).json({ message: 'Authentication is not configured' });
  }

  const verifyToken = expressjwt({
    secret: JWT_SECRET,
    algorithms: ['HS256'],
    issuer: JWT_ISSUER,
    audience: JWT_AUDIENCE
  });

  verifyToken(req, res, async function (error) {
    if (error) {
      return next(error);
    }

    try {
      const user = await User.findByPk(req.auth.sub);
      if (!user || !user.active) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      req.user = user;
      return next();
    } catch (databaseError) {
      return next(databaseError);
    }
  });
}

module.exports = authenticate;
