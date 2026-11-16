const { api, tokenFor } = require('./helpers');
const es = require('../../locales/es.json');
const en = require('../../locales/en.json');

describe('E2E Clientes y ordenes', () => {
  let adminToken;
  let userToken;
  let userId;
  let customerId;
  let orderId;

  beforeAll(async () => {
    adminToken = await tokenFor('admin');
    userToken = await tokenFor('user');

    const userMe = await api()
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(userMe.status).toBe(200);
    userId = userMe.body.id;
  });

  afterAll(async () => {
    if (orderId) {
      const orderDeleteRes = await api()
        .delete(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(orderDeleteRes.status).toBe(200);
    }

    if (customerId) {
      const customerDeleteRes = await api()
        .delete(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(customerDeleteRes.status).toBe(200);
    }
  });

  test('ADMIN crea un cliente temporal para USER', async () => {
    const res = await api()
      .post('/api/customers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId,
        email: `cliente-e2e-${Date.now()}@example.test`,
        phone: '6140000000',
        addresses: [{
          type: 'SHIPPING',
          street: 'Av. Temporal',
          number: '1',
          city: 'Chihuahua',
          country: 'Mexico'
        }]
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', es.common.created);

    customerId = res.body.data._id;
  });

  test('ADMIN consulta y actualiza el cliente temporal', async () => {
    const detailRes = await api()
      .get(`/api/customers/${customerId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data).toHaveProperty('_id', customerId);

    const updateRes = await api()
      .put(`/api/customers/${customerId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ phone: '6141111111' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body).toHaveProperty('message', es.common.updated);
  });

  test('USER crea una orden para su propio cliente', async () => {
    const res = await api()
      .post('/api/orders')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        customerId,
        paymentMethod: 'CARD',
        totals: { subtotal: 150, shipping: 0, discount: 0, total: 150 },
        shippingAddress: {
          street: 'Av. Temporal',
          number: '1',
          city: 'Chihuahua',
          country: 'Mexico'
        },
        items: [{ productId: 1, quantity: 1, unitPrice: 150 }],
        statusHistory: [{
          status: 'PENDING',
          changedById: userId,
          note: 'Orden temporal E2E'
        }]
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', es.common.created);

    orderId = res.body.data._id;
  });

  test('USER consulta y actualiza su propia orden', async () => {
    const detailRes = await api()
      .get(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data).toHaveProperty('_id', orderId);
    expect(String(detailRes.body.data.customerId.userId)).toBe(String(userId));

    const updateRes = await api()
      .put(`/api/orders/${orderId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ paymentMethod: 'TRANSFER' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body).toHaveProperty('message', es.common.updated);
  });

  test('datos invalidos de cliente devuelven 400 en ingles', async () => {
    const res = await api()
      .post('/api/customers?lang=en')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', en.common.invalidData);
  });
});