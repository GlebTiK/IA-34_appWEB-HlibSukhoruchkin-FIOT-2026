'use strict';

const request = require('supertest');
const { app } = require('../server');

describe('Puppy Haven API', () => {
  test('GET /api/health returns status 200', async () => {
    const response = await request(app).get('/api/health');
    expect(response.statusCode).toBe(200);
    expect(response.body.ok).toBe(true);
  });

  test('GET /api/puppies validates pagination', async () => {
    const response = await request(app).get('/api/puppies?page=0');
    expect(response.statusCode).toBe(400);
  });

  test('security headers are present', async () => {
    const response = await request(app).get('/api/health');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });
});
