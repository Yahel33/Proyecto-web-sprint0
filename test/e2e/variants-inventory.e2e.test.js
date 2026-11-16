const { api, tokenFor } = require('./helpers');
const es = require('../../locales/es.json');
const en = require('../../locales/en.json');

describe('E2E Variantes e inventario', () => {
  let adminToken;
  let productId;
  let variantId;
  let inventoryId;

  beforeAll(async () => {
    adminToken = await tokenFor('admin');
  });

  afterAll(async () => {
    if (inventoryId) {
      await api()
        .delete(`/api/inventory/${inventoryId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    }

    if (variantId) {
      await api()
        .delete(`/api/variants/${variantId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    }

    if (productId) {
      await api()
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    }
  });

  test('ADMIN crea un producto temporal y su variante', async () => {
    const runId = Date.now();

    const productRes = await api()
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Producto variante E2E ${runId}`,
        description: 'Producto temporal para variante e inventario',
        price: 300
      });

    expect(productRes.status).toBe(201);
    productId = productRes.body.data.id;

    const variantRes = await api()
      .post('/api/variants')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        productId,
        sku: `E2E-${runId}`,
        size: 'M',
        color: 'Azul'
      });

    expect(variantRes.status).toBe(201);
    expect(variantRes.body).toHaveProperty('message', es.common.created);
    variantId = variantRes.body.data.id;
  });

  test('ADMIN consulta y actualiza la variante', async () => {
    const listRes = await api()
      .get('/api/variants')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.some((variant) => variant.id === variantId)).toBe(true);

    const detailRes = await api()
      .get(`/api/variants/${variantId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data).toHaveProperty('id', variantId);

    const updateRes = await api()
      .put(`/api/variants/${variantId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ color: 'Negro' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body).toHaveProperty('message', es.common.updated);
  });

  test('ADMIN crea inventario para la variante', async () => {
    const res = await api()
      .post('/api/inventory')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        variantId,
        stock: 10,
        minStock: 2,
        location: 'Bodega E2E'
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', es.common.created);
    inventoryId = res.body.data.id;
  });

  test('ADMIN consulta y actualiza el inventario', async () => {
    const listRes = await api()
      .get('/api/inventory')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(listRes.status).toBe(200);
    expect(listRes.body.data.some((item) => item.id === inventoryId)).toBe(true);

    const detailRes = await api()
      .get(`/api/inventory/${inventoryId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data).toHaveProperty('id', inventoryId);

    const updateRes = await api()
      .put(`/api/inventory/${inventoryId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ stock: 25 });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body).toHaveProperty('message', es.common.updated);
  });

  test('inventario invalido e id invalido devuelven errores traducidos', async () => {
    const invalidDataRes = await api()
      .post('/api/inventory')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        variantId,
        stock: -1,
        minStock: 0
      });

    expect(invalidDataRes.status).toBe(400);
    expect(invalidDataRes.body).toHaveProperty('message', es.common.invalidData);

    const invalidIdRes = await api()
      .get('/api/variants/abc?lang=en')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(invalidIdRes.status).toBe(400);
    expect(invalidIdRes.body).toHaveProperty('message', en.common.invalidId);
  });

  test('ADMIN elimina los recursos temporales', async () => {
    const inventoryDeleteRes = await api()
      .delete(`/api/inventory/${inventoryId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(inventoryDeleteRes.status).toBe(200);
    inventoryId = null;

    const variantDeleteRes = await api()
      .delete(`/api/variants/${variantId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(variantDeleteRes.status).toBe(200);
    variantId = null;

    const productDeleteRes = await api()
      .delete(`/api/products/${productId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(productDeleteRes.status).toBe(200);
    productId = null;
  });
});