'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getToken } from '@/lib/api';

interface Req {
  id: number;
  event_date: string;
  event_type: string;
  description: string;
  location: string;
  status: string;
  rejection_reason: string;
  artist_name?: string;
  client_name?: string;
  service_name?: string;
  created_at: string;
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendiente',
  accepted: 'Aceptada',
  rejected: 'Rechazada',
  cancelled: 'Cancelada',
};

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  pending: { bg: '#fff8e1', color: '#f57f17' },
  accepted: { bg: '#e8f5e9', color: '#2e7d32' },
  rejected: { bg: '#ffebee', color: '#c62828' },
  cancelled: { bg: '#f5f5f5', color: '#757575' },
};

export default function RequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<Req[]>([]);
  const [role, setRole] = useState('');
  const [rejecting, setRejecting] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [msg, setMsg] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/auth/login'); return; }
    fetch('http://localhost:3000/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (!d.user) { router.push('/auth/login'); return; }
        setRole(d.user.role);
        return fetch('http://localhost:3000/api/requests', { headers: { Authorization: `Bearer ${token}` } });
      })
      .then(r => r?.json())
      .then(d => { if (d?.requests) setRequests(d.requests); });
  }, [router]);

  async function respond(id: number, status: 'accepted' | 'rejected', reason?: string) {
    const res = await fetch(`http://localhost:3000/api/requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ status, rejection_reason: reason }),
    });
    const data = await res.json();
    if (data.error) { setMsg(data.error); return; }
    setMsg(status === 'accepted' ? 'Solicitud aceptada' : 'Solicitud rechazada');
    setRejecting(null);
    setRejectReason('');
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status, rejection_reason: reason || '' } : r));
  }

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  return (
    <main style={s.page}>
      <div style={s.container}>
        <Link href="/dashboard" style={s.back}>← Volver al panel</Link>
        <h2>{role === 'artist' ? 'Solicitudes recibidas' : 'Mis solicitudes'}</h2>

        {msg && <p style={s.msgBox}>{msg}</p>}

        <div style={s.filterRow}>
          {['all', 'pending', 'accepted', 'rejected', 'cancelled'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ ...s.filterBtn, ...(filter === f ? s.filterActive : {}) }}>
              {f === 'all' ? 'Todas' : STATUS_LABELS[f]}
            </button>
          ))}
        </div>

        {filtered.length === 0 && <p style={s.empty}>No hay solicitudes en esta categoría.</p>}

        <div style={s.list}>
          {filtered.map(req => {
            const sc = STATUS_COLORS[req.status] || STATUS_COLORS.pending;
            return (
              <div key={req.id} style={s.card}>
                <div style={s.cardTop}>
                  <div>
                    <strong>{req.event_type}</strong>
                    {req.service_name && <span style={s.serviceName}> · {req.service_name}</span>}
                    <p style={s.date}>📅 {req.event_date}</p>
                    {req.location && <p style={s.location}>📍 {req.location}</p>}
                    {role === 'artist' && req.client_name && <p style={s.person}>👤 Cliente: {req.client_name}</p>}
                    {role === 'client' && req.artist_name && <p style={s.person}>🎭 Artista: {req.artist_name}</p>}
                    {req.description && <p style={s.desc}>{req.description}</p>}
                    {req.rejection_reason && <p style={{ ...s.desc, color: '#c62828' }}>Motivo de rechazo: {req.rejection_reason}</p>}
                  </div>
                  <span style={{ ...s.statusBadge, background: sc.bg, color: sc.color }}>
                    {STATUS_LABELS[req.status]}
                  </span>
                </div>

                {role === 'artist' && req.status === 'pending' && (
                  <div style={s.actions}>
                    {rejecting === req.id ? (
                      <div style={s.rejectForm}>
                        <input
                          placeholder="Motivo del rechazo (opcional)"
                          value={rejectReason}
                          onChange={e => setRejectReason(e.target.value)}
                          style={s.rejectInput}
                        />
                        <button onClick={() => respond(req.id, 'rejected', rejectReason)} style={s.btnRed}>Confirmar rechazo</button>
                        <button onClick={() => setRejecting(null)} style={s.btnGray}>Cancelar</button>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => respond(req.id, 'accepted')} style={s.btnGreen}>✓ Aceptar</button>
                        <button onClick={() => setRejecting(req.id)} style={s.btnRed}>✗ Rechazar</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f5f5f5', padding: '2rem 1rem' },
  container: { maxWidth: '720px', margin: '0 auto' },
  back: { color: '#0070f3', textDecoration: 'none', fontSize: '0.9rem' },
  msgBox: { background: '#e8f5e9', color: '#2e7d32', padding: '0.75rem', borderRadius: '4px', margin: '1rem 0' },
  filterRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '1.25rem 0' },
  filterBtn: { padding: '0.35rem 0.85rem', border: '1px solid #ddd', borderRadius: '20px', background: '#fff', cursor: 'pointer', fontSize: '0.85rem' },
  filterActive: { background: '#0070f3', color: '#fff', borderColor: '#0070f3' },
  list: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  card: { background: '#fff', padding: '1.25rem', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  cardTop: { display: 'flex', justifyContent: 'space-between', gap: '1rem', alignItems: 'flex-start' },
  statusBadge: { padding: '0.25rem 0.7rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700, whiteSpace: 'nowrap' },
  serviceName: { color: '#0070f3', fontSize: '0.9rem' },
  date: { color: '#555', fontSize: '0.9rem', margin: '0.3rem 0 0' },
  location: { color: '#555', fontSize: '0.85rem' },
  person: { color: '#444', fontSize: '0.85rem' },
  desc: { color: '#666', fontSize: '0.85rem', marginTop: '0.4rem' },
  actions: { marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' },
  rejectForm: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: '100%' },
  rejectInput: { flex: 1, minWidth: '180px', padding: '0.5rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '0.9rem' },
  btnGreen: { padding: '0.5rem 1.25rem', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 },
  btnRed: { padding: '0.5rem 1.25rem', background: '#c62828', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 },
  btnGray: { padding: '0.5rem 1rem', background: '#eee', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' },
  empty: { color: '#999', marginTop: '2rem', textAlign: 'center', fontStyle: 'italic' },
};
