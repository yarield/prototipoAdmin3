'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getToken } from '@/lib/api';

interface Service { id: number; name: string; description: string; base_price: number; duration: string; conditions: string; status: string; }

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  function fetchServices() {
    const token = getToken();
    if (!token) { router.push('/auth/login'); return; }
    fetch('http://localhost:3000/api/artists/me/services', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.services) setServices(d.services); });
  }

  useEffect(() => { fetchServices(); }, []);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = e.currentTarget;
    const body = {
      name: (form.elements.namedItem('name') as HTMLInputElement).value,
      description: (form.elements.namedItem('description') as HTMLInputElement).value,
      base_price: (form.elements.namedItem('base_price') as HTMLInputElement).value,
      duration: (form.elements.namedItem('duration') as HTMLInputElement).value,
      conditions: (form.elements.namedItem('conditions') as HTMLInputElement).value,
    };
    const res = await fetch('http://localhost:3000/api/artists/me/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);
    if (data.error) { setMsg(data.error); return; }
    setMsg('Servicio creado');
    form.reset();
    fetchServices();
  }

  async function toggleStatus(service: Service) {
    const newStatus = service.status === 'active' ? 'inactive' : 'active';
    await fetch(`http://localhost:3000/api/artists/me/services/${service.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify({ ...service, status: newStatus }),
    });
    fetchServices();
  }

  return (
    <main style={s.page}>
      <div style={s.container}>
        <Link href="/dashboard" style={s.back}>← Volver al panel</Link>
        <h2>Mis Servicios</h2>
        <p style={s.hint}>Podés tener hasta 10 servicios activos simultáneamente.</p>

        {msg && <p style={s.msg}>{msg}</p>}

        <div style={s.list}>
          {services.map(sv => (
            <div key={sv.id} style={{ ...s.serviceCard, opacity: sv.status === 'inactive' ? 0.6 : 1 }}>
              <div>
                <strong>{sv.name}</strong>
                <span style={{ ...s.badge, background: sv.status === 'active' ? '#e8f5e9' : '#eee', color: sv.status === 'active' ? '#2e7d32' : '#666' }}>{sv.status}</span>
              </div>
              <p style={s.desc}>{sv.description}</p>
              <p>₡{sv.base_price?.toLocaleString()} · {sv.duration}</p>
              <button onClick={() => toggleStatus(sv)} style={s.toggleBtn}>
                {sv.status === 'active' ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          ))}
        </div>

        <h3 style={{ marginTop: '2rem' }}>Agregar nuevo servicio</h3>
        <form onSubmit={handleCreate} style={s.form}>
          <input name="name" required placeholder="Nombre del servicio" style={s.input} />
          <textarea name="description" placeholder="Descripción" rows={3} style={s.input} />
          <input name="base_price" required type="number" min="0" placeholder="Precio base (₡)" style={s.input} />
          <input name="duration" placeholder="Duración estimada (ej: 2 horas)" style={s.input} />
          <textarea name="conditions" placeholder="Condiciones técnicas" rows={2} style={s.input} />
          <button type="submit" disabled={loading} style={s.btn}>{loading ? 'Guardando...' : 'Crear servicio'}</button>
        </form>
      </div>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f5f5f5', padding: '2rem 1rem' },
  container: { maxWidth: '700px', margin: '0 auto' },
  back: { color: '#0070f3', textDecoration: 'none', fontSize: '0.9rem' },
  hint: { color: '#666', fontSize: '0.9rem' },
  msg: { background: '#e8f5e9', color: '#2e7d32', padding: '0.75rem', borderRadius: '4px' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' },
  serviceCard: { background: '#fff', padding: '1rem', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  badge: { marginLeft: '0.5rem', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 },
  desc: { color: '#555', fontSize: '0.9rem', margin: '0.25rem 0' },
  toggleBtn: { marginTop: '0.5rem', padding: '0.3rem 0.75rem', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', background: '#fff' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  input: { padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' },
  btn: { padding: '0.75rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' },
};
