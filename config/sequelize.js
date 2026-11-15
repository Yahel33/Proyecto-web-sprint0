const { Sequelize } = require('sequelize');
const config = require('config');

const sqlConfig = config.get('database.sql');

const options = {
  host: sqlConfig.host,
  port: sqlConfig.port,
  dialect: sqlConfig.dialect,
  logging: false,
  define: { underscored: true }
};

if (sqlConfig.ssl) {
  options.dialectOptions = {
    ssl: { require: true, rejectUnauthorized: false }
  };
}

const sequelize = new Sequelize(
  sqlConfig.name,
  sqlConfig.user,
  sqlConfig.password,
  options
);

module.exports = sequelize;