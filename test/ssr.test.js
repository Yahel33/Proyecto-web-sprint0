jest.mock('../models/sql', () => ({
  User: { findByPk: jest.fn() },
  Role: { findByPk: jest.fn() }
}));

jest.mock('../models/mongo', () => ({}));

var jwt = require('jsonwebtoken');
var config = require('config');
var request = require('supertest');
var app = require('../app');
var sql = require('../models/sql');
var es = require('../locales/es.json');
var en = require('../locales/en.json');

function adminToken() {
  return jwt.sign(
    { sub: '1' },
    config.get('jwt.secret'),
    {
      expiresIn: '1h',
      issuer: config.get('jwt.issuer'),
      audience: config.get('jwt.audience'),
      algorithm: 'HS256'
    }
  );
}

beforeEach(function () {
  jest.clearAllMocks();
  sql.User.findByPk.mockResolvedValue({
    id: 1,
    roleId: 1,
    active: true,
    firstName: 'Admin',
    password_hash: 'hash-super-secreto',
    salt_key: 'salt-super-secreto'
  });
  sql.Role.findByPk.mockResolvedValue({ id: 1, name: 'admin', permissions: [] });
});

describe('Base SSR', function () {
  test('404 en una ruta web responde HTML con codigo 404', async function () {
    var res = await request(app).get('/esto-no-existe');

    expect(res.status).toBe(404);
    expect(res.type).toBe('text/html');
    expect(res.text).toContain(es.errors['404'].title);
  });

  test('404 en /api sigue respondiendo json', async function () {
    var res = await request(app).get('/api/esto-no-existe');

    expect(res.status).toBe(404);
    expect(res.type).toMatch(/json/);
    expect(res.body).toHaveProperty('message', es.common.routeNotFound);
  });

  test('error 500 en una ruta web responde HTML sin mostrar el stack', async function () {
    sql.User.findByPk.mockRejectedValue(new Error('fallo de base de datos'));

    var res = await request(app)
      .get('/admin')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(500);
    expect(res.type).toBe('text/html');
    expect(res.text).toContain(es.errors['500'].title);
    expect(res.text).not.toContain('fallo de base de datos');
    expect(res.text).not.toContain('.js:');
  });

  test('ruta web protegida sin permiso responde la pagina 403', async function () {
    sql.Role.findByPk.mockResolvedValue({ id: 1, name: 'sales', permissions: [] });

    var res = await request(app)
      .get('/admin/products')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(403);
    expect(res.type).toBe('text/html');
    expect(res.text).toContain(es.errors['403'].title);
  });

  test('el selector de idioma cambia el html de la tienda a ingles', async function () {
    var res = await request(app).get('/?lang=en');

    expect(res.status).toBe(200);
    expect(res.text).toContain('lang="en"');
    expect(res.text).toContain(en.store.comingSoon.title);
  });

  test('una pagina web con sesion nunca expone password_hash ni salt_key', async function () {
    var res = await request(app)
      .get('/admin')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.text).not.toContain('password_hash');
    expect(res.text).not.toContain('salt_key');
    expect(res.text).not.toContain('hash-super-secreto');
    expect(res.text).not.toContain('salt-super-secreto');
  });

  test('el idioma elegido con ?lang=es se mantiene en el siguiente post sin query', async function () {
    var agent = request.agent(app);
    await agent.get('/login?lang=es');

    var res = await agent.post('/login').send({ email: 'no-es-email', password: '' });

    expect(res.status).toBe(400);
    expect(res.text).toContain(es.auth.validation.emailInvalid);
  });

  test('el idioma elegido con ?lang=en se mantiene en el siguiente post sin query', async function () {
    var agent = request.agent(app);
    await agent.get('/login?lang=en');

    var res = await agent.post('/login').send({ email: 'no-es-email', password: '' });

    expect(res.status).toBe(400);
    expect(res.text).toContain(en.auth.validation.emailInvalid);
  });
});
