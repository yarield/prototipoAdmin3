const Notification = require('../models/Notification');

function getNotifications(req, res) {
  const notifications = Notification.findByUser(req.user.id);
  const unread = Notification.countUnread(req.user.id);
  return res.json({ notifications, unread });
}

function markRead(req, res) {
  Notification.markAllRead(req.user.id);
  return res.json({ message: 'Notificaciones marcadas como leídas' });
}

module.exports = { getNotifications, markRead };
