import Link from 'next/link';

export default function Home() {
  return (
    <main style={s.page}>
      <div style={s.hero}>
        <h1 style={s.title}>ArtConnect</h1>
        <p style={s.subtitle}>Conectamos artistas y clientes para hacer tus eventos inolvidables</p>
        <div style={s.actions}>
          <Link href="/auth/login" style={s.btnPrimary}>Iniciar sesión</Link>
          <Link href="/auth/register" style={s.btnSecondary}>Registrarse</Link>
        </div>
      </div>

      <div style={s.features}>
        <div style={s.card}>
          <span style={s.icon}>🎭</span>
          <h3>Artistas verificados</h3>
          <p>Músicos, bailarines, magos, comediantes y más categorías artísticas.</p>
        </div>
        <div style={s.card}>
          <span style={s.icon}>📅</span>
          <h3>Agenda disponible</h3>
          <p>Consulta la disponibilidad del artista antes de enviar tu solicitud.</p>
        </div>
        <div style={s.card}>
          <span style={s.icon}>🖼️</span>
          <h3>Portafolio multimedia</h3>
          <p>Mira fotos y videos del trabajo de cada artista antes de contratar.</p>
        </div>
      </div>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f5f5f5', fontFamily: 'sans-serif' },
  hero: { background: '#0070f3', color: '#fff', padding: '5rem 2rem', textAlign: 'center' },
  title: { fontSize: '3rem', margin: '0 0 1rem', fontWeight: 700 },
  subtitle: { fontSize: '1.2rem', opacity: 0.9, maxWidth: '540px', margin: '0 auto 2rem' },
  actions: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' },
  btnPrimary: { background: '#fff', color: '#0070f3', padding: '0.85rem 2rem', borderRadius: '6px', fontWeight: 700, textDecoration: 'none', fontSize: '1rem' },
  btnSecondary: { background: 'transparent', color: '#fff', padding: '0.85rem 2rem', borderRadius: '6px', fontWeight: 700, textDecoration: 'none', fontSize: '1rem', border: '2px solid rgba(255,255,255,0.7)' },
  features: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.5rem', maxWidth: '900px', margin: '3rem auto', padding: '0 1.5rem' },
  card: { background: '#fff', padding: '2rem', borderRadius: '10px', boxShadow: '0 2px 8px rgba(0,0,0,0.07)', textAlign: 'center' },
  icon: { fontSize: '2.5rem', display: 'block', marginBottom: '0.75rem' },
};
