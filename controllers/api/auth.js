const authService = require('../../services/auth.service');

// Crea un usuario guardando la contraseña de forma segura (hash + salt).
async function register(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: req.__('auth.credentialsRequired') });
    }

    const user = await authService.register(req.body);

    res.status(201).json({ message: req.__('auth.userCreated'), data: user });
  } catch (err) {
    res.status(500).json({ message: req.__('auth.errorCreatingUser'), error: err.message });
  }
}

// Valida credenciales y devuelve un JWT si son correctas.
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: req.__('auth.credentialsRequired') });
    }

    // Mismo mensaje generico si el usuario no existe o la contrasena es incorrecta.
    const user = await authService.authenticate(email, password);
    if (!user) {
      return res.status(401).json({ message: req.__('auth.invalidCredentials') });
    }

    const token = authService.issueToken(user);

    res.status(200).json({ message: req.__('auth.loginSuccessful'), token });
  } catch (err) {
    res.status(500).json({ message: req.__('auth.errorDuringLogin'), error: err.message });
  }
}

function me(req, res) {
  res.status(200).json(req.user);
}

module.exports = { register, login, me };
