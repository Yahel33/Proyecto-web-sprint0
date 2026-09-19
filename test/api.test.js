var request = require('supertest');
var app = require('../app');

var resources = [
  'users',
  'roles',
  'permissions',
  'products',
  'variants',
  'inventory',
  'customers',
  'orders'
];

describe('Recursos de la API de Stride & Co.', function() {
  test.each(resources)('GET /api/%s responde con datos de prueba', async function(resource) {
    var response = await request(app)
      .get(`/api/${resource}`)
      .expect(200);

    expect(response.body).toHaveProperty('message', `Listado de ${resource}`);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('GET /api/products/:id responde con un registro de prueba', async function() {
    var response = await request(app)
      .get('/api/products/1')
      .expect(200);

    expect(response.body).toHaveProperty('message', 'Detalle de products');
    expect(response.body.data).toHaveProperty('id', 1);
    expect(response.body.data).toHaveProperty('nombre', 'Camiseta blanca');
  });

  test('GET /api/products/:id valida parametros incorrectos', async function() {
    var response = await request(app)
      .get('/api/products/abc')
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Id invalido para products');
  });

  test('GET /api/products/:id maneja recursos inexistentes', async function() {
    var response = await request(app)
      .get('/api/products/99')
      .expect(404);

    expect(response.body).toHaveProperty('message', 'products no encontrado');
  });

  test('POST /api/orders valida cuerpos vacios', async function() {
    var response = await request(app)
      .post('/api/orders')
      .send({})
      .expect(400);

    expect(response.body).toHaveProperty('message', 'Datos incompletos para orders');
  });

  test('POST /api/orders responde con una orden de prueba', async function() {
    var response = await request(app)
      .post('/api/orders')
      .send({ customerId: 1 })
      .expect(201);

    expect(response.body).toHaveProperty('message', 'orders creado');
    expect(response.body.data).toHaveProperty('customerId', 1);
  });

  test('PUT /api/inventory/:id responde con inventario actualizado', async function() {
    var response = await request(app)
      .put('/api/inventory/2')
      .send({ cantidad: 10 })
      .expect(200);

    expect(response.body).toHaveProperty('message', 'inventory actualizado');
    expect(response.body.data).toHaveProperty('cantidad', 10);
  });

  test('DELETE /api/customers/:id responde con cliente eliminado', async function() {
    var response = await request(app)
      .delete('/api/customers/3')
      .expect(200);

    expect(response.body).toHaveProperty('message', 'customers eliminado');
    expect(response.body.data).toHaveProperty('eliminado', true);
  });

  test('las rutas desconocidas de la API devuelven un 404 controlado', async function() {
    var response = await request(app)
      .get('/api/unknown')
      .expect(404);

    expect(response.body).toHaveProperty('message', 'Ruta no encontrada');
  });
});
