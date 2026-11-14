jest.mock('../models/sql', () => ({
  User: { findByPk: jest.fn() },
  Role: { findByPk: jest.fn() },
  Permission: {}
}));

var jwt = require('jsonwebtoken');
var request = require('supertest');
var app = require('../app');
var { User, Role } = require('../models/sql');
var config = require('config');

var users = {
  1: { id: 1, roleId: 1, active: true },
  2: { id: 2, roleId: 2, active: true },
  3: { id: 3, roleId: 3, active: true }
};

var roles = {
  1: {
    id: 1,
    name: 'admin',
    permissions: [
      'products:create:any',
      'products:read:any',
      'products:update:any',
      'products:delete:any',
      'orders:create:any',
      'orders:read:any',
      'orders:update:any'
    ]
  },
  2: {
    id: 2,
    name: 'sales',
    permissions: [
      'products:read:any',
      'orders:create:any',
      'orders:read:own',
      'orders:update:own'
    ]
  },
  3: {
    id: 3,
    name: 'user',
    permissions: [
      'products:read:any',
      'orders:create:any',
      'orders:read:own',
      'orders:update:own'
    ]
  }
};

function tokenFor(userId) {
  return jwt.sign(
    { sub: String(userId) },
    config.get('jwt.secret'),
    {
      expiresIn: '1h',
      issuer: config.get('jwt.issuer'),
      audience: config.get('jwt.audience'),
      algorithm: 'HS256'
    }
  );
}

function requestAs(method, path, userId) {
  return request(app)[method](path)
    .set('Authorization', `Bearer ${tokenFor(userId)}`);
}

beforeEach(function() {
  User.findByPk.mockImplementation(async function(userId) {
    return users[Number(userId)] || null;
  });

  Role.findByPk.mockImplementation(async function(roleId) {
    var role = roles[Number(roleId)];
    if (!role) return null;
    return {
      id: role.id,
      name: role.name,
      permissions: role.permissions.map(function(key) {
        return { key };
      })
    };
  });
});

describe('Autorizacion RBAC', function() {
  test('ADMIN puede eliminar cualquier producto', async function() {
    var response = await requestAs('delete', '/api/products/1', 1)
      .expect(200);

    expect(response.body).toHaveProperty('message', 'products eliminado');
  });

  test('SALES no puede eliminar productos', async function() {
    var response = await requestAs('delete', '/api/products/1', 2)
      .expect(403);

    expect(response.body).toHaveProperty('message', 'Forbidden');
  });

  test('un usuario puede consultar una orden propia', async function() {
    var response = await requestAs('get', '/api/orders/2', 2)
      .expect(200);

    expect(response.body.data).toHaveProperty('id', 2);
    expect(response.body.data).toHaveProperty('userId', 2);
  });

  test('un usuario no puede consultar la orden de otra persona', async function() {
    var response = await requestAs('get', '/api/orders/2', 3)
      .expect(403);

    expect(response.body).toHaveProperty('message', 'Forbidden');
  });

  test('un usuario sin orders:read:any no puede consultar todas las ordenes', async function() {
    var response = await requestAs('get', '/api/orders', 3)
      .expect(403);

    expect(response.body).toHaveProperty('message', 'Forbidden');
  });
});
