jest.mock('@vercel/blob', () => require('../_mocks/vercelBlob'));

const blobMock = require('../_mocks/vercelBlob');
const { uploadFile, deleteFile } = require('../../src/utils/blob');

beforeEach(() => {
  blobMock.__reset();
});

describe('uploadFile', () => {
  it('returns the url from the put response', async () => {
    blobMock.put.mockResolvedValueOnce({ url: 'https://blob.example.com/gallery/1-a.jpg' });
    const { url } = await uploadFile(Buffer.from('data'), 'a.jpg', 'gallery');
    expect(url).toBe('https://blob.example.com/gallery/1-a.jpg');
  });

  it('prefixes the blob filename with folder + timestamp', async () => {
    blobMock.put.mockResolvedValueOnce({ url: 'https://blob.example.com/memories/1-b.jpg' });
    await uploadFile(Buffer.from('data'), 'b.jpg', 'memories');
    const [filename, buffer, opts] = blobMock.put.mock.calls[0];
    expect(filename).toMatch(/^memories\/\d+-b\.jpg$/);
    expect(buffer).toEqual(Buffer.from('data'));
    expect(opts).toEqual({ access: 'public', addRandomSuffix: false });
  });

  it('wraps put errors with a generic "Failed to upload file"', async () => {
    blobMock.put.mockRejectedValueOnce(new Error('blob 500'));
    await expect(
      uploadFile(Buffer.from('x'), 'x.jpg', 'gallery')
    ).rejects.toThrow('Failed to upload file');
  });
});

describe('deleteFile', () => {
  it('calls del with the provided url', async () => {
    blobMock.del.mockResolvedValueOnce(undefined);
    await deleteFile('https://blob.example.com/a.jpg');
    expect(blobMock.del).toHaveBeenCalledWith('https://blob.example.com/a.jpg');
  });

  it('swallows errors silently (per the source comment)', async () => {
    blobMock.del.mockRejectedValueOnce(new Error('not found'));
    await expect(deleteFile('https://blob.example.com/missing.jpg')).resolves.toBeUndefined();
  });
});
