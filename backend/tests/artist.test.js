const request = require('supertest');
const path = require('path');
const app = require('../src/app');
const { closeDb } = require('../src/config/database');

// Minimal valid 1x1 PNG buffer
const PNG_BUF = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQAABjE+ibYAAAAASUVORK5CYII=',
  'base64'
);

let artistToken, artistId, clientToken;

beforeAll(async () => {
  const artistRes = await request(app).post('/api/auth/register').send({
    name: 'Artista Test',
    email: 'artista.artist@test.com',
    password: 'password123',
    role: 'artist',
    art_category: 'Musica',
  });
  artistToken = artistRes.body.token;
  artistId = artistRes.body.user.id;

  const clientRes = await request(app).post('/api/auth/register').send({
    name: 'Cliente Test',
    email: 'cliente.client@test.com',
    password: 'password123',
    role: 'client',
  });
  clientToken = clientRes.body.token;
});

afterAll(() => closeDb());

describe('GET /api/artists/:id', () => {
  it('retorna 404 cuando no hay perfil', async () => {
    const res = await request(app).get('/api/artists/99999');
    expect(res.statusCode).toBe(404);
  });
});

describe('PUT /api/artists/profile', () => {
  it('actualiza perfil de artista correctamente', async () => {
    const res = await request(app)
      .put('/api/artists/profile')
      .set('Authorization', `Bearer ${artistToken}`)
      .field('artistic_name', 'La Artista')
      .field('bio', 'Bio de prueba')
      .field('province', 'San José');
    expect(res.statusCode).toBe(200);
    expect(res.body.profile.artistic_name).toBe('La Artista');
  });

  it('rechaza cliente intentando editar perfil artista', async () => {
    const res = await request(app)
      .put('/api/artists/profile')
      .set('Authorization', `Bearer ${clientToken}`)
      .field('artistic_name', 'Hack');
    expect(res.statusCode).toBe(403);
  });

  it('rechaza bio mayor a 500 caracteres', async () => {
    const res = await request(app)
      .put('/api/artists/profile')
      .set('Authorization', `Bearer ${artistToken}`)
      .field('bio', 'x'.repeat(501));
    expect(res.statusCode).toBe(400);
  });
});

describe('GET /api/artists/:id (con perfil creado)', () => {
  it('retorna perfil publico con servicios y portafolio', async () => {
    const res = await request(app).get(`/api/artists/${artistId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.profile).toBeDefined();
    expect(Array.isArray(res.body.services)).toBe(true);
    expect(Array.isArray(res.body.portfolio)).toBe(true);
  });
});

describe('GET /api/artists/me/services', () => {
  it('retorna lista de servicios vacia inicialmente', async () => {
    const res = await request(app)
      .get('/api/artists/me/services')
      .set('Authorization', `Bearer ${artistToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.services)).toBe(true);
  });
});

describe('POST /api/artists/me/services', () => {
  it('crea un servicio correctamente', async () => {
    const res = await request(app)
      .post('/api/artists/me/services')
      .set('Authorization', `Bearer ${artistToken}`)
      .send({ name: 'Show Musical', base_price: 75000, description: 'Concierto en vivo', duration: '2h' });
    expect(res.statusCode).toBe(201);
    expect(res.body.service.name).toBe('Show Musical');
  });

  it('rechaza servicio sin nombre', async () => {
    const res = await request(app)
      .post('/api/artists/me/services')
      .set('Authorization', `Bearer ${artistToken}`)
      .send({ base_price: 10000 });
    expect(res.statusCode).toBe(400);
  });

  it('rechaza cliente creando servicio', async () => {
    const res = await request(app)
      .post('/api/artists/me/services')
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ name: 'Hack', base_price: 1 });
    expect(res.statusCode).toBe(403);
  });
});

describe('PUT /api/artists/me/services/:id', () => {
  let serviceId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/artists/me/services')
      .set('Authorization', `Bearer ${artistToken}`)
      .send({ name: 'Servicio para actualizar', base_price: 30000 });
    serviceId = res.body.service.id;
  });

  it('actualiza nombre y estado de un servicio', async () => {
    const res = await request(app)
      .put(`/api/artists/me/services/${serviceId}`)
      .set('Authorization', `Bearer ${artistToken}`)
      .send({ name: 'Servicio actualizado', base_price: 35000, status: 'inactive' });
    expect(res.statusCode).toBe(200);
    expect(res.body.service.status).toBe('inactive');
  });

  it('retorna 404 para servicio inexistente', async () => {
    const res = await request(app)
      .put('/api/artists/me/services/99999')
      .set('Authorization', `Bearer ${artistToken}`)
      .send({ name: 'X', base_price: 100 });
    expect(res.statusCode).toBe(404);
  });

  it('rechaza actualizar servicio de otro usuario', async () => {
    const res = await request(app)
      .put(`/api/artists/me/services/${serviceId}`)
      .set('Authorization', `Bearer ${clientToken}`)
      .send({ name: 'Robado', base_price: 1 });
    expect(res.statusCode).toBe(403);
  });
});

describe('GET /api/artists/me/portfolio', () => {
  it('retorna portafolio vacio inicialmente', async () => {
    const res = await request(app)
      .get('/api/artists/me/portfolio')
      .set('Authorization', `Bearer ${artistToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.portfolio)).toBe(true);
  });
});

describe('POST /api/artists/me/portfolio', () => {
  it('rechaza subida de portafolio a cliente', async () => {
    const res = await request(app)
      .post('/api/artists/me/portfolio')
      .set('Authorization', `Bearer ${clientToken}`)
      .attach('file', PNG_BUF, { filename: 'test.png', contentType: 'image/png' })
      .field('title', 'Mi foto');
    expect(res.statusCode).toBe(403);
  });

  it('rechaza subida sin archivo', async () => {
    const res = await request(app)
      .post('/api/artists/me/portfolio')
      .set('Authorization', `Bearer ${artistToken}`)
      .send({ title: 'Sin archivo' });
    expect(res.statusCode).toBe(400);
  });

  it('sube una imagen al portafolio', async () => {
    const res = await request(app)
      .post('/api/artists/me/portfolio')
      .set('Authorization', `Bearer ${artistToken}`)
      .attach('file', PNG_BUF, { filename: 'foto.png', contentType: 'image/png' })
      .field('title', 'Mi primera foto');
    expect(res.statusCode).toBe(201);
    expect(res.body.item.file_type).toBe('image');
  });
});

describe('DELETE /api/artists/me/portfolio/:id', () => {
  let itemId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/artists/me/portfolio')
      .set('Authorization', `Bearer ${artistToken}`)
      .attach('file', PNG_BUF, { filename: 'todelete.png', contentType: 'image/png' })
      .field('title', 'Para eliminar');
    itemId = res.body.item?.id;
  });

  it('retorna 404 para item inexistente', async () => {
    const res = await request(app)
      .delete('/api/artists/me/portfolio/99999')
      .set('Authorization', `Bearer ${artistToken}`);
    expect(res.statusCode).toBe(404);
  });

  it('elimina un item del portafolio', async () => {
    if (!itemId) return;
    const res = await request(app)
      .delete(`/api/artists/me/portfolio/${itemId}`)
      .set('Authorization', `Bearer ${artistToken}`);
    expect(res.statusCode).toBe(200);
  });
});
