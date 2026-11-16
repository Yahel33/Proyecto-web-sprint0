const { api, USERS } = require('./helpers');
const es = require('../../locales/es.json');
const en = require('../../locales/en.json');

describe('E2E Autenticacion (/api/auth/login)', () => {
  test('login correcto devuelve 200 y un token no vacio', async () => {
    const res = await api()
      .post('/api/auth/login')
      .send({
        email: USERS.admin.email,
        password: USERS.admin.password
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', es.auth.loginSuccessful);
    expect(res.body).toHaveProperty('token');
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.trim().length).toBeGreaterThan(0);
    expect(res.body).not.toHaveProperty('password_hash');
    expect(res.body).not.toHaveProperty('salt_key');
  });

  test('contrasena incorrecta devuelve 401 y no expone token', async () => {
    const res = await api()
      .post('/api/auth/login')
      .send({
        email: USERS.admin.email,
        password: 'WrongPassword123'
      });

    expect(res.status).toBe(401);
    expect(res.body.token).toBeUndefined();
    expect(res.body.message).toBe(es.auth.invalidCredentials);
  });

  test('contrasena incorrecta con lang=en devuelve 401 y mensaje traducido', async () => {
    const res = await api()
      .post('/api/auth/login?lang=en')
      .send({
        email: USERS.admin.email,
        password: 'WrongPassword123'
      });

    expect(res.status).toBe(401);
    expect(res.body.token).toBeUndefined();
    expect(res.body.message).toBe(en.auth.invalidCredentials);
  });

  test('credenciales faltantes devuelven 400 y no exponen token', async () => {
    const resEmpty = await api()
      .post('/api/auth/login')
      .send({});

    expect(resEmpty.status).toBe(400);
    expect(resEmpty.body).toEqual({
      message: es.auth.credentialsRequired
    });
    expect(resEmpty.body.token).toBeUndefined();

    const resNoPassword = await api()
      .post('/api/auth/login')
      .send({ email: USERS.admin.email });

    expect(resNoPassword.status).toBe(400);
    expect(resNoPassword.body).toEqual({
      message: es.auth.credentialsRequired
    });
    expect(resNoPassword.body.token).toBeUndefined();

    const resNoEmail = await api()
      .post('/api/auth/login')
      .send({ password: USERS.admin.password });

    expect(resNoEmail.status).toBe(400);
    expect(resNoEmail.body).toEqual({
      message: es.auth.credentialsRequired
    });
    expect(resNoEmail.body.token).toBeUndefined();
  });
});