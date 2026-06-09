const { getDb } = require('../config/database');

const Availability = {
  findByArtist(artistId) {
    return getDb().prepare('SELECT * FROM availability WHERE artist_id = ? ORDER BY date').all(artistId);
  },

  findByArtistAndDate(artistId, date) {
    return getDb().prepare('SELECT * FROM availability WHERE artist_id = ? AND date = ?').get(artistId, date);
  },

  upsert(artistId, date, status) {
    getDb().prepare(`
      INSERT INTO availability (artist_id, date, status)
      VALUES (?, ?, ?)
      ON CONFLICT(artist_id, date) DO UPDATE SET status = excluded.status
    `).run(artistId, date, status);
    return this.findByArtistAndDate(artistId, date);
  },

  delete(artistId, date) {
    return getDb().prepare('DELETE FROM availability WHERE artist_id = ? AND date = ?').run(artistId, date);
  },
};

module.exports = Availability;
