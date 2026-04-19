# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.1] - 2026-04-19

### Added

- Add `ci.yml` GitHub Actions workflow for continuous integration
- Add `deploy.yml` GitHub Actions workflow for deployment
- Add `release.yml` GitHub Actions workflow for release management
- Add `tests/_mocks/connectPgSimple.js` for mocking `connect-pg-simple`
- Add `tests/_mocks/multer.js` for mocking `multer`
- Add `tests/_mocks/pg.js` for mocking `pg`
- Add `tests/_mocks/vercelBlob.js` for mocking Vercel Blob storage
- Add `tests/_mocks/vercelPostgres.js` for mocking Vercel Postgres
- Add `tests/app.smoke.test.js` for application smoke tests
- Add `tests/config/admin.test.js` for admin configuration tests
- Add `tests/config/rateLimits.test.js` for rate limit configuration tests
- Add `tests/db/index.test.js` for database connection tests
- Add `tests/middleware/auth.test.js` for authentication middleware tests
- Add `tests/routes/admin.test.js` for admin route tests
- Add `tests/routes/gallery.test.js` for gallery route tests
- Add `tests/routes/memories.test.js` for memories route tests
- Add `tests/setup.js` for Jest test environment setup
- Add `tests/utils/blob.test.js` for Vercel Blob utility tests
- Add `tests/utils/gallery.test.js` for gallery utility tests
- Add `tests/utils/storage.test.js` for storage utility tests
- Add `tests/utils/validator.test.js` for validation utility tests
- Add `CHANGELOG.md` for documenting project changes.
- Add `jest.config.js` for Jest test configuration.
- Add `src/app.js` to encapsulate Express application setup.
- Add `src/types/express-session.d.ts` for TypeScript type declarations for express-session.
- Add `tsconfig.json` for TypeScript configuration.

### Changed

- Update `.prettierignore` to include `coverage` directory and exclude `*.md` files from being ignored
- Update `eslint.config.js` to ignore `coverage` directory, set `ecmaVersion` to 2022, and configure Jest environment
- Update `jest.config.js` to include `tests/setup.js` and ignore mock directories
- Update `package.json` and `package-lock.json` to reflect changes in dependencies, scripts, and project metadata
- Update `src/app.js` for application setup and middleware integration
- Update `src/config/admin.js` to dynamically set bcrypt rounds based on `NODE_ENV`
- Update `src/config/rateLimits.js` to adjust rate limit configurations
- Update `src/routes/admin.js` to modify admin route handling
- Update `src/server.js` to update server startup logic and configuration
- Update `src/types/express-session.d.ts` for TypeScript type declarations for express-session
- Update `src/utils/gallery.js` to adapt to new data storage mechanisms
- Update `tsconfig.json` for TypeScript compiler options
- Update `.prettierignore` to ignore `coverage` directory and stop ignoring `*.md` files.
- Update `eslint.config.js` to ignore `coverage` directory, set `ecmaVersion` to 2022, and configure Jest globals.
- Update `package.json` and `package-lock.json` to require Node.js version >=24.
- Update `package.json` to add `typecheck`, `test`, and `test:coverage` scripts.
- Update `package.json` and `package-lock.json` to add TypeScript and Jest development dependencies.
- Update `src/config/rateLimits.js` to correctly import `express-rate-limit` using `.default`.
- Update `src/routes/admin.js` to handle session destruction with a callback for error management.
- Refactor `src/server.js` to import and use `createApp` for server initialization.
- Update JSDoc in `src/utils/gallery.js` to allow `string|number` for the photo `id` parameter.

### Fixed

### Removed

- Remove `data/gallery.json` as gallery data is now managed dynamically.
- Remove `data/memories.json` as memories data is now managed dynamically.

## [1.0.0] - 2025-12-11

### Added

- Initial production release of the memorial website.
- Express server (`src/server.js`) with Helmet, CORS, session management, and static asset serving.
- PostgreSQL-backed session store via `connect-pg-simple` on Vercel Postgres.
- Public pages: home (`index.html`), memories, gallery (flowers), and through-the-years timeline.
- Admin portal with authentication (`src/middleware/auth.js`) and bcrypt-hashed credentials.
- Memories API (`src/routes/memories.js`): create, read, and moderate visitor-submitted memories.
- Gallery API (`src/routes/gallery.js`): image upload, listing, and ordering backed by Vercel Blob storage.
- Admin API (`src/routes/admin.js`): moderation, content management, and administrative controls.
- Rate limiting via `express-rate-limit` with per-route configuration (`src/config/rateLimits.js`).
- File upload handling with `multer` and Vercel Blob integration (`src/utils/blob.js`, `src/utils/storage.js`).
- Input validation utilities (`src/utils/validator.js`) for user-submitted content.
- Database schema and initialization (`src/db/schema.sql`, `src/db/index.js`).
- Vercel deployment configuration (`vercel.json`) with legacy v2 `@vercel/node` builds.
- Prettier formatting and ESLint v9 flat config for code quality.
- Husky pre-commit hook running `lint-staged` (ESLint + Prettier on staged files).
- Documentation set: `README.md`, `docs/SETUP.md`, `docs/DEPLOYMENT.md`, `docs/ADMIN.md`, `docs/QUICK_START.md`, `docs/VERCEL_POSTGRES_SETUP.md`, `docs/PRE_COMMIT_SETUP.md`, `docs/CODEBASE_AUDIT.md`.
- Trinity Method v2.2.4 deployment (`.claude/trinity/`) for investigation-first development workflow.

[Unreleased]: https://github.com/strawhatluka/Josh/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/strawhatluka/Josh/releases/tag/v1.0.0
