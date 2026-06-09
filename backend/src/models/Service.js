const { getDb } = require('../config/database');

const Service = {
  findByArtist(artistId) {
    return getDb().prepare('SELECT * FROM services WHERE artist_id = ? ORDER BY created_at DESC').all(artistId);
  },

  findById(id) {
    return getDb().prepare('SELECT * FROM services WHERE id = ?').get(id);
  },

  countActive(artistId) {
    return getDb().prepare("SELECT COUNT(*) as count FROM services WHERE artist_id = ? AND status = 'active'").get(artistId).count;
  },

  create({ artist_id, name, description, base_price, duration, conditions }) {
    const result = getDb().prepare(
      'INSERT INTO services (artist_id, name, description, base_price, duration, conditions) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(artist_id, name, description, base_price, duration, conditions);
    return this.findById(result.lastInsertRowid);
  },

  update(id, { name, description, base_price, duration, conditions, status }) {
    getDb().prepare(
      'UPDATE services SET name=?, description=?, base_price=?, duration=?, conditions=?, status=? WHERE id=?'
    ).run(name, description, base_price, duration, conditions, status, id);
    return this.findById(id);
  },
};

module.exports = Service;
