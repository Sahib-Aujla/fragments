// tests/unit/getOne.test.js

const request = require('supertest');

const app = require('../../src/app');
const logger = require('../../src/logger');
const path = require('path');
const fs = require('fs');

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

  test('authenticated user gets a converted fragment from markdown to html', async () => {
    const res1 = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/markdown')
      .send('# Hello');

    logger.debug({ res1 });
    const res = await request(app)
      .get(`/v1/fragments/${res1.body.fragment.id}.html`)
      .auth('user1@email.com', 'password1');
    logger.debug({ res });
    expect(res.statusCode).toBe(200);
    expect(res.text).toEqual('<h1>Hello</h1>\n');
  });

  test('authenticated user gets a converted fragment from html to text', async () => {
    const res1 = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/html')
      .send('<h1>Hello</h1>');

    logger.debug({ res1 });
    const res = await request(app)
      .get(`/v1/fragments/${res1.body.fragment.id}.txt`)
      .auth('user1@email.com', 'password1');
    logger.debug({ res });
    expect(res.statusCode).toBe(200);
    expect(res.text).toEqual('<h1>Hello</h1>');
  });

  test('authenticated user gets a converted fragment from json to yml', async () => {
    const res1 = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'application/json')
      .send({ jjj: 'kkk' });

    logger.debug({ res1 });
    const res = await request(app)
      .get(`/v1/fragments/${res1.body.fragment.id}.yml`)
      .auth('user1@email.com', 'password1');
    logger.debug({ res });
    expect(res.statusCode).toBe(200);
    expect(res.text.substring(4, res.text.length - 1).trim()).toEqual('jjj: "kkk"');
  });

  test('authenticated user gets a converted fragment from png to jpeg,gif,avif,webp', async () => {
    const imagePath = path.join(__dirname, 'test-assets/pup.png');
    const imageBuffer = fs.readFileSync(imagePath);

    const resog = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'image/png')
      .send(imageBuffer);

    logger.debug({ resog });

    const res1 = await request(app)
      .get(`/v1/fragments/${resog.body.fragment.id}.jpeg`)
      .auth('user1@email.com', 'password1');

    const res2 = await request(app)
      .get(`/v1/fragments/${resog.body.fragment.id}.avif`)
      .auth('user1@email.com', 'password1');

    const res3 = await request(app)
      .get(`/v1/fragments/${resog.body.fragment.id}.gif`)
      .auth('user1@email.com', 'password1');

    const res4 = await request(app)
      .get(`/v1/fragments/${resog.body.fragment.id}.webp`)
      .auth('user1@email.com', 'password1');
    logger.debug({ res1 });

    expect(res1.statusCode).toBe(200);
    expect(res1.headers['content-type']).toBe('image/jpeg');
    expect(res2.statusCode).toBe(200);
    expect(res2.headers['content-type']).toBe('image/avif');
    expect(res3.statusCode).toBe(200);
    expect(res3.headers['content-type']).toBe('image/gif');
    expect(res4.statusCode).toBe(200);
    expect(res4.headers['content-type']).toBe('image/webp');
  });

  test('authenticated users sends an invalid id', async () => {
    const res = await request(app).get(`/v1/fragments/abc`).auth('user1@email.com', 'password1');
    logger.debug({ res });
    expect(res.statusCode).toBe(404);
    expect(res.body.status).toBe('error');
    expect(res.body.error.code).toBe(404);
    expect(res.body.error.message).toBe('Error retrieving fragment');
  });
});
