const { AccessControl } = require('accesscontrol');
const { Role, Permission } = require('../models/sql');

const validPossessions = new Set(['own', 'any']);
const validActions = new Set(['create', 'read', 'update', 'delete']);

function parsePermissionKey(key) {
  const [resource, action, possession, ...extra] = String(key).split(':');
  if (!resource || extra.length || !validActions.has(action) || !validPossessions.has(possession)) {
    return null;
  }
  return { resource, action, possession };
}

function accessMethod(action, possession) {
  return `${action}${possession[0].toUpperCase()}${possession.slice(1)}`;
}

async function accessControlForRole(roleId) {
  const role = await Role.findByPk(roleId, {
    include: [{
      model: Permission,
      as: 'permissions',
      attributes: ['key'],
      through: { attributes: [] }
    }]
  });

  if (!role) return null;

  const ac = new AccessControl();
  const grant = ac.grant(role.name);
  for (const permission of role.permissions || []) {
    const parsed = parsePermissionKey(permission.key);
    if (parsed) grant[accessMethod(parsed.action, parsed.possession)](parsed.resource);
  }

  return { ac, role };
}

function authorize(resource, action, possession, options = {}) {
  if (!validActions.has(action) || !validPossessions.has(possession)) {
    throw new Error('Invalid RBAC authorization definition');
  }

  return async function authorizeRequest(req, res, next) {
    try {
      if (!req.user || !req.user.roleId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const authorization = await accessControlForRole(req.user.roleId);
      if (!authorization) return res.status(403).json({ message: 'Forbidden' });

      const permission = authorization.ac.can(authorization.role.name)[accessMethod(action, possession)](resource);
      if (!permission.granted) return res.status(403).json({ message: 'Forbidden' });

      if (possession === 'own') {
        const ownerId = options.getOwnerId
          ? await options.getOwnerId(req)
          : req.resourceOwnerId;

        if (ownerId === undefined || ownerId === null || String(ownerId) !== String(req.user.id)) {
          return res.status(403).json({ message: 'Forbidden' });
        }
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
}

module.exports = { authorize, parsePermissionKey, accessControlForRole };
