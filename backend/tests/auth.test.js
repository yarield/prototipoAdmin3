const request = require('supertest');
const app = require('../src/app');
const { closeDb } = require('../src/config/database');

afterAll(() => closeDb());

describe('POST /api/auth/register', () => {
  it('registra un cliente correctamente', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Juan Perez',
      email: 'juan@test.com',
      password: 'password123',
      role: 'client',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.role).toBe('client');
  });

  it('registra un artista con categoria', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Maria Artista',
      email: 'maria@test.com',
      password: 'password123',
      role: 'artist',
      art_category: 'Musica',
    });
    expect(res.statusCode).toBe(201);
    expect(res.body.user.art_category).toBe('Musica');
  });

  it('rechaza registro con correo duplicado', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Duplicado',
      email: 'dup@test.com',
      password: 'password123',
      role: 'client',
    });
    const res = await request(app).post('/api/auth/register').send({
      name: 'Duplicado 2',
      email: 'dup@test.com',
      password: 'password123',
      role: 'client',
    });
    expect(res.statusCode).toBe(409);
  });

  it('rechaza contrasena menor a 8 caracteres', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Test',
      email: 'short@test.com',
      password: '123',
      role: 'client',
    });
    expect(res.statusCode).toBe(400);
  });

  it('rechaza artista sin categoria', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Artista sin cat',
      email: 'artcat@test.com',
      password: 'password123',
      role: 'artist',
    });
    expect(res.statusCode).toBe(400);
  });

  it('rechaza campos faltantes', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'x@test.com' });
    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeAll(async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login User',
      email: 'login@test.com',
      password: 'password123',
      role: 'client',
    });
  });

  it('inicia sesion con credenciales correctas', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@test.com',
      password: 'password123',
    });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it('rechaza contrasena incorrecta', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'login@test.com',
      password: 'wrongpass',
    });
    expect(res.statusCode).toBe(401);
  });

  it('rechaza correo inexistente', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'noexiste@test.com',
      password: 'password123',
    });
    expect(res.statusCode).toBe(401);
  });

  it('rechaza campos vacios', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.statusCode).toBe(400);
  });
});

describe('POST /api/auth/logout y GET /api/auth/me', () => {
  let token;

  beforeAll(async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Logout User',
      email: 'logout@test.com',
      password: 'password123',
      role: 'client',
    });
    token = res.body.token;
  });

  it('cierra sesion con token valido', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });

  it('obtiene datos del usuario autenticado', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe('logout@test.com');
  });

  it('rechaza acceso sin token', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.statusCode).toBe(401);
  });

  it('rechaza token invalido', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer token_invalido');
    expect(res.statusCode).toBe(401);
  });
});
