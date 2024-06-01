const { writeFragment, readFragment } = require('../../src/model/data/memory/index');

describe('fragments memory', () => {
  const fragment = {
    id: 'abc',
    ownerId: 'bcd',
    created: '2021-11-02T15:09:50.403Z',
    updated: '2021-11-02T15:09:50.403Z',
    type: 'text/plain',
    size: 256,
  };
  it('should return undefined', async () => {
    const res = await writeFragment(fragment);
    expect(res).toBe(undefined);
  });

  it('should return the value', async() => {
    const res = await readFragment(fragment.ownerId, fragment.id);
    expect(res).toEqual(fragment);
  });
});
