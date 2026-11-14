const config = require('config');

// El servidor no debe arrancar sin el secreto del JWT
if (!config.has('jwt.secret') || !config.get('jwt.secret')) {
  console.error('Falta jwt.secret. Copia config/local-development.example.json como config/local-development.json y agrega un secreto.');
  process.exit(1);
}

module.exports = {};