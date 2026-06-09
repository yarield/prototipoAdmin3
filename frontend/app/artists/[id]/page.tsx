'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getToken } from '@/lib/api';

interface ArtistProfile { id: number; user_id: number; artistic_name: string; bio: string; province: string; photo_url: string; name: string; email: string; art_category: string; }
interface Service { id: number; name: string; description: string; base_price: number; duration: string; }
interface PortfolioItem { id: number; file_url: string; file_type: string; title: string; }
interface Slot { date: string; status: string; }

export default function ArtistPublicPage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [availability, setAvailability] = useState<Slot[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`http://localhost:3000/api/artists/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setNotFound(true); return; }
        setProfile(d.profile);
        setServices(d.services || []);
        setPortfolio(d.portfolio || []);
      });
    fetch(`http://localhost:3000/api/availability/${id}`)
      .then(r => r.json())
      .then(d => setAvailability(d.availability || []));
  }, [id]);

  if (notFound) return (
    <main style={s.page}>
      <div style={s.container}>
        <Link href="/search" style={s.back}>← Volver a búsqueda</Link>
        <p style={{ marginTop: '2rem', color: '#999' }}>Artista no encontrado.</p>
      </div>
    </main>
  );

  if (!profile) return <p style={{ padding: '2rem' }}>Cargando...</p>;

  const isLoggedIn = !!getToken();
  const availableDates = availability.filter(a => a.status === 'available').map(a => a.date);

  return (
    <main style={s.page}>
      <header style={s.header}>
        <Link href="/search" style={s.logo}>← Artistas</Link>
        {isLoggedIn && <Link href="/dashboard" style={s.dashLink}>Mi panel</Link>}
      </header>

      <div style={s.container}>
        <div style={s.profileCard}>
          {profile.photo_url
            ? <img src={`http://localhost:3000${profile.photo_url}`} alt={profile.name} style={s.avatar} />
            : <div style={s.avatarPlaceholder}>{(profile.artistic_name || profile.name).charAt(0)}</div>}
          <div>
            <h1 style={s.artistName}>{profile.artistic_name || profile.name}</h1>
            <span style={s.category}>{profile.art_category}</span>
            {profile.province && <p style={s.province}>📍 {profile.province}</p>}
            {profile.bio && <p style={s.bio}>{profile.bio}</p>}
          </div>
        </div>

        {services.length > 0 && (
          <section style={s.section}>
            <h2>Servicios</h2>
            <div style={s.serviceGrid}>
              {services.map(sv => (
                <div key={sv.id} style={s.serviceCard}>
                  <strong>{sv.name}</strong>
                  <p style={s.serviceDesc}>{sv.description}</p>
                  <p style={s.price}>₡{sv.base_price?.toLocaleString()}</p>
                  {sv.duration && <p style={s.duration}>⏱ {sv.duration}</p>}
                  {isLoggedIn && (
                    <Link href={`/request/${id}?service=${sv.id}`} style={s.reqBtn}>Contratar</Link>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {availableDates.length > 0 && (
          <section style={s.section}>
            <h2>Fechas disponibles</h2>
            <div style={s.dateGrid}>
              {availableDates.map(d => (
                <span key={d} style={s.dateBadge}>{d}</span>
              ))}
            </div>
          </section>
        )}

        {portfolio.length > 0 && (
          <section style={s.section}>
            <h2>Portafolio</h2>
            <div style={s.portfolioGrid}>
              {portfolio.filter(i => i.file_type === 'image').map(item => (
                <img key={item.id} src={`http://localhost:3000${item.file_url}`} alt={item.title || ''} style={s.portfolioImg} />
              ))}
              {portfolio.filter(i => i.file_type === 'video').map(item => (
                <video key={item.id} src={`http://localhost:3000${item.file_url}`} controls style={s.portfolioVideo} />
              ))}
            </div>
          </section>
        )}

        {isLoggedIn && (
          <div style={s.ctaBox}>
            <Link href={`/request/${id}`} style={s.ctaBtn}>Enviar solicitud de contratación</Link>
          </div>
        )}
        {!isLoggedIn && (
          <div style={s.ctaBox}>
            <Link href="/auth/login" style={s.ctaBtn}>Inicia sesión para contratar</Link>
          </div>
        )}
      </div>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f5f5f5' },
  header: { background: '#fff', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  logo: { color: '#0070f3', textDecoration: 'none', fontWeight: 600 },
  dashLink: { color: '#0070f3', textDecoration: 'none' },
  container: { maxWidth: '800px', margin: '2rem auto', padding: '0 1.5rem' },
  back: { color: '#0070f3', textDecoration: 'none', fontSize: '0.9rem' },
  profileCard: { background: '#fff', borderRadius: '12px', padding: '2rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', gap: '1.5rem', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap' },
  avatar: { width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 },
  avatarPlaceholder: { width: '100px', height: '100px', borderRadius: '50%', background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 700, color: '#0070f3', flexShrink: 0 },
  artistName: { margin: '0 0 0.5rem', fontSize: '1.6rem' },
  category: { background: '#e8f0fe', color: '#0070f3', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 600 },
  province: { color: '#666', fontSize: '0.9rem', marginTop: '0.5rem' },
  bio: { color: '#444', fontSize: '0.95rem', marginTop: '0.75rem', lineHeight: 1.6 },
  section: { background: '#fff', borderRadius: '12px', padding: '1.5rem', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '1.5rem' },
  serviceGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' },
  serviceCard: { border: '1px solid #eee', borderRadius: '8px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  serviceDesc: { fontSize: '0.85rem', color: '#555' },
  price: { fontWeight: 700, color: '#0070f3' },
  duration: { fontSize: '0.8rem', color: '#666' },
  reqBtn: { marginTop: '0.5rem', background: '#0070f3', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '4px', textDecoration: 'none', fontSize: '0.85rem', textAlign: 'center' },
  dateGrid: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' },
  dateBadge: { background: '#e8f5e9', color: '#2e7d32', padding: '0.3rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600 },
  portfolioGrid: { display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.75rem' },
  portfolioImg: { width: '140px', height: '100px', objectFit: 'cover', borderRadius: '6px' },
  portfolioVideo: { maxWidth: '300px', borderRadius: '6px' },
  ctaBox: { textAlign: 'center', marginTop: '1rem', marginBottom: '2rem' },
  ctaBtn: { background: '#0070f3', color: '#fff', padding: '0.85rem 2.5rem', borderRadius: '6px', textDecoration: 'none', fontWeight: 700, fontSize: '1rem' },
};
