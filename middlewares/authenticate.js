const { expressjwt } = require('express-jwt');
const { User } = require('../models/sql');
const config = require('config');

const verifyToken = expressjwt({
  secret: config.get('jwt.secret'),
  algorithms: ['HS256'],
  issuer: config.get('jwt.issuer'),
  audience: config.get('jwt.audience')
});

function authenticate(req, res, next) {
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
