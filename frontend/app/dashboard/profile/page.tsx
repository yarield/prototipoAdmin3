'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getToken } from '@/lib/api';

const PROVINCES = ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón'];

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/auth/login'); return; }
    fetch('http://localhost:3000/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (!d.user || d.user.role !== 'artist') { router.push('/dashboard'); return; }
        return fetch(`http://localhost:3000/api/artists/${d.user.id}`);
      })
      .then(r => r?.json())
      .then(d => { if (d?.profile) setProfile(d.profile); })
      .catch(() => router.push('/auth/login'));
  }, [router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const form = e.currentTarget;
    const formData = new FormData(form);
    const token = getToken();
    const res = await fetch('http://localhost:3000/api/artists/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const data = await res.json();
    setLoading(false);
    setMsg(data.error || 'Perfil actualizado correctamente');
    if (data.profile) setProfile(data.profile);
  }

  return (
    <main style={s.page}>
      <div style={s.container}>
        <Link href="/dashboard" style={s.back}>← Volver al panel</Link>
        <h2>Editar Perfil</h2>

        {msg && <p style={s.msg}>{msg}</p>}

        <form onSubmit={handleSubmit} style={s.form} encType="multipart/form-data">
          <label style={s.label}>Nombre artístico</label>
          <input name="artistic_name" defaultValue={profile.artistic_name || ''} style={s.input} placeholder="Tu nombre artístico" />

          <label style={s.label}>Biografía (máx. 500 caracteres)</label>
          <textarea name="bio" defaultValue={profile.bio || ''} maxLength={500} rows={4} style={s.input} placeholder="Cuéntale a los clientes sobre vos..." />

          <label style={s.label}>Provincia</label>
          <select name="province" defaultValue={profile.province || ''} style={s.input}>
            <option value="">Selecciona una provincia</option>
            {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>

          <label style={s.label}>Foto de perfil (JPG/PNG, máx. 5MB)</label>
          {profile.photo_url && <img src={`http://localhost:3000${profile.photo_url}`} alt="foto" style={s.photo} />}
          <input name="photo" type="file" accept="image/jpeg,image/png" style={s.input} />

          <button type="submit" disabled={loading} style={s.btn}>
            {loading ? 'Guardando...' : 'Guardar perfil'}
          </button>
        </form>
      </div>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f5f5f5', padding: '2rem 1rem' },
  container: { maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
  back: { color: '#0070f3', textDecoration: 'none', fontSize: '0.9rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' },
  label: { fontWeight: 600, fontSize: '0.9rem', marginTop: '0.5rem' },
  input: { padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem', width: '100%' },
  btn: { marginTop: '1rem', padding: '0.75rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' },
  msg: { background: '#e8f5e9', color: '#2e7d32', padding: '0.75rem', borderRadius: '4px' },
  photo: { width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' },
};
