const { api, tokenFor } = require('./helpers');

describe('E2E health y auth', () => {
  test('GET /health responde UP', async () => {
    const res = await api().get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'UP');
  });

  test('login correcto devuelve token', async () => {
    const token = await tokenFor('admin');

    expect(typeof token).toBe('string');
    expect(token.length).toBeGreaterThan(10);
  });

  test('ruta protegida sin token responde 401', async () => {
    const res = await api().get('/api/products');

    expect(res.status).toBe(401);
  });
});