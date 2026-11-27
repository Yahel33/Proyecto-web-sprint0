const FLASH_COOKIE = 'flash';

// mensaje de un solo uso despues de un redirect, guardado en una cookie firmada
function flash(req, res, next) {
  const raw = req.signedCookies && req.signedCookies[FLASH_COOKIE];

  if (raw) {
    try {
      res.locals.flash = JSON.parse(raw);
    } catch {
      res.locals.flash = null;
    }
    res.clearCookie(FLASH_COOKIE);
  } else {
    res.locals.flash = null;
  }

  res.flash = function (type, message) {
    res.cookie(FLASH_COOKIE, JSON.stringify({ type, message }), {
      httpOnly: true,
      signed: true,
      sameSite: 'lax'
    });
  };

  next();
}

module.exports = flash;
