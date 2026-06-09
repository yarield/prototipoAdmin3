'use client';

import { useEffect, useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getToken } from '@/lib/api';

interface PortfolioItem { id: number; title: string; description: string; file_url: string; file_type: string; }

export default function PortfolioPage() {
  const router = useRouter();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  function fetchPortfolio() {
    const token = getToken();
    if (!token) { router.push('/auth/login'); return; }
    fetch('http://localhost:3000/api/artists/me/portfolio', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { if (d.portfolio) setItems(d.portfolio); });
  }

  useEffect(() => { fetchPortfolio(); }, []);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) { setPreview(null); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  async function handleUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    const form = e.currentTarget;
    const formData = new FormData(form);
    const res = await fetch('http://localhost:3000/api/artists/me/portfolio', {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: formData,
    });
    const data = await res.json();
    setLoading(false);
    if (data.error) { setMsg(data.error); setMsgType('error'); return; }
    setMsg('Archivo subido al portafolio');
    setMsgType('success');
    setPreview(null);
    form.reset();
    fetchPortfolio();
  }

  async function handleDelete(id: number) {
    if (!confirm('¿Eliminar este archivo del portafolio?')) return;
    await fetch(`http://localhost:3000/api/artists/me/portfolio/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    fetchPortfolio();
  }

  const images = items.filter(i => i.file_type === 'image');
  const videos = items.filter(i => i.file_type === 'video');

  return (
    <main style={s.page}>
      <div style={s.container}>
        <Link href="/dashboard" style={s.back}>← Volver al panel</Link>
        <h2>Mi Portafolio</h2>
        <p style={s.hint}>Podés subir hasta 6 imágenes (JPG/PNG, máx. 5MB) y 1 video (MP4, máx. 50MB).</p>

        {msg && <p style={{ ...s.msg, background: msgType === 'error' ? '#ffebee' : '#e8f5e9', color: msgType === 'error' ? '#c62828' : '#2e7d32' }}>{msg}</p>}

        {images.length > 0 && (
          <section style={s.section}>
            <h3>Imágenes ({images.length}/6)</h3>
            <div style={s.gallery}>
              {images.map(item => (
                <div key={item.id} style={s.mediaCard}>
                  <img src={`http://localhost:3000${item.file_url}`} alt={item.title} style={s.thumb} />
                  <div style={s.cardBody}>
                    <strong style={s.cardTitle}>{item.title}</strong>
                    {item.description && <p style={s.cardDesc}>{item.description}</p>}
                    <button onClick={() => handleDelete(item.id)} style={s.deleteBtn}>Eliminar</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {videos.length > 0 && (
          <section style={s.section}>
            <h3>Video ({videos.length}/1)</h3>
            {videos.map(item => (
              <div key={item.id} style={s.videoCard}>
                <video src={`http://localhost:3000${item.file_url}`} controls style={s.video} />
                <div style={s.cardBody}>
                  <strong style={s.cardTitle}>{item.title}</strong>
                  {item.description && <p style={s.cardDesc}>{item.description}</p>}
                  <button onClick={() => handleDelete(item.id)} style={s.deleteBtn}>Eliminar</button>
                </div>
              </div>
            ))}
          </section>
        )}

        {items.length === 0 && <p style={s.empty}>Aún no tenés archivos en tu portafolio.</p>}

        <section style={s.section}>
          <h3>Subir archivo</h3>
          <form onSubmit={handleUpload} style={s.form} encType="multipart/form-data">
            <input name="title" required placeholder="Título" style={s.input} />
            <textarea name="description" placeholder="Descripción (opcional)" rows={2} style={s.input} />
            <label style={s.fileLabel}>
              Archivo (imagen JPG/PNG o video MP4)
              <input name="file" type="file" accept="image/jpeg,image/png,video/mp4" required style={s.fileInput} onChange={handleFileChange} />
            </label>
            {preview && (
              <div style={s.previewBox}>
                {preview.startsWith('blob:') && (
                  <img src={preview} alt="preview" style={s.previewImg} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
              </div>
            )}
            <button type="submit" disabled={loading} style={s.btn}>{loading ? 'Subiendo...' : 'Subir al portafolio'}</button>
          </form>
        </section>
      </div>
    </main>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f5f5f5', padding: '2rem 1rem' },
  container: { maxWidth: '800px', margin: '0 auto' },
  back: { color: '#0070f3', textDecoration: 'none', fontSize: '0.9rem' },
  hint: { color: '#666', fontSize: '0.9rem', marginBottom: '1rem' },
  msg: { padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem' },
  section: { marginTop: '2rem' },
  gallery: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1rem', marginTop: '0.75rem' },
  mediaCard: { background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  thumb: { width: '100%', height: '140px', objectFit: 'cover', display: 'block' },
  cardBody: { padding: '0.75rem' },
  cardTitle: { fontSize: '0.9rem', display: 'block' },
  cardDesc: { fontSize: '0.8rem', color: '#666', margin: '0.25rem 0' },
  videoCard: { background: '#fff', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', marginTop: '0.75rem' },
  video: { width: '100%', maxHeight: '280px', display: 'block' },
  deleteBtn: { marginTop: '0.5rem', padding: '0.25rem 0.6rem', border: '1px solid #ffcdd2', background: '#ffebee', color: '#c62828', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' },
  empty: { color: '#999', fontStyle: 'italic', marginTop: '1rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.5rem', background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  input: { padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' },
  fileLabel: { fontWeight: 600, fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  fileInput: { marginTop: '0.25rem' },
  previewBox: { marginTop: '0.5rem' },
  previewImg: { maxWidth: '200px', maxHeight: '150px', borderRadius: '4px', objectFit: 'cover' },
  btn: { padding: '0.75rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600, fontSize: '1rem' },
};
