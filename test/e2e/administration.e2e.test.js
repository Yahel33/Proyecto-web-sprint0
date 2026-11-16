const { api, tokenFor } = require('./helpers');
const es = require('../../locales/es.json');

describe('E2E Administracion', () => {
  let adminToken;
  let roleId;
  let permissionId;

  beforeAll(async () => {
    adminToken = await tokenFor('admin');
  });

  afterAll(async () => {
    if (permissionId) {
      await api()
        .delete(`/api/permissions/${permissionId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    }

    if (roleId) {
      await api()
        .delete(`/api/roles/${roleId}`)
        .set('Authorization', `Bearer ${adminToken}`);
    }
  });

  test('ADMIN crea y actualiza un rol temporal', async () => {
    const createRes = await api()
      .post('/api/roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `e2e-role-${Date.now()}`,
        description: 'Rol temporal para pruebas E2E'
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body).toHaveProperty('message', es.common.created);
    roleId = createRes.body.data.id;

    const updateRes = await api()
      .put(`/api/roles/${roleId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ description: 'Rol E2E actualizado' });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body).toHaveProperty('message', es.common.updated);
  });

  test('ADMIN crea y consulta un permiso temporal', async () => {
    const createRes = await api()
      .post('/api/permissions')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        key: `e2e-${Date.now()}:read:any`,
        description: 'Permiso temporal para pruebas E2E'
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body).toHaveProperty('message', es.common.created);
    permissionId = createRes.body.data.id;

    const detailRes = await api()
      .get(`/api/permissions/${permissionId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(detailRes.status).toBe(200);
    expect(detailRes.body.data).toHaveProperty('id', permissionId);
  });

  test('ADMIN lista roles y permisos', async () => {
    const rolesRes = await api()
      .get('/api/roles')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(rolesRes.status).toBe(200);
    expect(rolesRes.body.data.some((role) => role.id === roleId)).toBe(true);

    const permissionsRes = await api()
      .get('/api/permissions')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(permissionsRes.status).toBe(200);
    expect(permissionsRes.body.data.some((permission) => {
      return permission.id === permissionId;
    })).toBe(true);
  });

  test('ADMIN puede listar usuarios sin campos sensibles', async () => {
    const res = await api()
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);

    for (const user of res.body.data) {
      expect(user).not.toHaveProperty('password_hash');
      expect(user).not.toHaveProperty('salt_key');
    }
  });

  test('datos invalidos de rol devuelven 400', async () => {
    const res = await api()
      .post('/api/roles')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', es.common.invalidData);
  });

  test('ADMIN elimina los recursos temporales', async () => {
    const permissionDeleteRes = await api()
      .delete(`/api/permissions/${permissionId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(permissionDeleteRes.status).toBe(200);
    permissionId = null;

    const roleDeleteRes = await api()
      .delete(`/api/roles/${roleId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(roleDeleteRes.status).toBe(200);
    roleId = null;
  });
});