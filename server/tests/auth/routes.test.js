import request from 'supertest';
import { app } from "../../app";
import { signToken } from '../../utils/auth';
import { takeDbSnapshot, restoreDbSnapshot } from '../helpers/testDbHelper';

let dbSnapshot;

beforeEach(() => {
  dbSnapshot = takeDbSnapshot();
});

afterEach(() => {
  restoreDbSnapshot(dbSnapshot);
});

describe('GET /api/auth/checkAuth', () => {

  test('returns isLogged false when auth header is missing', async () => {
    const response = await request(app).get('/api/auth/checkAuth');

    expect(response.status).toBe(200);
    expect(response.body.data.isLogged).toBe(false);
  });

  test('returns isLogged false with malformed token', async () => {
    const response = await request(app).get('/api/auth/checkAuth').set('Authorization', 'Bearer fakeToken');

    expect(response.status).toBe(200);
    expect(response.body.data.isLogged).toBe(false);

  });

  test('returns isLogged true with valid token', async () => {
    const email = 'test@email.com';
    const password = 'testPassword';
  
    const registerResponse = await request(app).post('/api/auth/register').send({email, password, confirmPassword: password});
    const token = registerResponse.body.data.token
    const response = await request(app).get('/api/auth/checkAuth').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data.isLogged).toBe(true);
  });
});


describe('GET /api/todos', () => {
  test('returns 401 when no token is provided', async () => {
    const response = await request(app).get('/api/todos');
    expect(response.status).toBe(401);
  });
});


describe('GET /api/preferences', () => {
  test('returns 401 when no token is provided', async () => {
    const response = await request(app).get('/api/preferences');
    expect(response.status).toBe(401);
  });
});


describe('GET /api/chat/messages', () => {
  test('returns 401 when no token is provided', async () => {
    const response = await request(app).get('/api/chat/messages');
    expect(response.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  test('returns 200 when logout ok', async () => {
    const response = await request(app).post('/api/auth/logout');
    expect(response.status).toBe(200);
    expect(response.body.data.isLogged).toBe(false);
  });
});



describe('POST /api/auth/register', () => {

  test('returns 400 if email is missing', async () => {
    const password = 'testPassword';
    const confirmPassword = 'testPassword';

    const response = await request(app).post('/api/auth/register').send({password, confirmPassword});
    expect(response.status).toBe(400);
    expect(response.body.data.isLogged).toBe(false);
  });

  test('returns 400 if password is missing', async () => {
    const email = 'test@email.com';
    const password = 'testPassword';
    const confirmPassword = 'testPassword';

    const response = await request(app).post('/api/auth/register').send({email});
    expect(response.status).toBe(400);
    expect(response.body.data.isLogged).toBe(false);
  });

  test("returns 400 if passwords don't match", async () => {
    const email = 'test@email.com';
    const password = 'testPassword';
    const confirmPassword = 'testNewPassword';

    const response = await request(app).post('/api/auth/register').send({email, password, confirmPassword});
    expect(response.status).toBe(400);
    expect(response.body.data.isLogged).toBe(false);
  });

  test('returns 409 if user already exists', async () => {
    const email = 'test@email.com';
    const password = 'testPassword';
    const confirmPassword = 'testPassword';

    await request(app).post('/api/auth/register').send({email, password, confirmPassword});

    const response = await request(app).post('/api/auth/register').send({email, password, confirmPassword});
    expect(response.status).toBe(409);
    expect(response.body.data.isLogged).toBe(false);
  });


  test('returns 201 with successful registration', async () => {
    const email = 'test@email.com';
    const password = 'testPassword';
    const confirmPassword = 'testPassword';

    const response = await request(app).post('/api/auth/register').send({email, password, confirmPassword});
    expect(response.status).toBe(201);
    expect(response.body.data.isLogged).toBe(true);
  });

});


describe('POST /api/auth/login', () => {

  test('returns 400 if user is missing', async () => {
    const password = 'testPassword';

    const response = await request(app).post('/api/auth/login').send({password});
    expect(response.status).toBe(400);
    expect(response.body.data.isLogged).toBe(false);
  });

  test('returns 400 if password is missing', async () => {
    const email = 'test@email.com';

    const response = await request(app).post('/api/auth/login').send({email});
    expect(response.status).toBe(400);
    expect(response.body.data.isLogged).toBe(false);
  });

  test("returns 401 if user doesn't exist", async () => {
    const email = 'test@email.com';
    const password = 'testPassword';

    const response = await request(app).post('/api/auth/login').send({email, password});
    expect(response.status).toBe(401);
    expect(response.body.data.isLogged).toBe(false);
  });

  test("returns 401 if passwords don't match", async () => {
    const email = 'test@email.com';
    const registerPassword = 'registerPassword';
    const testPassword = 'testPassword';

    await request(app).post('/api/auth/register').send({email, password: registerPassword, confirmPassword: registerPassword});

    const response = await request(app).post('/api/auth/login').send({email, password: testPassword});
    expect(response.status).toBe(401);
    expect(response.body.data.isLogged).toBe(false);
  });

  test("returns 200 with successful login", async () => {
    const email = 'test@email.com';
    const password = 'registerPassword';

    await request(app).post('/api/auth/register').send({email, password, confirmPassword: password});

    const response = await request(app).post('/api/auth/login').send({email, password: password});
    expect(response.status).toBe(200);
    expect(response.body.data.isLogged).toBe(true);
  });

});

