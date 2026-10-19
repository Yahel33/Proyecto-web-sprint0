const { Sequelize } = require('sequelize');

// Conexión a MYSQL
const sequelize = new Sequelize(
  // Nombre de la base de datos:
  'stride-co',
  // Usuario de la base de datos
  'root',
  // Password de la base de datos
  'abcd1234',
  {
    // host: define la dirección del servidor de la base de datos
    host: 'localhost',
    // port: El puerto en el que atiende nuestro servidor de base de datos.
    port: 3306,
    // dialect: define la base de datos que vamos a utilizar
    dialect: 'mysql',
    logging: false,
    define: {
      // Agrega automáticamente guiones bajos a los campos de los modelos
      // createdAt -> created_at, roleId -> role_id
      underscored: true
    }
  }
);

module.exports = sequelize;