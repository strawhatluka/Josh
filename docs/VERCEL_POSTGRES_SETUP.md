# Vercel Postgres & Blob Setup Guide

This memorial website now uses **Vercel Postgres** for persistent data storage and **Vercel Blob** for photo storage, ensuring data persists across deployments.

## What Changed

### Before (JSON Files):

- Memories stored in `data/memories.json` ❌ Lost on each deployment
- Gallery stored in `data/gallery.json` ❌ Lost on each deployment
- Photos stored in `public/images/` ❌ Lost on each deployment

### After (Vercel Postgres + Blob):

- Memories stored in PostgreSQL database ✅ Persistent
- Gallery stored in PostgreSQL database ✅ Persistent
- Photos stored in Vercel Blob ✅ Persistent

## Setup Instructions

### 1. Create Vercel Postgres Database (Neon)

1. Go to your Vercel project dashboard
2. Navigate to the **Storage** tab
3. Click **Create Database**
4. Select **Neon** (Serverless Postgres) - this is Vercel's Postgres solution
5. Choose a database name (e.g., `josh-memorial`)
6. Select a region close to your users (e.g., `us-east-1`)
7. Configure connection settings:
   - **Environments:** Check "Production" and "Development" (allows local development)
   - **Database Branches:** Leave unchecked (not needed for this project)
   - **Custom Prefix:** Enter `POSTGRES` (important! this creates POSTGRES_URL variable)
8. Click **Connect**

### 2. Create Vercel Blob Store

1. Still in the **Storage** tab
2. Click **Create Database** again
3. Select **Blob** (Fast object storage)
4. Choose a blob store name (e.g., `memorial-photos`)
5. Configure connection settings:
   - **Environments:** Check "Production" and "Development"
6. Click **Create**

### 3. Verify Environment Variables

Vercel automatically adds these environment variables to your project:

**Postgres Variables:**

- `POSTGRES_URL` - Main connection string
- `POSTGRES_PRISMA_URL` - Prisma-compatible URL
- `POSTGRES_URL_NON_POOLING` - Direct connection
- `POSTGRES_USER` - Database username
- `POSTGRES_HOST` - Database host
- `POSTGRES_PASSWORD` - Database password
- `POSTGRES_DATABASE` - Database name

**Blob Variables:**

- `BLOB_READ_WRITE_TOKEN` - Authentication token for Blob storage

To verify these were added:

1. Go to your project Settings
2. Click **Environment Variables**
3. You should see all the above variables listed

### 3a. Add User-Configured Variables (If Not Already Added)

If you haven't already, add these variables in Vercel dashboard (Settings > Environment Variables):

- `ADMIN_USERNAME` - Your admin username
- `ADMIN_PASSWORD` - Your admin password (plaintext, will be hashed)
- `SESSION_SECRET` - Random secret key for sessions
- `NODE_ENV` - Set to `production`

For each variable:

1. Select which environments: Production, Preview, Development (check all three)
2. Enter the value
3. Click "Save"

### 4. Deploy Your Code

1. Commit all changes:

```bash
git add .
git commit -m "Migrate to Vercel Postgres and Blob storage"
git push origin main
```

2. Vercel will automatically deploy with the new database

3. On first deployment, the database tables will be automatically created

### 5. Test Everything

After deployment:

1. **Test Admin Login:**
   - Visit `https://your-domain.vercel.app/admin`
   - Login with your credentials

2. **Test Gallery Upload:**
   - Upload a photo via admin panel
   - Verify it appears on the "Through the Years" page
   - Photo should persist after redeployment

3. **Test Memory Submission:**
   - Submit a test memory with a photo
   - Verify it appears on the Memories page
   - Memory should persist after redeployment

## Database Schema

The following tables are automatically created:

### `memories` table:

