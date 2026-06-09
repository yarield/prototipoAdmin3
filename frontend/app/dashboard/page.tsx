'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getToken, removeToken } from '@/lib/api';

interface User { id: number; name: string; email: string; role: string; }
interface NotifCount { unread: number; }

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const token = getToken();
    if (!token) { router.push('/auth/login'); return; }
    fetch('http://localhost:3000/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.user) { setUser(d.user); } else { router.push('/auth/login'); } })
      .catch(() => router.push('/auth/login'));
    fetch('http://localhost:3000/api/notifications', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (typeof d.unread === 'number') setUnread(d.unread); })
      .catch(() => {});
  }, [router]);

  function logout() {
    removeToken();
    router.push('/auth/login');
  }

  if (!user) return <p style={{ padding: '2rem' }}>Cargando...</p>;

  return (
    <main style={s.page}>
      <header style={s.header}>
        <h1 style={s.logo}>ArtConnect</h1>
        <div style={s.headerRight}>
          <span>Hola, {user.name}</span>
          <Link href="/dashboard/notifications" style={s.notifBtn}>
            🔔{unread > 0 && <span style={s.notifBadge}>{unread}</span>}
          </Link>
          <button onClick={logout} style={s.logoutBtn}>Cerrar sesión</button>
        </div>
      </header>

      <div style={s.container}>
        <h2>Panel de {user.role === 'artist' ? 'Artista' : 'Cliente'}</h2>

        {user.role === 'artist' && (
          <div style={s.grid}>
            <Link href="/dashboard/profile" style={s.card}>
              <span style={s.icon}>👤</span>
              <strong>Mi Perfil</strong>
              <p>Edita tu información y foto</p>
            </Link>
            <Link href="/dashboard/services" style={s.card}>
              <span style={s.icon}>🎭</span>
              <strong>Mis Servicios</strong>
              <p>Gestiona tus servicios artísticos</p>
            </Link>
            <Link href="/dashboard/portfolio" style={s.card}>
              <span style={s.icon}>🖼️</span>
              <strong>Portafolio</strong>
              <p>Sube fotos y videos de tu trabajo</p>
            </Link>
            <Link href="/dashboard/availability" style={s.card}>
              <span style={s.icon}>📅</span>
              <strong>Mi Agenda</strong>
              <p>Gestiona tu disponibilidad</p>
            </Link>
            <Link href="/dashboard/requests" style={s.card}>
              <span style={s.icon}>📋</span>
              <strong>Solicitudes</strong>
              <p>Revisa solicitudes de contratación</p>
            </Link>
          </div>
        )}

        {user.role === 'client' && (
          <div style={s.grid}>
            <Link href="/search" style={s.card}>
              <span style={s.icon}>🔍</span>
              <strong>Buscar Artistas</strong>
              <p>Encuentra el talento ideal</p>
            </Link>
            <Link href="/dashboard/requests" style={s.card}>
              <span style={s.icon}>📋</span>
              <strong>Mis Solicitudes</strong>
              <p>Revisa el estado de tus contrataciones</p>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f5f5f5' },
  header: { background: '#fff', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' },
  logo: { margin: 0, color: '#0070f3' },
  headerRight: { display: 'flex', alignItems: 'center', gap: '1rem' },
  notifBtn: { position: 'relative', fontSize: '1.3rem', textDecoration: 'none', color: '#333' },
  notifBadge: { position: 'absolute', top: '-6px', right: '-8px', background: '#e53935', color: '#fff', borderRadius: '50%', fontSize: '0.65rem', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 },
  logoutBtn: { padding: '0.4rem 1rem', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', background: '#fff' },
  container: { maxWidth: '900px', margin: '2rem auto', padding: '0 1rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1.5rem' },
  card: { background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', textDecoration: 'none', color: '#333', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  icon: { fontSize: '2rem' },
};
