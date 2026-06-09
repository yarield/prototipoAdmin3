'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiPost, saveToken } from '@/lib/api';

const ART_CATEGORIES = ['Música', 'Baile', 'Teatro', 'Pintura', 'Escultura', 'Humor/Stand-up', 'Malabares', 'Otro'];

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'client' | 'artist'>('client');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const form = e.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const art_category = role === 'artist'
      ? (form.elements.namedItem('art_category') as HTMLSelectElement).value
      : undefined;

    const data = await apiPost('/auth/register', { name, email, password, role, art_category });
    setLoading(false);

    if (data.error) {
      setError(data.error);
      return;
    }

    saveToken(data.token);
    router.push('/dashboard');
  }

  return (
    <main style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Crear Cuenta</h1>
        <p style={styles.subtitle}>Plataforma de Servicios Artísticos</p>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.roleToggle}>
          <button
            type="button"
            onClick={() => setRole('client')}
            style={{ ...styles.roleBtn, ...(role === 'client' ? styles.roleActive : {}) }}
          >
            Soy Cliente
          </button>
          <button
            type="button"
            onClick={() => setRole('artist')}
            style={{ ...styles.roleBtn, ...(role === 'artist' ? styles.roleActive : {}) }}
          >
            Soy Artista
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>Nombre completo</label>
          <input name="name" type="text" required style={styles.input} placeholder="Tu nombre" />

          <label style={styles.label}>Correo electrónico</label>
          <input name="email" type="email" required style={styles.input} placeholder="correo@ejemplo.com" />

          <label style={styles.label}>Contraseña (mín. 8 caracteres)</label>
          <input name="password" type="password" required minLength={8} style={styles.input} placeholder="••••••••" />

          {role === 'artist' && (
            <>
              <label style={styles.label}>Categoría artística</label>
              <select name="art_category" required style={styles.input}>
                <option value="">Selecciona una categoría</option>
                {ART_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </>
          )}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Registrando...' : `Registrarme como ${role === 'client' ? 'Cliente' : 'Artista'}`}
          </button>
        </form>

        <p style={styles.link}>
          ¿Ya tienes cuenta?{' '}
          <Link href="/auth/login">Inicia sesión aquí</Link>
        </p>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' },
  card: { background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', width: '100%', maxWidth: '420px' },
  title: { margin: '0 0 0.25rem', fontSize: '1.5rem', fontWeight: 700 },
  subtitle: { margin: '0 0 1rem', color: '#666', fontSize: '0.9rem' },
  error: { background: '#fee', color: '#c00', padding: '0.75rem', borderRadius: '4px', marginBottom: '1rem', fontSize: '0.9rem' },
  roleToggle: { display: 'flex', gap: '0.5rem', marginBottom: '1rem' },
  roleBtn: { flex: 1, padding: '0.5rem', border: '2px solid #ddd', borderRadius: '4px', background: '#f9f9f9', cursor: 'pointer', fontWeight: 600 },
  roleActive: { borderColor: '#0070f3', background: '#e8f0fe', color: '#0070f3' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontWeight: 600, fontSize: '0.9rem' },
  input: { padding: '0.6rem', border: '1px solid #ddd', borderRadius: '4px', fontSize: '1rem' },
  button: { marginTop: '0.5rem', padding: '0.75rem', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', fontSize: '1rem', cursor: 'pointer', fontWeight: 600 },
  link: { marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' },
};
