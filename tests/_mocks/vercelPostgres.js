/**
 * Mock for @vercel/postgres.
 *
 * Exports a `sql` tagged-template function backed by `sqlMock`, plus `__setRows` /
 * `__setError` / `__reset` helpers so individual tests can pre-program what the
 * next query returns. The mock treats every sql`...` call as a FIFO queue:
 * push responses with `__setRows` (once per expected query) and the mock serves
 * them in order. Unmatched queries default to an empty `rows: []` result.
 */
const sqlMock = jest.fn();

function sql(strings, ...values) {
  return sqlMock(strings, ...values);
}

const responseQueue = [];

function __setRows(rows) {
  responseQueue.push({ type: 'rows', value: { rows } });
}

function __setResult(result) {
  responseQueue.push({ type: 'result', value: result });
}

function __setError(error) {
  responseQueue.push({ type: 'error', value: error });
}

function __reset() {
  responseQueue.length = 0;
  sqlMock.mockReset();
  sqlMock.mockImplementation(() => {
    const next = responseQueue.shift();
    if (!next) {
      return Promise.resolve({ rows: [] });
    }
    if (next.type === 'error') {
      return Promise.reject(next.value);
    }
    if (next.type === 'result') {
      return Promise.resolve(next.value);
    }
    return Promise.resolve(next.value);
  });
}

// Prime the default implementation so tests that never call __reset still work.
__reset();

module.exports = {
  sql,
  sqlMock,
  __setRows,
  __setResult,
  __setError,
  __reset
};
