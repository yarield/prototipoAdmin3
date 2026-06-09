const { getDb } = require('../config/database');

const Portfolio = {
  findByArtist(artistId) {
    return getDb().prepare('SELECT * FROM portfolio_items WHERE artist_id = ? ORDER BY created_at DESC').all(artistId);
  },

  findById(id) {
    return getDb().prepare('SELECT * FROM portfolio_items WHERE id = ?').get(id);
  },

  countByType(artistId, type) {
    return getDb().prepare('SELECT COUNT(*) as count FROM portfolio_items WHERE artist_id = ? AND file_type = ?').get(artistId, type).count;
  },

  create({ artist_id, file_url, file_type, title, description }) {
    const result = getDb().prepare(
      'INSERT INTO portfolio_items (artist_id, file_url, file_type, title, description) VALUES (?, ?, ?, ?, ?)'
    ).run(artist_id, file_url, file_type, title || null, description || null);
    return this.findById(result.lastInsertRowid);
  },

  delete(id) {
    return getDb().prepare('DELETE FROM portfolio_items WHERE id = ?').run(id);
  },
};

module.exports = Portfolio;
