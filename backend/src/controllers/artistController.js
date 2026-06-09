const ArtistProfile = require('../models/ArtistProfile');
const Service = require('../models/Service');
const Portfolio = require('../models/Portfolio');
const User = require('../models/User');
const path = require('path');
const fs = require('fs');

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

function getProfile(req, res) {
  const userId = parseInt(req.params.id);
  const profile = ArtistProfile.findByUserId(userId);
  if (!profile) return res.status(404).json({ error: 'Perfil no encontrado' });

  const services = Service.findByArtist(userId).filter(s => s.status === 'active');
  const portfolio = Portfolio.findByArtist(userId);

  return res.json({ profile, services, portfolio });
}

function updateProfile(req, res) {
  const userId = req.user.id;
  if (req.user.role !== 'artist') return res.status(403).json({ error: 'Solo artistas pueden editar perfil' });

  const { artistic_name, bio, province } = req.body;
  if (bio && bio.length > 500) return res.status(400).json({ error: 'La bio no puede superar 500 caracteres' });

  const photo_url = req.file ? `/uploads/${req.file.filename}` : null;
  const profile = ArtistProfile.upsert({ user_id: userId, artistic_name, bio, province, photo_url });

  return res.json({ message: 'Perfil actualizado', profile });
}

function getMyServices(req, res) {
  const services = Service.findByArtist(req.user.id);
  return res.json({ services });
}

function createService(req, res) {
  if (req.user.role !== 'artist') return res.status(403).json({ error: 'Solo artistas pueden publicar servicios' });

  const { name, description, base_price, duration, conditions } = req.body;
  if (!name || !base_price) return res.status(400).json({ error: 'Nombre y precio son requeridos' });

  const active = Service.countActive(req.user.id);
  if (active >= 10) return res.status(400).json({ error: 'Limite de 10 servicios activos alcanzado' });

  const service = Service.create({ artist_id: req.user.id, name, description, base_price: parseFloat(base_price), duration, conditions });
  return res.status(201).json({ message: 'Servicio creado', service });
}

function updateService(req, res) {
  const service = Service.findById(req.params.id);
  if (!service) return res.status(404).json({ error: 'Servicio no encontrado' });
  if (service.artist_id !== req.user.id) return res.status(403).json({ error: 'No autorizado' });

  const { name, description, base_price, duration, conditions, status } = req.body;
  const updated = Service.update(service.id, {
    name: name || service.name,
    description: description ?? service.description,
    base_price: base_price ? parseFloat(base_price) : service.base_price,
    duration: duration ?? service.duration,
    conditions: conditions ?? service.conditions,
    status: status || service.status,
  });
  return res.json({ message: 'Servicio actualizado', service: updated });
}

function getPortfolio(req, res) {
  const portfolio = Portfolio.findByArtist(req.user.id);
  return res.json({ portfolio });
}

function uploadPortfolioItem(req, res) {
  if (req.user.role !== 'artist') return res.status(403).json({ error: 'Solo artistas pueden subir portafolio' });
  if (!req.file) return res.status(400).json({ error: 'Archivo requerido' });

  const isVideo = req.file.mimetype.startsWith('video/');
  const fileType = isVideo ? 'video' : 'image';

  const images = Portfolio.countByType(req.user.id, 'image');
  const videos = Portfolio.countByType(req.user.id, 'video');

  if (fileType === 'image' && images >= 6) return res.status(400).json({ error: 'Limite de 6 fotos alcanzado' });
  if (fileType === 'video' && videos >= 1) return res.status(400).json({ error: 'Solo se permite 1 video' });

  const file_url = `/uploads/${req.file.filename}`;
  const { title, description } = req.body;
  const item = Portfolio.create({ artist_id: req.user.id, file_url, file_type: fileType, title, description });
  return res.status(201).json({ message: 'Archivo subido', item });
}

function deletePortfolioItem(req, res) {
  const item = Portfolio.findById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Item no encontrado' });
  if (item.artist_id !== req.user.id) return res.status(403).json({ error: 'No autorizado' });

  const filePath = path.join(UPLOADS_DIR, path.basename(item.file_url));
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  Portfolio.delete(item.id);
  return res.json({ message: 'Archivo eliminado' });
}

module.exports = { getProfile, updateProfile, getMyServices, createService, updateService, getPortfolio, uploadPortfolioItem, deletePortfolioItem };
