jest.mock('../models/sql', () => ({
  User: { findByPk: jest.fn() },
  Role: { findByPk: jest.fn() },
  Permission: {},
  Product: { findByPk: jest.fn() },
  ProductVariant: {},
  Inventory: {}
}));

jest.mock('../models/mongo', () => ({
  Customer: { findById: jest.fn() },
  Order: {
    findById: jest.fn(),
    findByIdAndDelete: jest.fn()
  }
}));

var jwt = require('jsonwebtoken');
var request = require('supertest');
var config = require('config');
var app = require('../app');
var sql = require('../models/sql');
var mongo = require('../models/mongo');

function fakeQuery(result) {
  var query = {
    populate: jest.fn(function () { return query; }),
    then: function (resolve) { return resolve(result); }
  };
  return query;
}

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
      'orders:update:any',
      'orders:delete:any'
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

beforeEach(function () {
  jest.clearAllMocks();

  sql.User.findByPk.mockImplementation(async function (id) {
    return users[Number(id)] || null;
  });

  sql.Role.findByPk.mockImplementation(async function (id) {
    var role = roles[Number(id)];
    if (!role) return null;

    return {
      id: role.id,
      name: role.name,
      permissions: role.permissions.map(function (key) {
        return { key };
      })
    };
  });

  mongo.Customer.findById.mockResolvedValue({
    _id: 'customer-2',
    userId: 2
  });
});

describe('Autorizacion RBAC', function () {
  test('ADMIN puede eliminar cualquier producto', async function () {
    sql.Product.findByPk.mockResolvedValue({
      id: 1,
      destroy: jest.fn().mockResolvedValue()
    });

    var res = await requestAs('delete', '/api/products/1', 1).expect(200);

    expect(res.body).toHaveProperty('message', 'Registro eliminado');
  });

  test('SALES no puede eliminar productos', async function () {
    var res = await requestAs('delete', '/api/products/1', 2).expect(403);

    expect(res.body).toHaveProperty('message', 'Acceso denegado');
  });

  test('ADMIN puede eliminar cualquier orden', async function () {
    mongo.Order.findByIdAndDelete.mockResolvedValue({ _id: '2' });

    var res = await requestAs('delete', '/api/orders/2', 1).expect(200);

    expect(res.body).toHaveProperty('message', 'Registro eliminado');
    expect(res.body.data).toEqual({ id: '2' });
  });

  test('un usuario puede consultar una orden propia', async function () {
    mongo.Order.findById.mockReturnValue(fakeQuery({
      _id: '2',
      customerId: 'customer-2'
    }));

    var res = await requestAs('get', '/api/orders/2', 2).expect(200);

    expect(res.body.data).toHaveProperty('customerId', 'customer-2');
  });

  test('un usuario no puede consultar la orden de otra persona', async function () {
    mongo.Order.findById.mockReturnValue(fakeQuery({
      _id: '2',
      customerId: 'customer-2'
    }));

    var res = await requestAs('get', '/api/orders/2', 3).expect(403);

    expect(res.body).toHaveProperty('message', 'Acceso denegado');
  });

  test('un usuario sin orders:read:any no puede consultar todas las ordenes', async function () {
    var res = await requestAs('get', '/api/orders', 3).expect(403);

    expect(res.body).toHaveProperty('message', 'Acceso denegado');
  });
});