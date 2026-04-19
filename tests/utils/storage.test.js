jest.mock('@vercel/postgres', () => require('../_mocks/vercelPostgres'));

const pgMock = require('../_mocks/vercelPostgres');
const { readMemories, saveMemory, updateMemory, deleteMemory } = require('../../src/utils/storage');

beforeEach(() => {
  pgMock.__reset();
});

describe('readMemories', () => {
  it('returns rows from the default query when no options are provided', async () => {
    pgMock.__setRows([{ id: 1, from: 'Luka', message: 'hi', photo: null, timestamp: 't' }]);
    const result = await readMemories();
    expect(result).toEqual([
      { id: 1, from: 'Luka', message: 'hi', photo: null, timestamp: 't' }
    ]);
    expect(pgMock.sqlMock).toHaveBeenCalledTimes(1);
  });

  it('passes limit and offset when provided', async () => {
    pgMock.__setRows([{ id: 2 }]);
    const rows = await readMemories({ limit: 5, offset: 10 });
    expect(rows).toEqual([{ id: 2 }]);
  });

  it('defaults offset to 0 when only limit is provided', async () => {
    pgMock.__setRows([]);
    await readMemories({ limit: 3 });
    expect(pgMock.sqlMock).toHaveBeenCalled();
  });

  it('wraps DB errors with a generic message', async () => {
    pgMock.__setError(new Error('connection dropped'));
    await expect(readMemories()).rejects.toThrow('Failed to read memories');
  });

  it('returns empty array when DB returns no rows', async () => {
    pgMock.__setRows([]);
    const rows = await readMemories();
    expect(rows).toEqual([]);
  });
});

describe('saveMemory', () => {
  it('inserts a memory and returns the created row', async () => {
    pgMock.__setRows([{ id: 1, from: 'Luka', message: 'hi', photo: null, timestamp: 't' }]);
    const result = await saveMemory({ from: 'Luka', message: 'hi' });
    expect(result).toEqual({ id: 1, from: 'Luka', message: 'hi', photo: null, timestamp: 't' });
  });

  it('passes the photo url when provided', async () => {
    pgMock.__setRows([{ id: 2 }]);
    await saveMemory({ from: 'Luka', message: 'hi', photo: 'https://blob/x.jpg' });
    expect(pgMock.sqlMock).toHaveBeenCalled();
  });

  it('passes a provided timestamp through', async () => {
    pgMock.__setRows([{ id: 3 }]);
    await saveMemory({ from: 'Luka', message: 'hi', timestamp: '2025-01-01T00:00:00Z' });
    expect(pgMock.sqlMock).toHaveBeenCalled();
  });

  it('wraps DB errors with a generic message', async () => {
    pgMock.__setError(new Error('constraint violation'));
    await expect(saveMemory({ from: 'a', message: 'b' })).rejects.toThrow('Failed to save memory');
  });
});

describe('updateMemory', () => {
  it('updates a memory and returns the updated row', async () => {
    pgMock.__setRows([{ id: 1, from: 'Luka', message: 'edited', photo: null, timestamp: 't' }]);
    const result = await updateMemory(1, { message: 'edited' });
    expect(result.message).toBe('edited');
  });

  it('throws "Memory not found" when no rows are returned', async () => {
    pgMock.__setRows([]);
    await expect(updateMemory(999, { from: 'x' })).rejects.toThrow('Memory not found');
  });

  it('propagates unexpected DB errors', async () => {
    pgMock.__setError(new Error('deadlock detected'));
    await expect(updateMemory(1, { message: 'x' })).rejects.toThrow('deadlock detected');
  });
});

describe('deleteMemory', () => {
  it('deletes a memory and returns the removed row', async () => {
    pgMock.__setRows([{ id: 7, from: 'Luka', message: 'bye', photo: null, timestamp: 't' }]);
    const result = await deleteMemory(7);
    expect(result.id).toBe(7);
  });

  it('throws "Memory not found" on empty result', async () => {
    pgMock.__setRows([]);
    await expect(deleteMemory(42)).rejects.toThrow('Memory not found');
  });

  it('propagates unexpected DB errors', async () => {
    pgMock.__setError(new Error('fk violation'));
    await expect(deleteMemory(1)).rejects.toThrow('fk violation');
  });
});
