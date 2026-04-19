jest.mock('@vercel/postgres', () => require('../_mocks/vercelPostgres'));

const pgMock = require('../_mocks/vercelPostgres');
const {
  readGallery,
  addPhoto,
  updatePhoto,
  deletePhoto,
  updatePhotoOrder
} = require('../../src/utils/gallery');

beforeEach(() => {
  pgMock.__reset();
});

describe('readGallery', () => {
  it('returns ordered rows', async () => {
    pgMock.__setRows([
      { id: 1, filename: 'a.jpg', photo_url: 'u1', caption: 'c1', order: 1 },
      { id: 2, filename: 'b.jpg', photo_url: 'u2', caption: 'c2', order: 2 }
    ]);
    const rows = await readGallery();
    expect(rows).toHaveLength(2);
    expect(rows[0].id).toBe(1);
  });

  it('wraps DB errors with a generic message', async () => {
    pgMock.__setError(new Error('db down'));
    await expect(readGallery()).rejects.toThrow('Failed to read gallery');
  });
});

describe('addPhoto', () => {
  it('inserts a photo at the end of the order', async () => {
    // First call: SELECT MAX(display_order). Second call: INSERT.
    pgMock.__setRows([{ max_order: 5 }]);
    pgMock.__setRows([{ id: 10, filename: 'a.jpg', photo_url: 'u', caption: '', order: 6 }]);
    const result = await addPhoto({ filename: 'a.jpg', photoUrl: 'u', caption: '' });
    expect(result.order).toBe(6);
  });

  it('defaults caption to empty string when not provided', async () => {
    pgMock.__setRows([{ max_order: 0 }]);
    pgMock.__setRows([{ id: 1, filename: 'a.jpg', photo_url: 'u', caption: '', order: 1 }]);
    const result = await addPhoto({ filename: 'a.jpg', photoUrl: 'u' });
    expect(result.caption).toBe('');
  });

  it('wraps DB errors with a generic message', async () => {
    pgMock.__setError(new Error('select failed'));
    await expect(addPhoto({ filename: 'a.jpg', photoUrl: 'u', caption: '' })).rejects.toThrow(
      'Failed to add photo'
    );
  });
});

describe('updatePhoto', () => {
  it('updates caption and returns the photo', async () => {
    pgMock.__setRows([{ id: 1, filename: 'a.jpg', photo_url: 'u', caption: 'new', order: 1 }]);
    const result = await updatePhoto(1, { caption: 'new' });
    expect(result.caption).toBe('new');
  });

  it('throws Photo not found when no rows returned', async () => {
    pgMock.__setRows([]);
    await expect(updatePhoto(999, { caption: 'x' })).rejects.toThrow('Photo not found');
  });

  it('accepts string ids (from req.params)', async () => {
    pgMock.__setRows([{ id: 1, filename: 'a', photo_url: 'u', caption: 'c', order: 1 }]);
    const result = await updatePhoto('1', { caption: 'c' });
    expect(result.id).toBe(1);
  });

  it('propagates unexpected DB errors', async () => {
    pgMock.__setError(new Error('timeout'));
    await expect(updatePhoto(1, { caption: 'x' })).rejects.toThrow('timeout');
  });
});

describe('deletePhoto', () => {
  it('deletes and returns the removed photo', async () => {
    pgMock.__setRows([{ id: 7, filename: 'a.jpg', photo_url: 'u', caption: 'c', order: 7 }]);
    const result = await deletePhoto(7);
    expect(result.id).toBe(7);
  });

  it('throws Photo not found on empty result', async () => {
    pgMock.__setRows([]);
    await expect(deletePhoto(42)).rejects.toThrow('Photo not found');
  });

  it('propagates unexpected DB errors', async () => {
    pgMock.__setError(new Error('fk'));
    await expect(deletePhoto(1)).rejects.toThrow('fk');
  });
});

describe('updatePhotoOrder', () => {
  it('runs one update per photo in the input array', async () => {
    pgMock.__setRows([]);
    pgMock.__setRows([]);
    pgMock.__setRows([]);
    await updatePhotoOrder([
      { id: 1, order: 3 },
      { id: 2, order: 1 },
      { id: 3, order: 2 }
    ]);
    expect(pgMock.sqlMock).toHaveBeenCalledTimes(3);
  });

  it('wraps errors from any single update with a generic message', async () => {
    pgMock.__setError(new Error('one failed'));
    await expect(updatePhotoOrder([{ id: 1, order: 1 }])).rejects.toThrow(
      'Failed to update photo order'
    );
  });

  it('is a no-op for empty input', async () => {
    await expect(updatePhotoOrder([])).resolves.toBeUndefined();
    expect(pgMock.sqlMock).not.toHaveBeenCalled();
  });
});
