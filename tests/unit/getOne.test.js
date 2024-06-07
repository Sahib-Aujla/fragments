// tests/unit/getOne.test.js

const request = require('supertest');

const app = require('../../src/app');
const logger = require('../../src/logger');

describe('GET /v1/fragments/:id', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/abcd').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/abcd')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  // Using a valid username/password pair should give a success result with the valid text
  test('authenticated users get a fragment', async () => {
    const res1 = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('hello');

    logger.debug({ res1 });
    const res = await request(app)
      .get(`/v1/fragments/${res1.body.fragment.id}`)
      .auth('user1@email.com', 'password1');
    logger.debug({ res });
    expect(res.statusCode).toBe(200);
    expect(res.text).toEqual('hello');
  });

  test('authenticated users sends an invalid id', async () => {
    const res = await request(app).get(`/v1/fragments/abc`).auth('user1@email.com', 'password1');
    logger.debug({ res });
    expect(res.statusCode).toBe(500);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(500);
    expect(res.body.error.message).toBe('Error retrieving fragment');
  });
});
