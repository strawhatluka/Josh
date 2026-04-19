# Memorial Website for Joshua Alexander Downs

A heartfelt memorial website built to honor and remember Joshua Alexander Downs (October 16, 1994 - December 7, 2025). This project provides a beautiful, interactive space for family and friends to celebrate Josh's life, share memories, and view cherished photographs.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Testing](#testing)
- [Type Checking](#type-checking)
- [Security](#security)
- [CI/CD](#cicd)
- [Deployment](#deployment)
- [Versioning](#versioning)
- [Available Scripts](#available-scripts)
- [Documentation](#documentation)
- [License](#license)

## Features

### Public Features

- **Landing Page**: Beautiful hero image with full obituary and life celebration
- **Photo Gallery**: Chronological photo timeline ("Through the Years") with captions
- **Memory Wall**: Visitors can share memories and condolences with optional photo attachments
- **In Lieu of Flowers**: Information about charitable donations and memorial contributions
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop viewing
- **Image Cropping**: Built-in cropper for visitors to crop photos before submission

### Admin Features

- **Secure Authentication**: Session-based authentication with bcrypt password hashing
- **Photo Gallery Management**:
  - Upload and crop photos with captions
  - Edit captions
  - Delete photos
  - **Drag-and-drop reordering** with visual feedback
- **Memory Moderation**:
  - Edit visitor memories
  - Delete inappropriate content
  - View all submissions with timestamps
- **Rate Limiting**: Automated protection against spam and abuse

### Security Features

- **Rate Limiting**:
  - Admin login: 5 attempts per 15 minutes per IP
  - Memory submission: 5 submissions per minute per IP
  - In-memory store (upgrade to Redis/PostgreSQL for production scaling)
- **Content Security Policy**:
  - Restricts resource loading to trusted sources
  - Prevents XSS attacks
  - Configured via Helmet.js
- **Authentication**:
  - bcrypt password hashing (12 rounds in production, 4 rounds under `NODE_ENV=test` for fast suites)
  - Session-based authentication with typed session data (`isAdmin`, `username`)
  - PostgreSQL session store for serverless compatibility
  - Secure cookie configuration
- **Input Validation**:
  - Server-side validation for all user inputs
  - HTML escaping to prevent XSS
  - File type and size validation
- **Security Headers**:
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Strict-Transport-Security (HSTS)
  - Content-Security-Policy

### Code Quality

- **Pre-commit Hooks**: Automatic code formatting and linting via Husky
- **ESLint**: Flat config (v9) with JavaScript best practices enforcement and Jest-globals override for tests
- **Prettier**: Consistent code formatting across JS, JSON, CSS, HTML, and Markdown
- **Lint-staged**: Optimized pre-commit checks on staged files only
- **TypeScript (typecheck only)**: `tsc --noEmit` with `allowJs`/`checkJs` validates the JS codebase without emitting output
- **Jest + Supertest**: 127 tests across 12 suites, mocked database so tests run offline
- **Coverage threshold**: 80% across branches / functions / lines / statements, enforced in CI

## Tech Stack

### Frontend

- HTML5, CSS3 (Grid & Flexbox), Vanilla JavaScript
- Cropper.js for image manipulation

### Backend

- Node.js, Express.js
- Multer (file uploads), Express Session, Helmet, Express Rate Limit

### Database & Storage

- Vercel Postgres (Neon) - Serverless PostgreSQL database
- Vercel Blob - Serverless blob storage for images

### Security & Authentication

- bcryptjs, connect-pg-simple, Helmet, CORS

### Development Tools

- ESLint (flat config v9), Prettier, Husky, Lint-staged
- TypeScript (typecheck only — `tsc --noEmit` against JS with `checkJs`)
- Jest + Supertest (127 tests, mocked DB)
- GitHub Actions CI/CD (`.github/workflows/ci.yml`, `release.yml`, `deploy.yml`)

## Getting Started

### Prerequisites

- Node.js 24+ (`engines.node: ">=24"` in `package.json`; CI runs Node 24)
- Vercel account (for Postgres and Blob storage)
- Vercel CLI (`npm i -g vercel`)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Josh
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

   This automatically sets up pre-commit hooks via Husky.

3. **Set up environment variables**

   Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

   Configure the following:

   ```env
   POSTGRES_URL="postgres://..."
   POSTGRES_URL_NON_POOLING="postgres://..."
   BLOB_READ_WRITE_TOKEN="vercel_blob_..."
   ADMIN_USERNAME="admin"
   ADMIN_PASSWORD_HASH="$2a$10$..."
   SESSION_SECRET="your-secure-random-string"
   NODE_ENV="development"
   PORT=3000
   ```

4. **Link to Vercel project** (for local development)

   ```bash
   vercel link
   vercel env pull
   ```

5. **Generate admin password hash**
   ```javascript
   const bcrypt = require('bcryptjs');
   const hash = bcrypt.hashSync('your-password', 10);
   console.log(hash);
   ```

### Running Locally

**Development mode** (with auto-reload):

```bash
npm run dev
```

**Production mode**:

```bash
npm start
```

Site: `http://localhost:3000`
Admin: `http://localhost:3000/admin.html`

## Project Structure

```
Josh/
├── public/                      # Static frontend files
│   ├── css/
│   │   ├── global.css          # Global styles and variables
│   │   ├── responsive.css      # Mobile-first responsive styles
│   │   ├── pages.css           # Page-specific styles
│   │   └── admin.css           # Admin panel styles
│   ├── js/
│   │   ├── gallery.js          # Public gallery functionality
│   │   ├── memories.js         # Memory submission with cropping
│   │   └── admin.js            # Admin panel with drag-and-drop
│   ├── images/                 # Static images
│   ├── index.html              # Landing page
│   ├── through-years.html      # Photo gallery
│   ├── memories.html           # Memory submission
│   ├── flowers.html            # Donation information
│   └── admin.html              # Admin panel
│
├── src/                        # Backend source code
│   ├── app.js                  # Express app factory (createApp() — no side effects)
│   ├── server.js               # Thin bootstrap (initializeDatabase + app.listen)
│   ├── config/
│   │   ├── admin.js            # Admin credentials + bcrypt rounds (env-gated)
│   │   └── rateLimits.js       # Rate limiting configuration
│   ├── db/
│   │   ├── index.js            # Database connection (@vercel/postgres + pg.Pool)
│   │   └── schema.sql          # Table definitions
│   ├── middleware/
│   │   └── auth.js             # Authentication middleware (requireAuth)
│   ├── routes/
│   │   ├── admin.js            # Admin API endpoints
│   │   ├── gallery.js          # Public gallery endpoints
│   │   └── memories.js         # Memory submission endpoints
│   ├── types/
│   │   └── express-session.d.ts # Session data type augmentation
│   └── utils/
│       ├── blob.js             # Vercel Blob utilities
│       ├── gallery.js          # Gallery database operations
│       ├── storage.js          # Memory database operations
│       └── validator.js        # Input validation
│
├── tests/                      # Jest + Supertest test suite
│   ├── _mocks/                 # Shared mocks (Vercel Postgres/Blob, multer, pg, session store)
│   ├── app.smoke.test.js       # Boot + smoke integration test
│   ├── config/                 # Tests for src/config
│   ├── db/                     # Tests for src/db
│   ├── middleware/             # Tests for src/middleware
│   ├── routes/                 # Tests for src/routes (supertest)
│   ├── utils/                  # Tests for src/utils
│   └── setup.js                # Test environment bootstrap
│
├── .github/                    # GitHub Actions workflows
│   ├── workflows/
│   │   ├── ci.yml              # Lint, typecheck, test + coverage
│   │   ├── release.yml         # Tag v*.*.* → draft release from CHANGELOG
│   │   └── deploy.yml          # Release published → Vercel deploy
│   └── SECRETS.md              # Required repo secrets checklist
│
├── docs/                       # Documentation
│   ├── QUICK_START.md
│   ├── SETUP.md
│   ├── ADMIN.md
│   ├── DEPLOYMENT.md
│   ├── PRE_COMMIT_SETUP.md
│   └── VERCEL_POSTGRES_SETUP.md
│
├── .husky/                     # Git hooks (pre-commit runs lint-staged)
├── CHANGELOG.md                # Keep-a-Changelog — release notes source
├── jest.config.js              # Jest config (80% coverage threshold)
├── tsconfig.json               # TypeScript typecheck config (checkJs, noEmit)
├── eslint.config.js            # ESLint flat config (v9)
├── vercel.json                 # Vercel deployment config
├── LICENSE                     # MIT License
└── README.md                   # This file
```

## Security

### Security Audit Summary

**Overall Rating**: A- (Excellent)

**Implemented Security Measures**:

1. Rate limiting on admin login and public submissions
2. Comprehensive Content Security Policy via Helmet.js
3. Session-based authentication with bcrypt
4. PostgreSQL session store (serverless-compatible)
5. Input validation and XSS protection
6. Security headers (HSTS, X-Frame-Options, etc.)
7. File upload validation (type & size)

**Critical Issues**: None
**High Priority**: None
**Medium Priority**: None
**Low Priority**: Consider 2FA for enterprise deployments

## Testing

The project ships with a full Jest + Supertest suite (127 tests across 12 suites). Tests use mocked Vercel Postgres / Vercel Blob / multer / pg / session-store fakes, so the suite runs fully offline — no live database or network access required.

```bash
npm test              # run all tests
npm run test:coverage # run tests + coverage report
```

### Coverage

Coverage thresholds are enforced globally at 80% across branches, functions, lines, and statements (see `jest.config.js`). CI fails if any metric drops below the threshold.

### Test organization

```
tests/
├── _mocks/           # Shared mocks (vercelPostgres, vercelBlob, multer, pg, connectPgSimple)
├── app.smoke.test.js # Boots the app and hits public routes via supertest
├── config/           # Tests for src/config
├── db/               # Tests for src/db
├── middleware/       # Tests for src/middleware
├── routes/           # Supertest integration tests for src/routes
├── utils/            # Unit tests for src/utils
└── setup.js          # Runs before every suite — sets NODE_ENV=test + test env defaults
```

## Type Checking

The JS codebase is validated with `tsc --noEmit` using `allowJs: true, checkJs: true` in `tsconfig.json`. No `.ts` files are emitted — TypeScript is used purely as a type checker against the JavaScript source.

```bash
npm run typecheck
```

Type augmentation for Express session data lives at `src/types/express-session.d.ts`. When adding properties to `req.session`, update that file.

## CI/CD

Three GitHub Actions workflows under `.github/workflows/`:

| Workflow      | Trigger                                     | What it does                                                                                                           |
| ------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `ci.yml`      | Push/PR to `main` or `dev`                  | Parallel `quality` (format:check, lint, typecheck) + `test` (coverage, artifact upload) jobs on Node 24                |
| `release.yml` | Push of a `v*.*.*` git tag                  | Extracts the matching section from `CHANGELOG.md` and creates a draft GitHub release via `softprops/action-gh-release` |
| `deploy.yml`  | GitHub release published OR manual dispatch | Deploys to Vercel via `vercel pull` → `vercel build` → `vercel deploy --prebuilt --prod`                               |

### Cutting a release

1. Add the new version section to `CHANGELOG.md` under `## [x.y.z] - YYYY-MM-DD`.
2. Commit + push to `main`.
3. Tag the commit: `git tag vX.Y.Z && git push origin vX.Y.Z`.
4. `release.yml` creates a draft release on GitHub with the extracted notes.
5. Review the draft in the GitHub UI and click **Publish**.
6. Publishing fires `deploy.yml`, which deploys to Vercel.

Required repo secrets for `deploy.yml`: `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VERCEL_TOKEN`. See [`.github/SECRETS.md`](.github/SECRETS.md) for values and setup.

## Deployment

Deployment is driven by the CI/CD pipeline described above — publishing a GitHub release triggers an automated Vercel deploy. For initial Vercel project setup, environment variable configuration, and custom domain instructions, see [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

Manual deploys (e.g., for hotfixes outside the release flow) can be run with the **Deploy to Vercel** workflow's `workflow_dispatch` trigger from the GitHub Actions UI.

## Documentation

- [Quick Start Guide](docs/QUICK_START.md)
- [Setup Guide](docs/SETUP.md)
- [Admin Panel Guide](docs/ADMIN.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Pre-commit Hooks](docs/PRE_COMMIT_SETUP.md)
- [Database Setup](docs/VERCEL_POSTGRES_SETUP.md)

## Versioning

This project follows [Semantic Versioning](https://semver.org/). Release notes live in [`CHANGELOG.md`](CHANGELOG.md) using the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format. The `release.yml` workflow reads directly from that file — so every tagged release must have a matching `## [x.y.z]` section in the changelog.

## Available Scripts

```bash
npm start              # Production server
npm run dev            # Development server with auto-reload

npm run format         # Format all files with Prettier (JS, JSON, CSS, HTML, MD)
npm run format:check   # Check formatting without writing

npm run lint           # Run ESLint
npm run lint:fix       # ESLint with auto-fix

npm run typecheck      # tsc --noEmit (JS type check via checkJs)

npm test               # Run Jest test suite
npm run test:coverage  # Run tests with coverage (fails below 80%)
```

## Contributing

This is a personal memorial project. Feel free to fork under the MIT license for your own use.

## License

MIT License - see [LICENSE](LICENSE) file.

---

## Acknowledgments

Built with love in memory of Joshua Alexander Downs.

_"If the people we love are stolen from us, the way to have them live on is to never stop loving them."_ - The Crow

---
