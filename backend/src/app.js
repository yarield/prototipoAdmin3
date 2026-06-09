const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const artistRoutes = require('./routes/artistRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API funcionando correctamente' });
});

app.use('/api/auth', authRoutes);
app.use('/api/artists', artistRoutes);
app.use('/uploads', require('express').static(require('path').join(__dirname, '../uploads')));

module.exports = app;
