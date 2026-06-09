'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getToken } from '@/lib/api';

interface Notif { id: number; message: string; type: string; read: number; created_at: string; }

const TYPE_ICONS: Record<string, string> = {
  new_request: '📋',
  request_accepted: '✅',
  request_rejected: '❌',
  request_cancelled: '🚫',
};

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/auth/login'); return; }
    fetch('http://localhost:3000/api/notifications', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.notifications) setNotifications(d.notifications);
        if (typeof d.unread === 'number') setUnread(d.unread);
      });
  }, [router]);

  async function markRead() {
    await fetch('http://localhost:3000/api/notifications/read', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    setNotifications(prev => prev.map(n => ({ ...n, read: 1 })));
    setUnread(0);
  }

  return (
    <main style={s.page}>
      <div style={s.container}>
        <Link href="/dashboard" style={s.back}>← Volver al panel</Link>
        <div style={s.titleRow}>
          <h2>Notificaciones {unread > 0 && <span style={s.badge}>{unread}</span>}</h2>
          {unread > 0 && (
            <button onClick={markRead} style={s.markBtn}>Marcar todas como leídas</button>
          )}
        </div>

        {notifications.length === 0 && <p style={s.empty}>No tenés notificaciones.</p>}

        <div style={s.list}>
          {notifications.map(n => (
            <div key={n.id} style={{ ...s.card, background: n.read ? '#fff' : '#f0f7ff' }}>
              <span style={s.icon}>{TYPE_ICONS[n.type] || '🔔'}</span>
              <div style={s.body}>
                <p style={s.message}>{n.message}</p>
                <p style={s.time}>{new Date(n.created_at).toLocaleString('es-CR')}</p>
              </div>
              {!n.read && <span style={s.dot} />}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f5f5f5', padding: '2rem 1rem' },
  container: { maxWidth: '620px', margin: '0 auto' },
  back: { color: '#0070f3', textDecoration: 'none', fontSize: '0.9rem' },
  titleRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', margin: '1rem 0' },
  badge: { display: 'inline-block', background: '#0070f3', color: '#fff', borderRadius: '50%', width: '1.5rem', height: '1.5rem', textAlign: 'center', lineHeight: '1.5rem', fontSize: '0.8rem', fontWeight: 700, marginLeft: '0.5rem' },
  markBtn: { padding: '0.4rem 1rem', border: '1px solid #0070f3', color: '#0070f3', background: '#fff', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' },
  empty: { color: '#999', fontStyle: 'italic', marginTop: '2rem' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  card: { borderRadius: '8px', padding: '1rem', boxShadow: '0 1px 4px rgba(0,0,0,0.07)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' },
  icon: { fontSize: '1.5rem', flexShrink: 0 },
  body: { flex: 1 },
  message: { margin: 0, fontSize: '0.95rem', color: '#222' },
  time: { margin: '0.3rem 0 0', fontSize: '0.8rem', color: '#999' },
  dot: { width: '10px', height: '10px', borderRadius: '50%', background: '#0070f3', flexShrink: 0, marginTop: '4px' },
};
