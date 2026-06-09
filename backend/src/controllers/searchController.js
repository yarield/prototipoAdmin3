const { getDb } = require('../config/database');

function searchArtists(req, res) {
  const { category, province, name, page = 1, limit = 12 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  let sql = `
    SELECT u.id, u.name, u.art_category, ap.artistic_name, ap.bio, ap.province, ap.photo_url
    FROM users u
    LEFT JOIN artist_profiles ap ON ap.user_id = u.id
    WHERE u.role = 'artist' AND u.status = 'active'
  `;
  const params = [];

  if (category) { sql += ' AND u.art_category = ?'; params.push(category); }
  if (province) { sql += ' AND ap.province = ?'; params.push(province); }
  if (name) { sql += ' AND (u.name LIKE ? OR ap.artistic_name LIKE ?)'; params.push(`%${name}%`, `%${name}%`); }

  const total = getDb().prepare(`SELECT COUNT(*) as count FROM (${sql})`).get(...params).count;

  sql += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), offset);

  const artists = getDb().prepare(sql).all(...params);
  return res.json({ artists, total, page: parseInt(page), limit: parseInt(limit) });
}

module.exports = { searchArtists };
