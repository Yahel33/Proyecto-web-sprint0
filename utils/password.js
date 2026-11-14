const bcrypt = require('bcrypt');
const config = require('config');

const saltRounds = config.get('bcrypt.saltRounds');

async function hashPassword(password) {
  const salt_key = await bcrypt.genSalt(saltRounds);
  const password_hash = await bcrypt.hash(password, salt_key);
  return { password_hash, salt_key };
}

async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

module.exports = { hashPassword, verifyPassword };