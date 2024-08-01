// tests/unit/getOne.test.js

const request = require('supertest');

const app = require('../../src/app');
const logger = require('../../src/logger');

describe('POST /v1/fragments', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () => request(app).get('/v1/fragments').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app).get('/v1/fragments').auth('invalid@email.com', 'incorrect_password').expect(401));

  // Using a valid username/password pair should give a success result with a .fragments array
  test('authenticated users get a fragment', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('hello');

    logger.debug({ res });
    logger.debug(res.body);
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe('ok');
    expect(res.body.fragment).toHaveProperty('id');
    expect(res.body.fragment.type).toBe('text/plain');
    expect(res.body.fragment.ownerId).toBe('user1@email.com');
    expect(res.headers['location']).toBeDefined();
    expect(res.body.fragment.size).toBe(5);
  });

  test('authenticated user sends invalid data', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain');
    logger.debug({ res });
    expect(res.statusCode).toBe(415);
    expect(res.body).toEqual({
      status: 'error',
      error: {
        code: 415,
        message: 'Invalid data',
      },
    });
  });

  test('authenticated user sends image/png as request', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/css')
      .send('hello');
    logger.debug({ res });
    expect(res.statusCode).toBe(415);
    expect(res.body).toEqual({
      status: 'error',
      error: {
        code: 415,
        message: 'Invalid type',
      },
    });
  });


  test('authenticated user sends invalid format as content-type', async () => {
    const res = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'abcd');
    logger.debug({ res });
    expect(res.statusCode).toBe(500);
  });


});
