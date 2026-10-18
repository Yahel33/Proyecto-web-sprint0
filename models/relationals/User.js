const {DataTypes} = require('sequelize');
const sequelize = require('../../config/sequelize');

const User = sequelize.define('User',{
    firstName: {type: DataTypes.STRING(100), allowNull: false}, 
    lastName: {type: DataTypes.STRING(100), allowNull: false},
    email: {type: DataTypes.STRING(150), allowNull: false, unique: true},
    active: {type: DataTypes.BOOLEAN, defaultValue: true},
    roleId: {type: DataTypes.INTEGER, allowNull: true},
    password_hash: {type: DataTypes.STRING(100), allowNull: false},
    salt_key: {type: DataTypes.STRING(100), allowNull: false}
},{
    tableName: 'users',
    timestamps: true, //-> created_at y updated_at
});

User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password_hash;
    delete values.salt_key;
    return values;
};

module.exports = User;