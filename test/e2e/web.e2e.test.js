const request = require('supertest');
const config = require('config');
const { USERS } = require('./helpers');

const baseUrl = config.get('e2e.baseUrl');

describe('E2E Web (/login, /logout)', () => {
  test('login web abre la pagina protegida, logout la vuelve a cerrar', async () => {
    const agent = request.agent(baseUrl);

    const loginRes = await agent
      .post('/login')
      .send({ email: USERS.admin.email, password: USERS.admin.password });

    expect(loginRes.status).toBe(302);
    expect(loginRes.headers.location).toBe('/admin');

    const protectedRes = await agent.get('/admin');

    expect(protectedRes.status).toBe(200);
    expect(protectedRes.type).toBe('text/html');

    const logoutRes = await agent.post('/logout');

    expect(logoutRes.status).toBe(302);
    expect(logoutRes.headers.location).toBe('/');

    const afterLogout = await agent.get('/admin');

    expect(afterLogout.status).toBe(302);
    expect(afterLogout.headers.location).toBe('/login?next=%2Fadmin');
  });
});
