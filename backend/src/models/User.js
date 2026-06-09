const { getDb } = require('../config/database');

const User = {
  findByEmail(email) {
    return getDb().prepare('SELECT * FROM users WHERE email = ?').get(email);
  },

  findById(id) {
    return getDb().prepare('SELECT id, name, email, role, art_category, status, created_at FROM users WHERE id = ?').get(id);
  },

  create({ name, email, password, role, art_category = null }) {
    const result = getDb()
      .prepare('INSERT INTO users (name, email, password, role, art_category) VALUES (?, ?, ?, ?, ?)')
      .run(name, email, password, role, art_category);
    return result.lastInsertRowid;
  },
};

module.exports = User;
