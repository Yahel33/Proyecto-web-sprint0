const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');

const RolePermission = sequelize.define('RolePermission', {
  roleId: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true },
  permissionId: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true }
}, {
  tableName: 'role_permissions',
  timestamps: false
});

module.exports = RolePermission;
