const sequelize = require('../../config/sequelize');
const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const RolePermission = require('./RolePermission');
const Product = require('./Product');
const ProductVariant = require('./ProductVariant');
const Inventory = require('./Inventory');

// RBAC
User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
Role.hasMany(User, { foreignKey: 'roleId', as: 'users' });

Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'roleId',
  otherKey: 'permissionId',
  as: 'permissions'
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permissionId',
  otherKey: 'roleId',
  as: 'roles'
});

// Catalogo de productos
Product.hasMany(ProductVariant, { foreignKey: 'productId', as: 'variants' });
ProductVariant.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

ProductVariant.hasOne(Inventory, { foreignKey: 'variantId', as: 'inventory' });
Inventory.belongsTo(ProductVariant, { foreignKey: 'variantId', as: 'variant' });

module.exports = {
  sequelize,
  User,
  Role,
  Permission,
  RolePermission,
  Product,
  ProductVariant,
  Inventory
};