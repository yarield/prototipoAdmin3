const Request = require('../models/Request');
const Notification = require('../models/Notification');

function getMyRequests(req, res) {
  const requests = req.user.role === 'artist'
    ? Request.findByArtist(req.user.id)
    : Request.findByClient(req.user.id);
  return res.json({ requests });
}

function createRequest(req, res) {
  if (req.user.role !== 'client') return res.status(403).json({ error: 'Solo clientes pueden enviar solicitudes' });

  const { artist_id, service_id, event_date, event_type, description, location } = req.body;
  if (!artist_id || !event_date || !event_type) return res.status(400).json({ error: 'Artista, fecha y tipo de evento son requeridos' });

  const request = Request.create({
    client_id: req.user.id,
    artist_id: parseInt(artist_id),
    service_id: service_id ? parseInt(service_id) : null,
    event_date,
    event_type,
    description,
    location,
  });

  Notification.create({
    user_id: parseInt(artist_id),
    message: `Nueva solicitud de contratación para el ${event_date}`,
    type: 'new_request',
  });

  return res.status(201).json({ message: 'Solicitud enviada', request });
}

function updateRequestStatus(req, res) {
  if (req.user.role !== 'artist') return res.status(403).json({ error: 'Solo artistas pueden responder solicitudes' });

  const request = Request.findById(req.params.id);
  if (!request) return res.status(404).json({ error: 'Solicitud no encontrada' });
  if (request.artist_id !== req.user.id) return res.status(403).json({ error: 'No autorizado' });

  const { status, rejection_reason } = req.body;
  const validStatuses = ['accepted', 'rejected', 'cancelled'];
  if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Estado inválido' });

  const updated = Request.updateStatus(request.id, status, rejection_reason);

  const msg = status === 'accepted'
    ? 'Tu solicitud fue aceptada'
    : status === 'rejected'
    ? `Tu solicitud fue rechazada${rejection_reason ? ': ' + rejection_reason : ''}`
    : 'Tu solicitud fue cancelada';

  Notification.create({ user_id: request.client_id, message: msg, type: `request_${status}` });

  return res.json({ message: 'Solicitud actualizada', request: updated });
}

module.exports = { getMyRequests, createRequest, updateRequestStatus };
