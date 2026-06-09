const Availability = require('../models/Availability');

function getAvailability(req, res) {
  const artistId = parseInt(req.params.artistId);
  const slots = Availability.findByArtist(artistId);
  return res.json({ availability: slots });
}

function setAvailability(req, res) {
  const artistId = req.user.id;
  if (req.user.role !== 'artist') return res.status(403).json({ error: 'Solo artistas pueden gestionar disponibilidad' });

  const { date, status } = req.body;
  if (!date || !status) return res.status(400).json({ error: 'Fecha y estado son requeridos' });

  const validStatuses = ['available', 'unavailable'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Estado inválido' });

  const slot = Availability.upsert(artistId, date, status);
  return res.json({ message: 'Disponibilidad actualizada', slot });
}

function deleteAvailability(req, res) {
  const artistId = req.user.id;
  if (req.user.role !== 'artist') return res.status(403).json({ error: 'Solo artistas pueden gestionar disponibilidad' });

  const { date } = req.params;
  Availability.delete(artistId, date);
  return res.json({ message: 'Fecha eliminada de la agenda' });
}

module.exports = { getAvailability, setAvailability, deleteAvailability };
