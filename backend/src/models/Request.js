const { getDb } = require('../config/database');

const Request = {
  findById(id) {
    return getDb().prepare('SELECT * FROM requests WHERE id = ?').get(id);
  },

  findByClient(clientId) {
    return getDb().prepare(`
      SELECT r.*, u.name as artist_name, s.name as service_name
      FROM requests r
      JOIN users u ON u.id = r.artist_id
      LEFT JOIN services s ON s.id = r.service_id
      WHERE r.client_id = ?
      ORDER BY r.created_at DESC
    `).all(clientId);
  },

  findByArtist(artistId) {
    return getDb().prepare(`
      SELECT r.*, u.name as client_name, s.name as service_name
      FROM requests r
      JOIN users u ON u.id = r.client_id
      LEFT JOIN services s ON s.id = r.service_id
      WHERE r.artist_id = ?
      ORDER BY r.created_at DESC
    `).all(artistId);
  },

  create({ client_id, artist_id, service_id, event_date, event_type, description, location }) {
    const result = getDb().prepare(`
      INSERT INTO requests (client_id, artist_id, service_id, event_date, event_type, description, location)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(client_id, artist_id, service_id || null, event_date, event_type, description || null, location || null);
    return this.findById(result.lastInsertRowid);
  },

  updateStatus(id, status, rejection_reason) {
    getDb().prepare('UPDATE requests SET status = ?, rejection_reason = ? WHERE id = ?')
      .run(status, rejection_reason || null, id);
    return this.findById(id);
  },
};

module.exports = Request;
