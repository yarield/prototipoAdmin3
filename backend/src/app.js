const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const artistRoutes = require('./routes/artistRoutes');
const searchRoutes = require('./routes/searchRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const requestRoutes = require('./routes/requestRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API funcionando correctamente' });
});

app.use('/api/auth', authRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/uploads', require('express').static(require('path').join(__dirname, '../uploads')));

module.exports = app;
