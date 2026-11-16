const request = require('supertest');
const config = require('config');

const baseUrl = config.get('e2e.baseUrl');

function api() {
  return request(baseUrl);
}

async function login(email, password) {
  const res = await api()
    .post('/api/auth/login')
    .send({ email, password });

  return res.body.token;
}

const USERS = {
  admin: { email: 'admin@stride.co', password: 'Admin123' },
  sales: { email: 'sales@stride.co', password: 'Sales123' },
  user: { email: 'user@stride.co', password: 'User123' }
};

async function tokenFor(role) {
  const user = USERS[role];
  return login(user.email, user.password);
}

module.exports = { api, login, tokenFor, USERS };