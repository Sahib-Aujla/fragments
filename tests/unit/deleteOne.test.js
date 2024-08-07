// tests/unit/deleteOne.test.js

const request = require('supertest');

const app = require('../../src/app');
const logger = require('../../src/logger');

describe('Delete /v1/fragments/:id', () => {
  // If the request is missing the Authorization header, it should be forbidden
  test('unauthenticated requests are denied', () =>
    request(app).get('/v1/fragments/abcd/info').expect(401));

  // If the wrong username/password pair are used (no such user), it should be forbidden
  test('incorrect credentials are denied', () =>
    request(app)
      .get('/v1/fragments/abcd/info')
      .auth('invalid@email.com', 'incorrect_password')
      .expect(401));

  // Using a valid username/password pair should give a success result with the valid text
  test('authenticated users deletes a fragment', async () => {
    //creating a new fragment
    const res1 = await request(app)
      .post('/v1/fragments')
      .auth('user1@email.com', 'password1')
      .set('Content-Type', 'text/plain')
      .send('hello');

    logger.debug({ res1 });

    //getting a new fragment
    const res = await request(app)
      .get(`/v1/fragments/${res1.body.fragment.id}`)
      .auth('user1@email.com', 'password1');
    logger.debug({ res });

    //deleting the fragment
    const res2 = await request(app)
      .delete(`/v1/fragments/${res1.body.fragment.id}`)
      .auth('user1@email.com', 'password1');

    // trying to get again expected 404
    const res3 = await request(app)
      .get(`/v1/fragments/${res1.body.fragment.id}`)
      .auth('user1@email.com', 'password1');

    //trying to delete again expected 404
    const res4 = await request(app)
      .delete(`/v1/fragments/${res1.body.fragment.id}`)
      .auth('user1@email.com', 'password1');

    expect(res.statusCode).toBe(200);
    expect(res1.statusCode).toBe(201);

    expect(res2.statusCode).toBe(200);
    expect(res3.statusCode).toBe(404);
    expect(res4.statusCode).toBe(404);
  });


  test('authenticated users sends an invalid id', async () => {
    //creating a new fragment

    const res = await request(app)
      .get(`/v1/fragments/abc`)
      .auth('user1@email.com', 'password1');
    logger.debug({ res });

    //deleting the fragment
    const res2 = await request(app)
      .delete(`/v1/fragments/abc`)
      .auth('user1@email.com', 'password1');

    

    expect(res.statusCode).toBe(404);
    
    expect(res2.statusCode).toBe(404);
   
  });
});
