const { api, tokenFor } = require('./helpers');
const es = require('../../locales/es.json');

describe('E2E RBAC', () => {
  let adminToken;
  let salesToken;
  let userToken;
  let adminId;
  let userId;
  let ownOrderId;
  let foreignCustomerId;
  let foreignOrderId;
  let createdProductId;

  beforeAll(async () => {
    adminToken = await tokenFor('admin');
    salesToken = await tokenFor('sales');
    userToken = await tokenFor('user');

    const adminMe = await api()
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(adminMe.status).toBe(200);
    adminId = adminMe.body.id;

    const userMe = await api()
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${userToken}`);
    expect(userMe.status).toBe(200);
    userId = userMe.body.id;

    const ordersRes = await api()
      .get('/api/orders')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(ordersRes.status).toBe(200);

    const ownOrder = ordersRes.body.data.find((order) => {
      return order.customerId
        && String(order.customerId.userId) === String(userId);
    });

    expect(ownOrder).toBeDefined();
    ownOrderId = ownOrder._id;

    const runId = Date.now();

    const customerRes = await api()
      .post('/api/customers')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId: adminId,
        email: `rbac-admin-${runId}@example.test`,
        phone: '6140000000'
      });

    expect(customerRes.status).toBe(201);
    foreignCustomerId = customerRes.body.data._id;

    const orderRes = await api()
      .post('/api/orders')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        customerId: foreignCustomerId,
        salesPersonId: adminId,
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
          changedById: adminId,
          note: 'Orden temporal de prueba RBAC'
        }]
      });

    expect(orderRes.status).toBe(201);
    foreignOrderId = orderRes.body.data._id;
  });

  afterAll(async () => {
    if (foreignOrderId) {
      const orderDeleteRes = await api()
        .delete(`/api/orders/${foreignOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(orderDeleteRes.status).toBe(200);
    }

    if (foreignCustomerId) {
      const customerDeleteRes = await api()
        .delete(`/api/customers/${foreignCustomerId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(customerDeleteRes.status).toBe(200);
    }

    if (createdProductId) {
      const productDeleteRes = await api()
        .delete(`/api/products/${createdProductId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(productDeleteRes.status).toBe(200);
    }
  });

  test('ADMIN puede eliminar un producto temporal', async () => {
    const createRes = await api()
      .post('/api/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Producto temporal RBAC ${Date.now()}`,
        description: 'Producto para prueba E2E',
        category: 'Running',
        price: 99.99
      });

    expect(createRes.status).toBe(201);
    createdProductId = createRes.body.data.id;

    const deleteRes = await api()
      .delete(`/api/products/${createdProductId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body).toHaveProperty('message', es.common.deleted);

    const verifyRes = await api()
      .get(`/api/products/${createdProductId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(verifyRes.status).toBe(404);
    createdProductId = null;
  });

  test('SALES no puede eliminar productos', async () => {
    const deleteRes = await api()
      .delete('/api/products/1')
      .set('Authorization', `Bearer ${salesToken}`);

    expect(deleteRes.status).toBe(403);
    expect(deleteRes.body).toHaveProperty('message', es.common.forbidden);

    const verifyRes = await api()
      .get('/api/products/1')
      .set('Authorization', `Bearer ${salesToken}`);

    expect(verifyRes.status).toBe(200);
  });

  test('USER puede consultar una orden de su propio cliente', async () => {
    const res = await api()
      .get(`/api/orders/${ownOrderId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', es.common.detail);
    expect(res.body.data).toHaveProperty('_id', ownOrderId);
    expect(String(res.body.data.customerId.userId)).toBe(String(userId));
  });

  test('USER no puede consultar una orden de otro cliente', async () => {
    const res = await api()
      .get(`/api/orders/${foreignOrderId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('message', es.common.forbidden);
  });

  test('USER no puede listar todas las ordenes', async () => {
    const res = await api()
      .get('/api/orders')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('message', es.common.forbidden);
  });
});