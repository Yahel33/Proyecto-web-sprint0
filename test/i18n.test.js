const request = require('supertest');
const app = require('../app');
const es = require('../locales/es.json');
const en = require('../locales/en.json');

function keys(obj, prefix) {
  prefix = prefix || '';
  return Object.entries(obj).flatMap(function (entry) {
    const value = entry[1];
    if (value && typeof value === 'object') {
      return keys(value, prefix + entry[0] + '.');
    }
    return [prefix + entry[0]];
  });
}

describe('Internacionalizacion', function () {
  test('es y en tienen exactamente las mismas claves', function () {
    expect(keys(es).sort()).toEqual(keys(en).sort());
  });

  test('la API responde en espanol y en ingles', async function () {
    const respEs = await request(app).get('/api/unknown?lang=es').expect(404);
    expect(respEs.body.message).toBe('Ruta no encontrada');

    const respEn = await request(app).get('/api/unknown?lang=en').expect(404);
    expect(respEn.body.message).toBe('Route not found');
  });
});
