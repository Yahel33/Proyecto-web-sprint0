const { User } = require('../models/relationals');
const { hashPassword, verifyPassword } = require('../utils/password');
const jwt = require('jsonwebtoken');

// Crea un usuario guardando la contraseña de forma segura (hash + salt).
async function register(req, res) {
  try {
    const { firstName, lastName, email, roleId, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const { password_hash, salt_key } = await hashPassword(password);

    const user = await User.create({
      firstName,
      lastName,
      email,
      roleId,
      password_hash,
      salt_key
    });

    res.status(201).json({ message: 'User created', data: user });
  } catch (err) {
    res.status(500).json({ message: 'Error creating user', error: err.message });
  }
}

// Valida credenciales y devuelve un JWT si son correctas.
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });

    // Mismo mensaje generico si el usuario no existe o la contrasena es incorrecta.
    if (!user || !user.active) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordOk = await verifyPassword(password, user.password_hash);
    if (!passwordOk) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { sub: String(user.id) },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
        issuer: process.env.JWT_ISSUER,
        audience: process.env.JWT_AUDIENCE,
        algorithm: 'HS256'
      }
    );

    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ message: 'Error during login', error: err.message });
  }
}

// Devuelve los datos del usuario cargado por el middleware authenticate.
function me(req, res) {
  res.status(200).json(req.user);
}

module.exports = { register, login, me };
