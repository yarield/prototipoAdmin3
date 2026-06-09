'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getToken } from '@/lib/api';

interface Service { id: number; name: string; base_price: number; }

export default function RequestPage() {
  const { artistId } = useParams<{ artistId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [artistName, setArtistName] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const preSelectedService = searchParams.get('service') || '';

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/auth/login'); return; }
    fetch(`http://localhost:3000/api/artists/${artistId}`)
      .then(r => r.json())
      .then(d => {
        setArtistName(d.profile?.artistic_name || d.profile?.name || '');
        setServices(d.services || []);
      });
  }, [artistId, router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const form = e.currentTarget;
    const body = {
      artist_id: parseInt(artistId),
      service_id: (form.elements.namedItem('service_id') as HTMLSelectElement).value || null,
      event_date: (form.elements.namedItem('event_date') as HTMLInputElement).value,
      event_type: (form.elements.namedItem('event_type') as HTMLInputElement).value,
      description: (form.elements.namedItem('description') as HTMLTextAreaElement).value,
      location: (form.elements.namedItem('location') as HTMLInputElement).value,
    };
    const res = await fetch('http://localhost:3000/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (data.error) { setMsg(data.error); return; }
    setMsg('¡Solicitud enviada! El artista te responderá pronto.');
    form.reset();
  }

  return (
    <main style={s.page}>
      <div style={s.container}>
        <Link href={`/artists/${artistId}`} style={s.back}>← Volver al perfil</Link>
        <h2>Solicitud de contratación</h2>
        {artistName && <p style={s.subtitle}>Para: <strong>{artistName}</strong></p>}

        {msg && (
          <p style={{ ...s.msg, background: msg.includes('error') || msg.includes('Solo') ? '#ffebee' : '#e8f5e9', color: msg.includes('error') || msg.includes('Solo') ? '#c62828' : '#2e7d32' }}>
            {msg}
          </p>
        )}

        <form onSubmit={handleSubmit} style={s.form}>
          {services.length > 0 && (
            <>
              <label style={s.label}>Servicio (opcional)</label>
              <select name="service_id" defaultValue={preSelectedService} style={s.input}>
                <option value="">Sin servicio específico</option>
                {services.map(sv => (
                  <option key={sv.id} value={sv.id}>{sv.name} — ₡{sv.base_price?.toLocaleString()}</option>
                ))}
              </select>
            </>
          )}

          <label style={s.label}>Tipo de evento *</label>
          <input name="event_type" required placeholder="ej: Cumpleaños, Boda, Gala corporativa" style={s.input} />

          <label style={s.label}>Fecha del evento *</label>
          <input name="event_date" type="date" required style={s.input} min={new Date().toISOString().split('T')[0]} />

          <label style={s.label}>Lugar del evento</label>
          <input name="location" placeholder="Dirección o descripción del lugar" style={s.input} />

          <label style={s.label}>Descripción y detalles adicionales</label>
          <textarea name="description" rows={4} placeholder="Contale al artista más sobre tu evento..." style={s.input} />

          <button type="submit" disabled={loading} style={s.btn}>
            {loading ? 'Enviando...' : 'Enviar solicitud'}
          </button>
        </form>
      </div>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f5f5f5', padding: '2rem 1rem' },
  container: { maxWidth: '580px', margin: '0 auto', background: '#fff', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.09)' },
  back: { color: '#0070f3', textDecoration: 'none', fontSize: '0.9rem' },
  subtitle: { color: '#555', margin: '0.5rem 0 1.5rem' },
  msg: { padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' },
  label: { fontWeight: 600, fontSize: '0.9rem', marginTop: '0.5rem' },
  input: { padding: '0.65rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' },
  btn: { marginTop: '1rem', padding: '0.85rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' },
};
