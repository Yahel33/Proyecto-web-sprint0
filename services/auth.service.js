const { User } = require('../models/sql');
const { hashPassword, verifyPassword } = require('../utils/password');
const jwt = require('jsonwebtoken');
const config = require('config');

// crea un usuario con la contrasena hasheada, lo usan registro api y futuro alta web
async function register({ firstName, lastName, email, roleId, password }) {
  const { password_hash, salt_key } = await hashPassword(password);
  return User.create({ firstName, lastName, email, roleId, password_hash, salt_key });
}

// valida credenciales, lo reutiliza el login de la api y el login web
async function authenticate(email, password) {
  const user = await User.findOne({ where: { email } });
  if (!user || !user.active) return null;

  const passwordOk = await verifyPassword(password, user.password_hash);
  return passwordOk ? user : null;
}

function issueToken(user) {
  return jwt.sign(
    { sub: String(user.id) },
    config.get('jwt.secret'),
    {
      expiresIn: config.get('jwt.expiresIn'),
      issuer: config.get('jwt.issuer'),
      audience: config.get('jwt.audience'),
      algorithm: 'HS256'
    }
  );
}

module.exports = { register, authenticate, issueToken };
