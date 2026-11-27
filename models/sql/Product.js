const { DataTypes } = require('sequelize');
const sequelize = require('../../config/sequelize');

const CATEGORIES = ['Running', 'Urbanos', 'Training'];

const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING(150), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  brand: { type: DataTypes.STRING(100), allowNull: true },
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: { isIn: [CATEGORIES] }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0 }
  },
  active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, {
  tableName: 'products',
  timestamps: true
});

Product.CATEGORIES = CATEGORIES;

module.exports = Product;