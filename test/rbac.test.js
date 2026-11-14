jest.mock('../models/sql', () => ({
  User: { findByPk: jest.fn() },
  Role: { findByPk: jest.fn() },
  Permission: {},
  Product: { findByPk: jest.fn() },
  ProductVariant: {},
  Inventory: {}
}));

jest.mock('../models/mongo', () => ({
  Customer: {},
  Order: { findById: jest.fn() }
}));

var jwt = require('jsonwebtoken');
var request = require('supertest');
var config = require('config');
var app = require('../app');
var sql = require('../models/sql');
var mongo = require('../models/mongo');

function fakeQuery(result) {
  var q = {
    populate: jest.fn(function () { return q; }),
    then: function (resolve) { return resolve(result); }
  };
  return q;
}

var users = {
  1: { id: 1, roleId: 1, active: true },
  2: { id: 2, roleId: 2, active: true },
  3: { id: 3, roleId: 3, active: true }
};

var roles = {
  1: { id: 1, name: 'admin', permissions: ['products:create:any', 'products:read:any', 'products:update:any', 'products:delete:any', 'orders:create:any', 'orders:read:any', 'orders:update:any'] },
  2: { id: 2, name: 'sales', permissions: ['products:read:any', 'orders:create:any', 'orders:read:own', 'orders:update:own'] },
  3: { id: 3, name: 'user', permissions: ['products:read:any', 'orders:create:any', 'orders:read:own', 'orders:update:own'] }
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
  return request(app)[method](path).set('Authorization', `Bearer ${tokenFor(userId)}`);
}

beforeEach(function () {
  jest.clearAllMocks();
  sql.User.findByPk.mockImplementation(async function (id) {
    return users[Number(id)] || null;
  });
  sql.Role.findByPk.mockImplementation(async function (id) {
    var r = roles[Number(id)];
    if (!r) return null;
    return {
      id: r.id,
      name: r.name,
      permissions: r.permissions.map(function (key) { return { key }; })
    };
  });
});

describe('Autorizacion RBAC', function () {
  test('ADMIN puede eliminar cualquier producto', async function () {
    sql.Product.findByPk.mockResolvedValue({ id: 1, destroy: jest.fn().mockResolvedValue() });
    var res = await requestAs('delete', '/api/products/1', 1).expect(200);
    expect(res.body).toHaveProperty('message', 'eliminado');
  });

  test('SALES no puede eliminar productos', async function () {
    var res = await requestAs('delete', '/api/products/1', 2).expect(403);
    expect(res.body).toHaveProperty('message', 'Forbidden');
  });

  test('un usuario puede consultar una orden propia', async function () {
    mongo.Order.findById.mockReturnValue(fakeQuery({ _id: '2', salesPersonId: 2 }));
    var res = await requestAs('get', '/api/orders/2', 2).expect(200);
    expect(res.body.data).toHaveProperty('salesPersonId', 2);
  });

  test('un usuario no puede consultar la orden de otra persona', async function () {
    mongo.Order.findById.mockReturnValue(fakeQuery({ _id: '2', salesPersonId: 2 }));
    var res = await requestAs('get', '/api/orders/2', 3).expect(403);
    expect(res.body).toHaveProperty('message', 'Forbidden');
  });

  test('un usuario sin orders:read:any no puede consultar todas las ordenes', async function () {
    var res = await requestAs('get', '/api/orders', 3).expect(403);
    expect(res.body).toHaveProperty('message', 'Forbidden');
  });
});