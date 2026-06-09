const request = require('supertest');
const app = require('../src/app');
const { closeDb } = require('../src/config/database');

let artistToken, artistId, clientToken;

beforeAll(async () => {
  const artistRes = await request(app).post('/api/auth/register').send({
    name: 'Buscable Artista',
    email: 'buscable@test.com',
    password: 'password123',
    role: 'artist',
    art_category: 'Música',
  });
  artistToken = artistRes.body.token;
  artistId = artistRes.body.user.id;

  await request(app)
    .put('/api/artists/profile')
    .set('Authorization', `Bearer ${artistToken}`)
    .field('artistic_name', 'El Músico')
    .field('province', 'San José');

  const clientRes = await request(app).post('/api/auth/register').send({
    name: 'Buscador Cliente',
    email: 'buscador@test.com',
    password: 'password123',
    role: 'client',
  });
  clientToken = clientRes.body.token;
});

afterAll(() => closeDb());

describe('GET /api/search', () => {
  it('retorna artistas sin filtros', async () => {
    const res = await request(app).get('/api/search');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.artists)).toBe(true);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
  });

  it('filtra por categoria', async () => {
    const res = await request(app).get('/api/search?category=Música');
    expect(res.statusCode).toBe(200);
    expect(res.body.artists.length).toBeGreaterThanOrEqual(1);
  });

  it('filtra por provincia', async () => {
    const res = await request(app).get('/api/search?province=San José');
    expect(res.statusCode).toBe(200);
  });

  it('filtra por nombre', async () => {
    const res = await request(app).get('/api/search?name=Músico');
    expect(res.statusCode).toBe(200);
  });

  it('soporta paginacion', async () => {
    const res = await request(app).get('/api/search?page=1&limit=5');
    expect(res.statusCode).toBe(200);
    expect(res.body.page).toBe(1);
  });
});

describe('GET /api/availability/:artistId', () => {
  it('retorna disponibilidad publica del artista', async () => {
    const res = await request(app).get(`/api/availability/${artistId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.availability)).toBe(true);
  });
});

describe('POST /api/availability', () => {
  it('artista marca fecha como disponible', async () => {
    const res = await request(app)
      .post('/api/availability')
      .set('Authorization', `Bearer ${artistToken}`)
      .send({ date: '2026-07-15', status: 'available' });
    expect(res.statusCode).toBe(200);
    expect(res.body.slot.status).toBe('available');
  });

  it('artista marca fecha como no disponible', async () => {
    const res = await request(app)
      .post('/api/availability')
      .set('Authorization', `Bearer ${artistToken}`)
      .send({ date: '2026-07-20', status: 'unavailable' });
    expect(res.statusCode).toBe(200);
  });

  it('rechaza cliente intentando marcar disponibilidad', async () => {
    const res = await request(app)
      .post('/api/availability')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ date: '2026-07-15', status: 'available' });
    expect(res.statusCode).toBe(403);
  });

  it('rechaza estado invalido', async () => {
    const res = await request(app)
      .post('/api/availability')
      .set('Authorization', `Bearer ${artistToken}`)
      .send({ date: '2026-07-15', status: 'ocupado' });
    expect(res.statusCode).toBe(400);
  });

  it('rechaza sin fecha', async () => {
    const res = await request(app)
      .post('/api/availability')
      .set('Authorization', `Bearer ${artistToken}`)
      .send({ status: 'available' });
    expect(res.statusCode).toBe(400);
  });
});

describe('DELETE /api/availability/:date', () => {
  it('artista elimina una fecha de la agenda', async () => {
    await request(app)
      .post('/api/availability')
      .set('Authorization', `Bearer ${artistToken}`)
      .send({ date: '2026-08-01', status: 'available' });
    const res = await request(app)
      .delete('/api/availability/2026-08-01')
      .set('Authorization', `Bearer ${artistToken}`);
    expect(res.statusCode).toBe(200);
  });
});

describe('POST /api/requests', () => {
  it('cliente crea solicitud de contratacion', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ artist_id: artistId, event_date: '2026-07-15', event_type: 'Cumpleaños', description: 'Fiesta en casa' });
    expect(res.statusCode).toBe(201);
    expect(res.body.request.status).toBe('pending');
  });

  it('rechaza artista creando solicitud', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${artistToken}`)
      .send({ artist_id: artistId, event_date: '2026-07-15', event_type: 'Evento' });
    expect(res.statusCode).toBe(403);
  });

  it('rechaza solicitud sin campos requeridos', async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ artist_id: artistId });
    expect(res.statusCode).toBe(400);
  });
});

describe('GET /api/requests', () => {
  it('cliente obtiene sus solicitudes', async () => {
    const res = await request(app)
      .get('/api/requests')
      .set('Authorization', `Bearer ${clientToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.requests)).toBe(true);
  });

  it('artista obtiene solicitudes recibidas', async () => {
    const res = await request(app)
      .get('/api/requests')
      .set('Authorization', `Bearer ${artistToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.requests)).toBe(true);
  });
});

describe('PUT /api/requests/:id', () => {
  let requestId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ artist_id: artistId, event_date: '2026-09-10', event_type: 'Boda' });
    requestId = res.body.request?.id;
  });

  it('artista acepta una solicitud', async () => {
    if (!requestId) return;
    const res = await request(app)
      .put(`/api/requests/${requestId}`)
      .set('Authorization', `Bearer ${artistToken}`)
      .send({ status: 'accepted' });
    expect(res.statusCode).toBe(200);
    expect(res.body.request.status).toBe('accepted');
  });

  it('retorna 404 para solicitud inexistente', async () => {
    const res = await request(app)
      .put('/api/requests/99999')
      .set('Authorization', `Bearer ${artistToken}`)
      .send({ status: 'accepted' });
    expect(res.statusCode).toBe(404);
  });

  it('rechaza estado invalido', async () => {
    if (!requestId) return;
    const res = await request(app)
      .put(`/api/requests/${requestId}`)
      .set('Authorization', `Bearer ${artistToken}`)
      .send({ status: 'borrar' });
    expect(res.statusCode).toBe(400);
  });

  it('rechaza cliente actualizando estado de solicitud', async () => {
    if (!requestId) return;
    const res = await request(app)
      .put(`/api/requests/${requestId}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ status: 'accepted' });
    expect(res.statusCode).toBe(403);
  });
});

describe('GET /api/notifications', () => {
  it('retorna notificaciones del usuario', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${artistToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.notifications)).toBe(true);
    expect(typeof res.body.unread).toBe('number');
  });
});

describe('PUT /api/notifications/read', () => {
  it('marca todas las notificaciones como leidas', async () => {
    const res = await request(app)
      .put('/api/notifications/read')
      .set('Authorization', `Bearer ${artistToken}`);
    expect(res.statusCode).toBe(200);
  });
});
