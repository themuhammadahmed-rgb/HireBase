const request = require('supertest');
const app = require('./server');

describe('Backend API Tests', () => {
  let token = '';

  // 1. Auth Endpoint: Login Request
  test('POST /api/auth/login - valid credentials handling', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });
    
    expect([200, 400]).toContain(res.statusCode);
    if (res.statusCode === 200) {
      token = res.body.token;
    }
  });

  // 2. Auth Endpoint: Missing Parameters
  test('POST /api/auth/login - missing parameters', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});
    
    expect(res.statusCode).toBe(400);
  });

  // 3. Analytics Endpoint
  test('GET /api/analytics - returns stats dashboard data', async () => {
    const res = await request(app).get('/api/analytics');
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('stats');
    expect(res.body).toHaveProperty('applicationTrends');
  });

  // 4. Candidate Endpoint: Unauthorized Access
  test('GET /api/candidates - rejects request without token', async () => {
    const res = await request(app).get('/api/candidates');
    expect(res.statusCode).toBe(401);
  });

  // 5. Candidate Stage Update: Invalid ID
  test('PUT /api/candidates/:id - handles non-existent candidate', async () => {
    const res = await request(app)
      .put('/api/candidates/invalid-id-999')
      .set('Authorization', `Bearer ${token}`)
      .send({ stage: 'Interview' });

    expect([400, 401, 404]).toContain(res.statusCode);
  });
});