const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');

const Inventory = sequelize.define('Inventory', {
  variantId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 }
  },
  minStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: { min: 0 }
  },
  location: { type: DataTypes.STRING(100), allowNull: true }
}, {
  tableName: 'inventory',
  timestamps: true
});

module.exports = Inventory;