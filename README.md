# Memorial Website for Joshua Alexander Downs

A heartfelt memorial website built to honor and remember Joshua Alexander Downs (October 16, 1994 - December 7, 2025). This project provides a beautiful, interactive space for family and friends to celebrate Josh's life, share memories, and view cherished photographs.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Security](#security)
- [Deployment](#deployment)
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
  - bcrypt password hashing (10 rounds)
  - Session-based authentication
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
- **ESLint**: JavaScript best practices enforcement
- **Prettier**: Consistent code formatting across the project
- **Lint-staged**: Optimized pre-commit checks on staged files only

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

- ESLint, Prettier, Husky, Lint-staged

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
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
│   ├── config/
│   │   ├── admin.js            # Admin credentials
│   │   └── rateLimits.js       # Rate limiting configuration
│   ├── db/
│   │   └── index.js            # Database connection
│   ├── middleware/
│   │   └── auth.js             # Authentication middleware
│   ├── routes/
│   │   ├── admin.js            # Admin API endpoints
│   │   ├── gallery.js          # Public gallery endpoints
│   │   └── memories.js         # Memory submission endpoints
│   ├── utils/
│   │   ├── blob.js             # Vercel Blob utilities
│   │   ├── gallery.js          # Gallery database operations
│   │   ├── storage.js          # Memory database operations
│   │   └── validator.js        # Input validation
│   └── server.js               # Express server entry point
│
├── docs/                       # Documentation
│   ├── QUICK_START.md
│   ├── SETUP.md
│   ├── ADMIN.md
│   ├── DEPLOYMENT.md
│   ├── PRE_COMMIT_SETUP.md
│   └── VERCEL_POSTGRES_SETUP.md
│
├── .husky/                     # Git hooks
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

For details, see [SECURITY_AUDIT.md](SECURITY_AUDIT.md)

## Deployment

### Vercel Deployment (Recommended)

1. Push to GitHub
2. Deploy to Vercel: `vercel --prod`
3. Configure environment variables in Vercel dashboard
4. Set up custom domain (optional)

Full guide: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

### Manual Deployment

Can be deployed to any Node.js host with PostgreSQL and blob storage support.

## Documentation

- [Quick Start Guide](docs/QUICK_START.md)
- [Setup Guide](docs/SETUP.md)
- [Admin Panel Guide](docs/ADMIN.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Pre-commit Hooks](docs/PRE_COMMIT_SETUP.md)
- [Database Setup](docs/VERCEL_POSTGRES_SETUP.md)

## Available Scripts

```bash
npm start              # Production server
npm run dev            # Development server with auto-reload
npm run format         # Format all files with Prettier
npm run format:check   # Check formatting
npm run lint           # Run ESLint
npm run lint:fix       # ESLint with auto-fix
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
