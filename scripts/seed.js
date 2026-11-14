const mongoose = require('mongoose');
const sequelize = require('../config/sequelize');
const { connectMongo } = require('../config/mongoose');
const { Role, Permission, User, Product, ProductVariant, Inventory } = require('../models/sql');
const { Customer, Order } = require('../models/mongo');
const { hashPassword } = require('../utils/password');

const resources = ['users', 'roles', 'permissions', 'products', 'variants', 'inventory', 'customers', 'orders'];
const actions = ['create', 'read', 'update', 'delete'];

// Todos los recursos y acciones tienen su permiso registrado en la base
const anyKeys = [];
for (const resource of resources) {
  for (const action of actions) {
    anyKeys.push(`${resource}:${action}:any`);
  }
}
const ownKeys = ['orders:read:own', 'orders:update:own'];
const allKeys = [...anyKeys, ...ownKeys];

// Matriz RBAC del equipo
const rolePermissions = {
  admin: anyKeys,
  sales: [
    'products:read:any', 'variants:read:any', 'inventory:read:any',
    'customers:create:any', 'customers:read:any', 'customers:update:any',
    'orders:create:any', 'orders:read:own', 'orders:update:own'
  ],
  user: [
    'products:read:any', 'variants:read:any',
    'orders:create:any', 'orders:read:own', 'orders:update:own'
  ]
};

const demoUsers = [
  { firstName: 'Admin', lastName: 'Demo', email: 'admin@stride.co', password: 'Admin123', role: 'admin' },
  { firstName: 'Sales', lastName: 'Demo', email: 'sales@stride.co', password: 'Sales123', role: 'sales' },
  { firstName: 'User', lastName: 'Demo', email: 'user@stride.co', password: 'User123', role: 'user' }
];

async function seed() {
  await sequelize.authenticate();
  await sequelize.sync({ force: true });
  await connectMongo();

  // Permisos
  const permissionByKey = {};
  for (const key of allKeys) {
    const [permission] = await Permission.findOrCreate({ where: { key }, defaults: { description: key } });
    permissionByKey[key] = permission;
  }

  // Roles y su asignacion de permisos
  const roleByName = {};
  for (const [name, keys] of Object.entries(rolePermissions)) {
    const [role] = await Role.findOrCreate({ where: { name }, defaults: { description: `Rol ${name}` } });
    await role.setPermissions(keys.map((key) => permissionByKey[key]));
    roleByName[name] = role;
  }

  // Usuarios de demostracion, uno por rol
  const userByEmail = {};
  for (const data of demoUsers) {
    const { password_hash, salt_key } = await hashPassword(data.password);
    const user = await User.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      roleId: roleByName[data.role].id,
      password_hash,
      salt_key,
      active: true
    });
    userByEmail[data.email] = user;
  }

  // Catalogo en Postgres
  const camiseta = await Product.create({ name: 'Camiseta blanca', description: 'Camiseta de algodon', brand: 'Stride', price: 249.90 });
  const camisetaVariant = await ProductVariant.create({ productId: camiseta.id, sku: 'CAM-BLA-M', size: 'M', color: 'blanco' });
  await Inventory.create({ variantId: camisetaVariant.id, stock: 20, minStock: 5, location: 'almacen principal' });

  const tenis = await Product.create({ name: 'Tenis negros', description: 'Tenis deportivos', brand: 'Stride', price: 899.00 });
  const tenisVariant = await ProductVariant.create({ productId: tenis.id, sku: 'TEN-NEG-27', size: '27', color: 'negro' });
  await Inventory.create({ variantId: tenisVariant.id, stock: 8, minStock: 6, location: 'almacen principal' });

  // Documentos en Mongo
  await Customer.deleteMany({});
  await Order.deleteMany({});

  const cliente = await Customer.create({
    userId: userByEmail['user@stride.co'].id,
    phone: '6140000000',
    email: 'cliente@stride.co',
    addresses: [
      { type: 'SHIPPING', street: 'Av. Principal', number: '100', city: 'Chihuahua', state: 'Chihuahua', postalCode: '31000', country: 'Mexico' }
    ]
  });

  await Order.create({
    customerId: cliente._id,
    salesPersonId: userByEmail['sales@stride.co'].id,
    paymentMethod: 'CARD',
    totals: { subtotal: 249.90, shipping: 0, discount: 0, total: 249.90 },
    shippingAddress: { street: 'Av. Principal', number: '100', city: 'Chihuahua', state: 'Chihuahua', postalCode: '31000', country: 'Mexico' },
    items: [{ productId: camiseta.id, quantity: 1, unitPrice: 249.90 }],
    statusHistory: [{ status: 'PENDING', changedById: userByEmail['sales@stride.co'].id, note: 'Orden creada' }]
  });
}

async function main() {
  try {
    await seed();
    console.log('Seed completado');
  } catch (error) {
    console.error('Error en el seed:', error);
    process.exitCode = 1;
  } finally {
    await sequelize.close();
    await mongoose.connection.close();
  }
}

main();