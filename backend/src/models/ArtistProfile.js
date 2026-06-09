const { getDb } = require('../config/database');

const ArtistProfile = {
  findByUserId(userId) {
    return getDb().prepare(`
      SELECT ap.*, u.name, u.email, u.art_category
      FROM artist_profiles ap
      JOIN users u ON u.id = ap.user_id
      WHERE ap.user_id = ?
    `).get(userId);
  },

  upsert({ user_id, artistic_name, bio, province, photo_url }) {
    getDb().prepare(`
      INSERT INTO artist_profiles (user_id, artistic_name, bio, province, photo_url, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(user_id) DO UPDATE SET
        artistic_name = excluded.artistic_name,
        bio = excluded.bio,
        province = excluded.province,
        photo_url = COALESCE(excluded.photo_url, photo_url),
        updated_at = datetime('now')
    `).run(user_id, artistic_name, bio, province, photo_url);
    return this.findByUserId(user_id);
  },
};

module.exports = ArtistProfile;