```sql
CREATE TABLE memories (
  id SERIAL PRIMARY KEY,
  from_name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### `gallery` table:

```sql
CREATE TABLE gallery (
  id SERIAL PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  photo_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### `session` table:

```sql
CREATE TABLE session (
  sid VARCHAR NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);
CREATE INDEX IF NOT EXISTS IDX_session_expire ON session (expire);
```

**Purpose:** Stores admin session data for authentication persistence across serverless function instances.

**Why needed:** Vercel serverless functions are stateless - each request may be handled by a different instance. Storing sessions in PostgreSQL ensures admin login persists across all instances.

**Managed by:** `connect-pg-simple` package (PostgreSQL session store for express-session)

**Configuration:**

- Sessions expire after 24 hours
- Table is automatically created on first server startup
- Session data includes `isAdmin` flag and username

## Local Development

### Recommended: Use Vercel Postgres Locally

Since you checked the "Development" environment when creating the Postgres and Blob stores, you can connect your local development server directly to the production database:

1. **Install Vercel CLI** (if not already installed):

```bash
npm i -g vercel
```

2. **Link your project** (one-time setup):

```bash
vercel link
```

Follow the prompts to link to your Vercel project.

3. **Pull ALL environment variables from Vercel**:

```bash
vercel env pull .env.local
```

This command downloads ALL environment variables from Vercel (user-configured + auto-configured) and writes them to `.env.local`.

**IMPORTANT:** This command OVERWRITES `.env.local` completely, so make sure all your environment variables are stored in Vercel dashboard (Settings > Environment Variables).

The downloaded `.env.local` will include:

- `ADMIN_USERNAME`, `ADMIN_PASSWORD`, `SESSION_SECRET`
- `POSTGRES_URL` and all Postgres connection strings
- `BLOB_READ_WRITE_TOKEN` for photo storage
- `NODE_ENV` and other variables

**After pulling environment variables**, you must change `NODE_ENV` to `development` in `.env.local`:

Open `.env.local` and change:

```bash
NODE_ENV="production"
```

To:

```bash
NODE_ENV="development"
```

**Why?** `NODE_ENV=production` sets `secure: true` on cookies (requires HTTPS). Local development runs on HTTP (`localhost:3000`), so admin login won't work without this change.

4. **Run the development server**:

```bash
npm run dev
```

Your local server will now connect to:

- Production Postgres database (Neon)
- Production Blob storage
- Use your production admin credentials

**Note:** Be careful when testing locally - you're working with production data! Any changes (uploads, deletions, edits) affect the live site.

### Alternative: Use Local PostgreSQL (Advanced)

If you prefer to keep development data separate:

1. Install PostgreSQL locally
2. Create a database:

```bash
createdb memorial_local
```

3. Create `.env.local` with only local Postgres connection:

```env
POSTGRES_URL=postgresql://localhost/memorial_local
ADMIN_USERNAME=admin
ADMIN_PASSWORD=testpass
SESSION_SECRET=local-dev-secret-key
NODE_ENV=development
```

4. Run the server - tables will be created automatically

**Note:** This approach requires manually managing environment variables and won't include Blob storage (photos will fail to upload locally).

## Troubleshooting

### Database connection errors

**Error:** "Failed to initialize database"

**Solution:**

1. Check that Vercel Postgres is properly connected to your project
2. Verify environment variables are set in Vercel dashboard
3. Redeploy the project

### Photos not uploading

**Error:** "Failed to upload file"

**Solution:**

1. Check that Vercel Blob is properly connected
2. Verify `BLOB_READ_WRITE_TOKEN` environment variable exists
3. Check Vercel Blob dashboard for storage limits

### Admin panel 401 errors

**Solution:** This was the original issue - now fixed with proper CORS and session configuration. If it persists:

1. Clear browser cookies
2. Try logging in again
3. Check that `SESSION_SECRET` environment variable is set

### Admin session issues (401 errors)

**Error:** "Unauthorized" errors in admin panel even after logging in

**Solution:**

1. Session store is properly configured with PostgreSQL
2. Verify `POSTGRES_URL` environment variable is set
3. Check that session table exists in database
4. Clear browser cookies and log in again
5. Check Vercel function logs for session-related errors

**Technical Details:**

- Sessions are stored in PostgreSQL using `connect-pg-simple`
- This ensures sessions persist across serverless function instances
- Without database session storage, each serverless instance has its own memory, causing session loss

## Data Migration (If You Have Existing Data)

If you had deployed with JSON files and have existing memories/photos:

**Note:** The JSON data migration functionality was not completed since you're starting fresh. The system will start with empty tables.

If you need to migrate existing data later, you'll need to:

1. Export data from JSON files
2. Insert into PostgreSQL manually or create a migration script

## Monitoring

### View Database Data

1. Go to Vercel dashboard
2. Navigate to Storage → Your Postgres database
3. Click "Data" tab to browse tables

### View Blob Storage

1. Go to Vercel dashboard
2. Navigate to Storage → Your Blob store
3. Browse uploaded files

## Cost

- **Postgres:** Free tier includes 256 MB storage, 60 hours compute
- **Blob:** Free tier includes 500 GB bandwidth/month

Your memorial site should easily fit within free tier limits.

## Support

For Vercel-specific issues:

- [Vercel Postgres Docs](https://vercel.com/docs/storage/vercel-postgres)
- [Vercel Blob Docs](https://vercel.com/docs/storage/vercel-blob)

For application issues, check:

- Server logs in Vercel dashboard
- Browser console for frontend errors
