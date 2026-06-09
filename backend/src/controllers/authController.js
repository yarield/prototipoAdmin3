const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_in_production';
const JWT_EXPIRES_IN = '24h';

async function register(req, res) {
  const { name, email, password, role, art_category } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Todos los campos son requeridos' });
  }

  if (!['artist', 'client'].includes(role)) {
    return res.status(400).json({ error: 'Rol invalido. Debe ser artist o client' });
  }

  if (role === 'artist' && !art_category) {
    return res.status(400).json({ error: 'Los artistas deben seleccionar una categoria' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'La contrasena debe tener al menos 8 caracteres' });
  }

  const existing = User.findByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'El correo ya esta registrado' });
  }

  const hashed = await bcrypt.hash(password, 10);
  const id = User.create({ name, email, password: hashed, role, art_category });

  const token = jwt.sign({ id, role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return res.status(201).json({
    message: 'Usuario registrado exitosamente',
    token,
    user: { id, name, email, role, art_category },
  });
}

async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Correo y contrasena son requeridos' });
  }

  const user = User.findByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Credenciales invalidas' });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return res.status(401).json({ error: 'Credenciales invalidas' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  return res.json({
    message: 'Inicio de sesion exitoso',
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
}

function logout(req, res) {
  return res.json({ message: 'Sesion cerrada exitosamente' });
}

function me(req, res) {
  return res.json({ user: req.user });
}

module.exports = { register, login, logout, me };
