const { api, tokenFor } = require('./helpers');
const es = require('../../locales/es.json');
const en = require('../../locales/en.json');

describe('E2E Productos', () => {
  let adminToken;
  let createdProductId;

  beforeAll(async () => {
    adminToken = await tokenFor('admin');
  });

  afterAll(async () => {
    if (createdProductId) {
      const deleteRes = await api()
        .delete(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(200);
    }
  });

  test('ADMIN crea un producto temporal', async () => {
    const res = await api()
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Producto E2E ${Date.now()}`,
        description: 'Producto temporal para pruebas E2E',
        brand: 'Stride',
        price: 199.99
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', es.common.created);
    expect(res.body.data).toHaveProperty('id');

    createdProductId = res.body.data.id;
  });

  test('ADMIN lista y consulta el producto creado', async () => {
    const listRes = await api()
      .get('/api/products')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body).toHaveProperty('message', es.common.list);
    expect(Array.isArray(listRes.body.data)).toBe(true);
    expect(listRes.body.data.some((product) => product.id === createdProductId)).toBe(true);

    const detailRes = await api()
      .get(`/api/products/${createdProductId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(detailRes.status).toBe(200);
    expect(detailRes.body).toHaveProperty('message', es.common.detail);
    expect(detailRes.body.data).toHaveProperty('id', createdProductId);
  });

  test('ADMIN actualiza el producto creado', async () => {
    const res = await api()
      .put(`/api/products/${createdProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Producto E2E actualizado',
        price: 249.99,
        active: true
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', es.common.updated);
    expect(res.body.data).toHaveProperty('id', createdProductId);
  });

  test('datos incompletos devuelven 400 en espanol', async () => {
    const res = await api()
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', es.common.invalidData);
  });

  test('id invalido devuelve 400 en ingles', async () => {
    const res = await api()
      .get('/api/products/abc?lang=en')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', en.common.invalidId);
  });
});