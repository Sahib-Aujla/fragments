const logger = require('../../src/logger');
const {
  writeFragment,
  readFragment,
  writeFragmentData,
  readFragmentData,
  listFragments,
  deleteFragment,
} = require('../../src/model/data/memory/index');

describe('fragments memory', () => {
  const fragment = {
    id: 'abc',
    ownerId: 'bcd',
    created: '2021-11-02T15:09:50.403Z',
    updated: '2021-11-02T15:09:50.403Z',
    type: 'text/plain',
    size: 256,
  };
  const data = Buffer.from(['xyz', 'gfg', 'ijkl']);
  it('should return undefined', async () => {
    const res = await writeFragment(fragment);
    expect(res).toBe(undefined);
  });

  it('should return the value', async () => {
    const res = await readFragment(fragment.ownerId, fragment.id);
    logger.debug(res);
    expect(res).toEqual(fragment);
  });

  test('should write a buffer and return undefined', async () => {
    const res = await writeFragmentData(fragment.ownerId, fragment.id, data);

    expect(res).toBe(undefined);
  });

  test('should match with the data', async () => {
    const res = await readFragmentData(fragment.ownerId, fragment.id);
    logger.debug(res);
    expect(res).toEqual(data);
  });

  test('should return all the fragments', async () => {
    const a2 = await writeFragment({ ...fragment, id: 'bob' });
    const res = await listFragments(fragment.ownerId);
    expect(a2).toBe(undefined);
    expect(res).toEqual(['abc', 'bob']);
  });

  test('should delete all fragments', async () => {
    const res1 = await readFragment(fragment.ownerId, fragment.id);
    const res2 = await readFragmentData(fragment.ownerId, fragment.id);
    const res = await deleteFragment(fragment.ownerId, fragment.id);
    expect(res1).toEqual(fragment);
    expect(res2).toEqual(data);
    expect(res).toEqual([undefined, undefined]);
  });
});
