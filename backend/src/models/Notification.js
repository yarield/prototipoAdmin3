const { getDb } = require('../config/database');

const Notification = {
  findByUser(userId) {
    return getDb().prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC').all(userId);
  },

  countUnread(userId) {
    return getDb().prepare("SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND read = 0").get(userId).count;
  },

  create({ user_id, message, type }) {
    const result = getDb().prepare('INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)').run(user_id, message, type);
    return this.findByUser(user_id)[0];
  },

  markAllRead(userId) {
    return getDb().prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(userId);
  },
};

module.exports = Notification;
