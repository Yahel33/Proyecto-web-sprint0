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

  // Catalogo en Postgres, igual al del prototipo stride_co_mockup.html
  const catalog = [
    {
      name: 'Stride Runner X',
      category: 'Running',
      brand: 'Stride-Co',
      price: 1899,
      description: 'Ligereza y amortiguacion para tus kilometros diarios.',
      variants: [
        { sku: 'RUN-X-BLK-26', size: '26', color: 'Negro', stock: 20, reserved: 2 },
        { sku: 'RUN-X-BLK-27', size: '27', color: 'Negro', stock: 13, reserved: 0 }
      ]
    },
    {
      name: 'Street Motion',
      category: 'Urbanos',
      brand: 'Stride-Co',
      price: 1499,
      description: 'Silueta urbana para uso diario.',
      variants: [
        { sku: 'STM-WHT-26', size: '26', color: 'Blanco', stock: 24, reserved: 1 },
        { sku: 'STM-WHT-27', size: '27', color: 'Blanco', stock: 17, reserved: 0 }
      ]
    },
    {
      name: 'Velocity Pro',
      category: 'Training',
      brand: 'Stride-Co',
      price: 2199,
      description: 'Estabilidad y agarre en cada entrenamiento.',
      variants: [
        { sku: 'VEL-BLU-27', size: '27', color: 'Azul', stock: 8, reserved: 0 }
      ]
    },
    {
      name: 'Everyday Lite',
      category: 'Urbanos',
      brand: 'Stride-Co',
      price: 1299,
      description: 'Comodidad sencilla para todos los dias.',
      variants: [
        { sku: 'EDL-GRY-26', size: '26', color: 'Gris', stock: 31, reserved: 0 }
      ]
    }
  ];

  const productByName = {};
  for (const item of catalog) {
    const product = await Product.create({
      name: item.name,
      category: item.category,
      brand: item.brand,
      price: item.price,
      description: item.description
    });
    productByName[item.name] = product;

    for (const variantData of item.variants) {
      const variant = await ProductVariant.create({
        productId: product.id,
        sku: variantData.sku,
        size: variantData.size,
        color: variantData.color
      });

      await Inventory.create({
        variantId: variant.id,
        stock: variantData.stock,
        reserved: variantData.reserved,
        minStock: 5,
        location: 'almacen principal'
      });
    }
  }

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

  const runnerX = productByName['Stride Runner X'];
  await Order.create({
    customerId: cliente._id,
    salesPersonId: userByEmail['sales@stride.co'].id,
    paymentMethod: 'CARD',
    totals: { subtotal: runnerX.price, shipping: 0, discount: 0, total: runnerX.price },
    shippingAddress: { street: 'Av. Principal', number: '100', city: 'Chihuahua', state: 'Chihuahua', postalCode: '31000', country: 'Mexico' },
    items: [{ productId: runnerX.id, quantity: 1, unitPrice: runnerX.price }],
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