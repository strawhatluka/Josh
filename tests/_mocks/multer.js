/**
 * Mock for multer.
 *
 * Replaces multer with a factory that returns handlers which synthesize `req.file`
 * (or `req.files`) from a test-controllable fixture. Set the fixture via
 * `__setNextFile(fileObj)` before the request; otherwise no file is attached.
 *
 * Shape of the injected file object mirrors multer's in-memory storage:
 *   { fieldname, originalname, mimetype, buffer, size }
 */
let nextFile = null;
let shouldFail = false;
let failureError = null;

function __setNextFile(file) {
  nextFile = file;
}

function __setNextFailure(error) {
  shouldFail = true;
  failureError = error;
}

function __reset() {
  nextFile = null;
  shouldFail = false;
  failureError = null;
}

function middlewareFactory() {
  return function multerMiddleware(req, _res, next) {
    if (shouldFail) {
      const err = failureError;
      shouldFail = false;
      failureError = null;
      return next(err);
    }
    if (nextFile) {
      req.file = nextFile;
      nextFile = null;
    }
    next();
  };
}

function memoryStorage() {
  return { _engine: 'memory' };
}

function multer(_options) {
  return {
    single: _fieldName => middlewareFactory(),
    array: (_fieldName, _maxCount) => middlewareFactory(),
    fields: _fieldsArr => middlewareFactory(),
    any: () => middlewareFactory(),
    none: () => middlewareFactory()
  };
}

multer.memoryStorage = memoryStorage;
multer.diskStorage = () => ({ _engine: 'disk' });
multer.__setNextFile = __setNextFile;
multer.__setNextFailure = __setNextFailure;
multer.__reset = __reset;

module.exports = multer;
