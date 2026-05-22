import supertest from 'supertest';
import request from 'supertest';
import { app } from "../../app";
import { signToken, verifyToken } from '../../utils/auth';
import { saveNewUser } from '../../db';
import { usersPath } from '../../db';
import fs, { readFileSync, writeFileSync } from 'fs';

describe('GET /api/auth/checkAuth', () => {

  test('returns isLogged false when auth header is missing', async () => {
    const response = await request(app).get('/api/auth/checkAuth');

    expect(response.status).toBe(200);
    expect(response.body.data.isLogged).toBe(false);
  });

  test('returns isLogged false with malformed token', async () => {
    const response = await request(app).get('/api/auth/checkAuth').set('Authorization', 'bearer fakeToken');

    expect(response.status).toBe(200);
    expect(response.body.data.isLogged).toBe(false);

  });

  test('returns isLogged true with valid token', async () => {
    const originaUsersDb = fs.readFileSync(usersPath, "utf-8");
    try {
      const userId = 'testUserId';
      const email = 'test@email.com';
      const password = 'testPassword';

      const savedUser = saveNewUser({userId, email, password});
      const token = signToken(savedUser.userId);
      const response = await request(app).get('/api/auth/checkAuth').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.data.isLogged).toBe(true);
    }
    finally {
      fs.writeFileSync(usersPath, originaUsersDb);
    }
  });
});


//describe('GET ')


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

describe('GET /api/auth/logout', () => {
  test('returns 200 when logout ok', async () => {
    const response = await request(app).post('/api/auth/logout');
    expect(response.status).toBe(200);
    expect(response.body.data.isLogged).toBe(false);
  });
});
