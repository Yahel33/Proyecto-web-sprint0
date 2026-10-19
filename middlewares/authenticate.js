const { expressjwt } = require('express-jwt');
const { User } = require('../models/relationals');

const verifyToken = expressjwt({
  secret: process.env.JWT_SECRET,
  algorithms: ['HS256'],
  issuer: process.env.JWT_ISSUER,
  audience: process.env.JWT_AUDIENCE
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
