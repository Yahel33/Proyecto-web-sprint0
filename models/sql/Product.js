const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');

const ProductVariant = sequelize.define('ProductVariant', {
  productId: { type: DataTypes.INTEGER, allowNull: false },
  sku: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  size: { type: DataTypes.STRING(50), allowNull: true },
  color: { type: DataTypes.STRING(50), allowNull: true },
  active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'product_variants',
  timestamps: true
});

module.exports = ProductVariant;