'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getToken } from '@/lib/api';

interface Slot { date: string; status: string; }

export default function AvailabilityPage() {
  const router = useRouter();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [artistId, setArtistId] = useState<number | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/auth/login'); return; }
    fetch('http://localhost:3000/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (!d.user || d.user.role !== 'artist') { router.push('/dashboard'); return; }
        setArtistId(d.user.id);
        return fetch(`http://localhost:3000/api/availability/${d.user.id}`);
      })
      .then(r => r?.json())
      .then(d => { if (d?.availability) setSlots(d.availability); });
  }, [router]);

  async function markDate(status: 'available' | 'unavailable') {
    if (!selectedDate) { setMsg('Seleccioná una fecha primero'); return; }
    setLoading(true);
    const res = await fetch('http://localhost:3000/api/availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ date: selectedDate, status }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.error) { setMsg(data.error); return; }
    setMsg(status === 'available' ? 'Fecha marcada como disponible' : 'Fecha marcada como no disponible');
    if (artistId) {
      fetch(`http://localhost:3000/api/availability/${artistId}`)
        .then(r => r.json())
        .then(d => { if (d.availability) setSlots(d.availability); });
    }
  }

  async function removeDate(date: string) {
    await fetch(`http://localhost:3000/api/availability/${date}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    setSlots(prev => prev.filter(s => s.date !== date));
  }

  const available = slots.filter(s => s.status === 'available');
  const unavailable = slots.filter(s => s.status === 'unavailable');

  return (
    <main style={s.page}>
      <div style={s.container}>
        <Link href="/dashboard" style={s.back}>← Volver al panel</Link>
        <h2>Mi disponibilidad</h2>
        <p style={s.hint}>Marcá las fechas donde estás disponible o no para eventos.</p>

        {msg && <p style={s.msg}>{msg}</p>}

        <div style={s.form}>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            style={s.input}
          />
          <div style={s.btnRow}>
            <button onClick={() => markDate('available')} disabled={loading} style={s.btnGreen}>
              ✓ Disponible
            </button>
            <button onClick={() => markDate('unavailable')} disabled={loading} style={s.btnRed}>
              ✗ No disponible
            </button>
          </div>
        </div>

        {available.length > 0 && (
          <section style={s.section}>
            <h3>Fechas disponibles ({available.length})</h3>
            <div style={s.dateList}>
              {available.map(sl => (
                <div key={sl.date} style={s.dateBadgeGreen}>
                  {sl.date}
                  <button onClick={() => removeDate(sl.date)} style={s.removeBtn}>×</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {unavailable.length > 0 && (
          <section style={s.section}>
            <h3>Fechas bloqueadas ({unavailable.length})</h3>
            <div style={s.dateList}>
              {unavailable.map(sl => (
                <div key={sl.date} style={s.dateBadgeRed}>
                  {sl.date}
                  <button onClick={() => removeDate(sl.date)} style={s.removeBtn}>×</button>
                </div>
              ))}
            </div>
          </section>
        )}

        {slots.length === 0 && <p style={s.empty}>No tenés fechas marcadas todavía.</p>}
      </div>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f5f5f5', padding: '2rem 1rem' },
  container: { maxWidth: '600px', margin: '0 auto' },
  back: { color: '#0070f3', textDecoration: 'none', fontSize: '0.9rem' },
  hint: { color: '#666', fontSize: '0.9rem', margin: '0.25rem 0 1.5rem' },
  msg: { background: '#e8f5e9', color: '#2e7d32', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' },
  form: { background: '#fff', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' },
  input: { padding: '0.65rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' },
  btnRow: { display: 'flex', gap: '0.75rem' },
  btnGreen: { flex: 1, padding: '0.65rem', background: '#2e7d32', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 },
  btnRed: { flex: 1, padding: '0.65rem', background: '#c62828', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 },
  section: { background: '#fff', padding: '1rem 1.5rem', borderRadius: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginBottom: '1rem' },
  dateList: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' },
  dateBadgeGreen: { background: '#e8f5e9', color: '#2e7d32', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' },
  dateBadgeRed: { background: '#ffebee', color: '#c62828', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' },
  removeBtn: { background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '1rem', lineHeight: 1, color: 'inherit' },
  empty: { color: '#999', fontStyle: 'italic' },
};
