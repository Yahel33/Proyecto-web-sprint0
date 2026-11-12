const { sequelize, Role, Permission } = require('../models/relationals');

const rolePermissions = {
  admin: [
    'products:create:any', 'products:read:any', 'products:update:any', 'products:delete:any',
    'orders:create:any', 'orders:read:any', 'orders:update:any'
  ],
  sales: [
    'products:read:any', 'orders:create:any', 'orders:read:own', 'orders:update:own'
  ],
  user: [
    'products:read:any', 'orders:create:any', 'orders:read:own', 'orders:update:own'
  ]
};

async function seedRbac() {
  for (const [roleName, permissionKeys] of Object.entries(rolePermissions)) {
    const [role] = await Role.findOrCreate({
      where: { name: roleName },
      defaults: { description: `Rol ${roleName}` }
    });
    const permissions = [];
    for (const key of permissionKeys) {
      const [permission] = await Permission.findOrCreate({
        where: { key },
        defaults: { description: key }
      });
      permissions.push(permission);
    }
    await role.setPermissions(permissions);
  }
}

async function main() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    await seedRbac();
    console.log('RBAC seed completed');
  } finally {
    await sequelize.close();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = { seedRbac, rolePermissions };
