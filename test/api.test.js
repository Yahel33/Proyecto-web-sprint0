jest.mock('../models/sql', () => ({
  User: { findByPk: jest.fn(), findAll: jest.fn(), create: jest.fn() },
  Role: { findByPk: jest.fn() },
  Permission: { findAll: jest.fn() },
  Product: { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn() },
  ProductVariant: { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn() },
  Inventory: { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn() }
}));

jest.mock('../models/mongo', () => ({
  Customer: { find: jest.fn(), findById: jest.fn(), create: jest.fn(), findByIdAndUpdate: jest.fn(), findByIdAndDelete: jest.fn() },
  Order: { find: jest.fn(), findById: jest.fn(), create: jest.fn(), findByIdAndUpdate: jest.fn(), findByIdAndDelete: jest.fn() }
}));

var jwt = require('jsonwebtoken');
var request = require('supertest');
var config = require('config');
var app = require('../app');
var sql = require('../models/sql');
var mongo = require('../models/mongo');

// Simula una consulta de Mongoose encadenable (find().populate()).
function fakeQuery(result) {
  var q = {
    populate: jest.fn(function () { return q; }),
    then: function (resolve) { return resolve(result); }
  };
  return q;
}

var adminToken = jwt.sign(
  { sub: '1' },
  config.get('jwt.secret'),
  {
    expiresIn: '1h',
    issuer: config.get('jwt.issuer'),
    audience: config.get('jwt.audience'),
    algorithm: 'HS256'
  }
);

function withAdminToken(requestBuilder) {
  return requestBuilder.set('Authorization', `Bearer ${adminToken}`);
}

beforeEach(function () {
  jest.clearAllMocks();
  sql.User.findByPk.mockResolvedValue({ id: 1, roleId: 1, active: true });
  sql.Role.findByPk.mockResolvedValue({
    id: 1,
    name: 'admin',
    permissions: [
      { key: 'products:read:any' },
      { key: 'products:create:any' },
      { key: 'orders:read:any' },
      { key: 'orders:create:any' }
    ]
  });
});

describe('Recursos de la API de Stride & Co.', function () {
  test('GET /health responde UP', async function () {
    var res = await request(app).get('/health').expect(200);
    expect(res.body).toHaveProperty('status', 'UP');
  });

  test('GET /api/users lista usuarios (SQL)', async function () {
    sql.User.findAll.mockResolvedValue([{ id: 1, firstName: 'Ana' }]);
    var res = await request(app).get('/api/users').expect(200);
    expect(res.body).toHaveProperty('message', 'ok');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/products lista productos (protegido)', async function () {
    sql.Product.findAll.mockResolvedValue([{ id: 1, name: 'Camiseta' }]);
    var res = await withAdminToken(request(app).get('/api/products')).expect(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('GET /api/products/:id valida id invalido', async function () {
    var res = await withAdminToken(request(app).get('/api/products/abc')).expect(400);
    expect(res.body).toHaveProperty('message', 'Id invalido');
  });

  test('GET /api/products/:id maneja inexistentes', async function () {
    sql.Product.findByPk.mockResolvedValue(null);
    var res = await withAdminToken(request(app).get('/api/products/99')).expect(404);
    expect(res.body).toHaveProperty('message', 'No encontrado');
  });

  test('GET /api/products/:id devuelve el producto', async function () {
    sql.Product.findByPk.mockResolvedValue({ id: 1, name: 'Camiseta' });
    var res = await withAdminToken(request(app).get('/api/products/1')).expect(200);
    expect(res.body.data).toHaveProperty('id', 1);
  });

  test('POST /api/products crea un producto', async function () {
    sql.Product.create.mockResolvedValue({ id: 3, name: 'Nuevo' });
    var res = await withAdminToken(request(app).post('/api/products'))
      .send({ name: 'Nuevo', price: 10 })
      .expect(201);
    expect(res.body).toHaveProperty('message', 'creado');
  });

  test('POST /api/products rechaza datos invalidos', async function () {
    var err = new Error('invalido');
    err.name = 'SequelizeValidationError';
    sql.Product.create.mockRejectedValue(err);
    var res = await withAdminToken(request(app).post('/api/products'))
      .send({})
      .expect(400);
    expect(res.body).toHaveProperty('message', 'Datos invalidos');
  });

  test('GET /api/customers lista clientes (Mongo)', async function () {
    mongo.Customer.find.mockReturnValue(fakeQuery([{ email: 'a@b.com' }]));
    var res = await request(app).get('/api/customers').expect(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('POST /api/customers crea un cliente (Mongo)', async function () {
    mongo.Customer.create.mockResolvedValue({ _id: 'abc', email: 'a@b.com' });
    var res = await request(app).post('/api/customers')
      .send({ userId: 1, email: 'a@b.com' })
      .expect(201);
    expect(res.body).toHaveProperty('message', 'creado');
  });

  test('las rutas desconocidas devuelven un 404 controlado', async function () {
    var res = await request(app).get('/api/unknown').expect(404);
    expect(res.body).toHaveProperty('message', 'Ruta no encontrada');
  });
});