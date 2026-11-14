const { Sequelize } = require('sequelize');
const config = require('config');

const sqlConfig = config.get('database.sql');

const sequelize = new Sequelize(
  sqlConfig.name,
  sqlConfig.user,
  sqlConfig.password,
  {
    host: sqlConfig.host,
    port: sqlConfig.port,
    dialect: sqlConfig.dialect,
    logging: false,
    define: {
      underscored: true
    }
  }
);

module.exports = sequelize;