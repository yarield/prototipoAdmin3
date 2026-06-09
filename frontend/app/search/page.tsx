'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { getToken } from '@/lib/api';

const CATEGORIES = ['Música', 'Baile', 'Teatro', 'Pintura', 'Escultura', 'Humor/Stand-up', 'Malabares', 'Otro'];
const PROVINCES = ['San José', 'Alajuela', 'Cartago', 'Heredia', 'Guanacaste', 'Puntarenas', 'Limón'];

interface Artist {
  id: number;
  name: string;
  art_category: string;
  artistic_name: string;
  bio: string;
  province: string;
  photo_url: string;
}

export default function SearchPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [province, setProvince] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const fetchArtists = useCallback(async (n: string, cat: string, prov: string) => {
    const params = new URLSearchParams();
    if (n) params.set('name', n);
    if (cat) params.set('category', cat);
    if (prov) params.set('province', prov);
    const res = await fetch(`http://localhost:3000/api/search?${params}`);
    const data = await res.json();
    setArtists(data.artists || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    setIsLoggedIn(!!getToken());
    fetchArtists('', '', '');
  }, [fetchArtists]);

  function handleName(v: string) { setName(v); setLoading(true); fetchArtists(v, category, province); }
  function handleCategory(v: string) { setCategory(v); setLoading(true); fetchArtists(name, v, province); }
  function handleProvince(v: string) { setProvince(v); setLoading(true); fetchArtists(name, category, v); }

  return (
    <main style={s.page}>
      <header style={s.header}>
        <Link href="/" style={s.logo}>ArtConnect</Link>
        <div style={s.headerRight}>
          {isLoggedIn
            ? <Link href="/dashboard" style={s.link}>Mi panel</Link>
            : (
              <>
                <Link href="/auth/login" style={s.link}>Iniciar sesión</Link>
                <Link href="/auth/register" style={s.btnSmall}>Registrarse</Link>
              </>
            )}
        </div>
      </header>

      <div style={s.container}>
        <h2>Buscar artistas</h2>
        <p style={s.hint}>{total} artista{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}</p>

        <div style={s.filters}>
          <input
            placeholder="Buscar por nombre..."
            value={name}
            onChange={e => handleName(e.target.value)}
            style={s.filterInput}
          />
          <select value={category} onChange={e => handleCategory(e.target.value)} style={s.filterInput}>
            <option value="">Todas las categorías</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={province} onChange={e => handleProvince(e.target.value)} style={s.filterInput}>
            <option value="">Todas las provincias</option>
            {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {loading && <p style={s.hint}>Buscando...</p>}

        {!loading && (
          <div style={s.grid}>
            {artists.map(a => (
              <Link key={a.id} href={`/artists/${a.id}`} style={s.card}>
                <div style={s.photoWrapper}>
                  {a.photo_url
                    /* eslint-disable-next-line @next/next/no-img-element */
                    ? <img src={`http://localhost:3000${a.photo_url}`} alt={a.artistic_name || a.name} style={s.photo} />
                    : <div style={s.photoPlaceholder}>{(a.artistic_name || a.name).charAt(0)}</div>}
                </div>
                <div style={s.cardBody}>
                  <strong>{a.artistic_name || a.name}</strong>
                  <span style={s.category}>{a.art_category}</span>
                  {a.province && <span style={s.province}>📍 {a.province}</span>}
                  {a.bio && <p style={s.bio}>{a.bio.slice(0, 80)}{a.bio.length > 80 ? '...' : ''}</p>}
                </div>
              </Link>
            ))}
            {artists.length === 0 && <p style={s.empty}>No se encontraron artistas con esos filtros.</p>}
          </div>
        )}
      </div>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f5f5f5', fontFamily: 'Arial, sans-serif' },
  header: { background: '#fff', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  logo: { color: '#0070f3', fontWeight: 700, fontSize: '1.3rem', textDecoration: 'none' },
  headerRight: { display: 'flex', gap: '1rem', alignItems: 'center' },
  link: { color: '#0070f3', textDecoration: 'none', fontSize: '0.95rem' },
  btnSmall: { background: '#0070f3', color: '#fff', padding: '0.4rem 1rem', borderRadius: '4px', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 600 },
  container: { maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem' },
  hint: { color: '#666', fontSize: '0.9rem', margin: '0.25rem 0 1rem' },
  filters: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' },
  filterInput: { padding: '0.6rem 0.8rem', border: '1px solid #ddd', borderRadius: '6px', fontSize: '0.95rem', minWidth: '180px', background: '#fff' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' },
  card: { background: '#fff', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', textDecoration: 'none', color: '#333', overflow: 'hidden' },
  photoWrapper: { height: '140px', background: '#e8f0fe', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  photo: { width: '100%', height: '100%', objectFit: 'cover' },
  photoPlaceholder: { fontSize: '3rem', fontWeight: 700, color: '#0070f3' },
  cardBody: { padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' },
  category: { fontSize: '0.8rem', background: '#e8f0fe', color: '#0070f3', padding: '0.15rem 0.5rem', borderRadius: '4px', alignSelf: 'flex-start', fontWeight: 600 },
  province: { fontSize: '0.8rem', color: '#666' },
  bio: { fontSize: '0.85rem', color: '#555', marginTop: '0.25rem' },
  empty: { textAlign: 'center', color: '#999', marginTop: '3rem', fontSize: '1.1rem', gridColumn: '1 / -1' },
};
