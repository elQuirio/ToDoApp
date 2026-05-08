import supertest from 'supertest';
import request from 'supertest';
import { app } from "../../app";


describe('GET /api/auth/checkAuth', () => {
    test('returns isLogged false when auth header is missing', async () => {
    const response = await request(app).get('/api/auth/checkAuth');

    expect(response.status).toBe(200);
    expect(response.body.data.isLogged).toBe(false);
    });
  });