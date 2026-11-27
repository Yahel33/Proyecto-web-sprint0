const { validationResult } = require('express-validator');
const authService = require('../../services/auth.service');
const jwt = require('jsonwebtoken');
const config = require('config');

const ACCESS_TOKEN_COOKIE = 'access_token';

// evita open redirect, solo rutas internas relativas (sin protocolo ni diagonal invertida)
function isInternalPath(value) {
  return typeof value === 'string' &&
    /^\/(?!\/)/.test(value) &&
    !value.includes('://') &&
    !value.includes('\\');
}

function renderLogin(req, res, status, options = {}) {
  res.status(status).render('auth/login', {
    title: req.__('auth.login.pageTitle'),
    description: req.__('auth.login.description'),
    email: options.email || '',
    next: options.next || '',
    errors: options.errors || {},
    generalError: options.generalError || null
  });
}

function showLogin(req, res) {
  renderLogin(req, res, 200, { next: req.query.next });
}

async function login(req, res, next) {
  const validation = validationResult(req);
  const nextPath = req.body.next;

  if (!validation.isEmpty()) {
    const fieldErrors = {};
    for (const [field, error] of Object.entries(validation.mapped())) {
      fieldErrors[field] = error.msg;
    }
    return renderLogin(req, res, 400, { email: req.body.email, next: nextPath, errors: fieldErrors });
  }

  try {
    const user = await authService.authenticate(req.body.email, req.body.password);
    if (!user) {
      return renderLogin(req, res, 401, {
        email: req.body.email,
        next: nextPath,
        generalError: req.__('auth.invalidCredentials')
      });
    }

    const token = authService.issueToken(user);
    const { exp } = jwt.decode(token);

    res.cookie(ACCESS_TOKEN_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.util.getEnv('NODE_ENV') === 'production',
      maxAge: exp * 1000 - Date.now()
    });

    return res.redirect(isInternalPath(nextPath) ? nextPath : '/admin');
  } catch (error) {
    return next(error);
  }
}

function logout(req, res) {
  res.clearCookie(ACCESS_TOKEN_COOKIE);
  res.flash('success', req.__('auth.logoutSuccess'));
  res.redirect('/');
}

module.exports = { showLogin, login, logout };
