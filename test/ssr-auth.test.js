jest.mock('../models/sql', () => ({
  User: { findByPk: jest.fn(), findOne: jest.fn() },
  Role: { findByPk: jest.fn() }
}));

jest.mock('../models/mongo', () => ({}));

jest.mock('../utils/password', () => ({
  hashPassword: jest.fn(),
  verifyPassword: jest.fn()
}));

var request = require('supertest');
var app = require('../app');
var sql = require('../models/sql');
var es = require('../locales/es.json');
var en = require('../locales/en.json');
var { verifyPassword } = require('../utils/password');

var demoUser = {
  id: 1,
  roleId: 1,
  active: true,
  firstName: 'Admin',
  email: 'admin@stride.co',
  password_hash: 'hash-super-secreto',
  salt_key: 'salt-super-secreto'
};

beforeEach(function () {
  jest.clearAllMocks();
  sql.User.findByPk.mockResolvedValue(demoUser);
  sql.User.findOne.mockResolvedValue(demoUser);
  sql.Role.findByPk.mockResolvedValue({ id: 1, name: 'admin', permissions: [] });
});

describe('SSR auth (F1): login y logout', function () {
  test('GET /login responde 200 en html', async function () {
    var res = await request(app).get('/login');

    expect(res.status).toBe(200);
    expect(res.type).toBe('text/html');
    expect(res.text).toContain(es.auth.login.subtitle);
  });

  test('POST /login con datos invalidos responde 400 con errores por campo traducidos', async function () {
    var res = await request(app).post('/login').send({ email: 'no-es-un-correo', password: '' });

    expect(res.status).toBe(400);
    expect(res.text).toContain(es.auth.validation.emailInvalid);
    expect(res.text).toContain(es.auth.validation.passwordRequired);
  });

  test('POST /login con credenciales incorrectas responde 401 sin poner cookie', async function () {
    verifyPassword.mockResolvedValue(false);

    var res = await request(app).post('/login').send({ email: demoUser.email, password: 'MalaClave1' });

    expect(res.status).toBe(401);
    expect(res.text).toContain(es.auth.invalidCredentials);
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  test('POST /login con usuario inactivo responde 401 sin poner cookie', async function () {
    sql.User.findOne.mockResolvedValue({ ...demoUser, active: false });
    verifyPassword.mockResolvedValue(true);

    var res = await request(app).post('/login').send({ email: demoUser.email, password: 'Admin123' });

    expect(res.status).toBe(401);
    expect(res.headers['set-cookie']).toBeUndefined();
  });

  test('POST /login correcto responde 302 y pone la cookie access_token', async function () {
    verifyPassword.mockResolvedValue(true);

    var res = await request(app).post('/login').send({ email: demoUser.email, password: 'Admin123' });

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/admin');
    expect(res.headers['set-cookie'][0]).toMatch(/^access_token=/);
    expect(res.headers['set-cookie'][0]).toMatch(/HttpOnly/);
    expect(res.headers['set-cookie'][0]).toMatch(/SameSite=Lax/);
  });

  test('ruta protegida sin cookie ni header redirige 302 a /login con el next', async function () {
    var res = await request(app).get('/admin');

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/login?next=%2Fadmin');
  });

  test('usuario con sesion por cookie pero sin permiso responde la pagina 403', async function () {
    sql.Role.findByPk.mockResolvedValue({ id: 1, name: 'sales', permissions: [] });
    verifyPassword.mockResolvedValue(true);

    var agent = request.agent(app);
    await agent.post('/login').send({ email: demoUser.email, password: 'Admin123' });

    var res = await agent.get('/admin/products');

    expect(res.status).toBe(403);
    expect(res.type).toBe('text/html');
    expect(res.text).toContain(es.errors['403'].title);
  });

  test('POST /logout borra la cookie y redirige a la tienda', async function () {
    verifyPassword.mockResolvedValue(true);
    var agent = request.agent(app);
    await agent.post('/login').send({ email: demoUser.email, password: 'Admin123' });

    var res = await agent.post('/logout');

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe('/');
    expect(res.headers['set-cookie'][0]).toMatch(/^access_token=;/);

    var afterLogout = await agent.get('/admin');
    expect(afterLogout.status).toBe(302);
    expect(afterLogout.headers.location).toBe('/login?next=%2Fadmin');
  });

  test('la pagina de login se traduce a ingles con el selector de idioma', async function () {
    var res = await request(app).get('/login?lang=en');

    expect(res.status).toBe(200);
    expect(res.text).toContain('lang="en"');
    expect(res.text).toContain(en.auth.login.subtitle);
  });

  test('el html de login nunca expone password_hash ni salt_key', async function () {
    var res = await request(app).get('/login');

    expect(res.text).not.toContain('password_hash');
    expect(res.text).not.toContain('salt_key');
    expect(res.text).not.toContain('hash-super-secreto');
    expect(res.text).not.toContain('salt-super-secreto');
  });
});
