/**
 * Mock for @vercel/blob.
 *
 * Provides jest.fn() stand-ins for put/del/list and a reset helper. Tests call
 * `put.mockResolvedValueOnce({ url: 'https://...' })` etc. to program behavior.
 */
const put = jest.fn();
const del = jest.fn();
const list = jest.fn();
const head = jest.fn();

function __reset() {
  put.mockReset();
  del.mockReset();
  list.mockReset();
  head.mockReset();
  put.mockResolvedValue({ url: 'https://blob.example.com/default.jpg' });
  del.mockResolvedValue(undefined);
  list.mockResolvedValue({ blobs: [] });
  head.mockResolvedValue({ url: 'https://blob.example.com/default.jpg' });
}

__reset();

module.exports = { put, del, list, head, __reset };
