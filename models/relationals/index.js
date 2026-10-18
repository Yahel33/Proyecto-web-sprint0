const sequelize = require('../../config/sequelize');
const User = require('./User');

// La autenticacion solo necesita el modelo User. Las relaciones de roles y
// permisos se agregaran en la actividad posterior de RBAC.
module.exports = {sequelize, User};
