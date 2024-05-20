const request = require('supertest');

const app = require('../../src/app');

describe('Error response handler', () => {
  test('should get the error response for not found', async () => {
    const res = await request(app).get('/not-found');
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({
        status: 'error',
        error: {
          code: 404,
          message: 'not found',
        },
      });

  });

});
