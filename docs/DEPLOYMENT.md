# Deployment Guide

## Overview

Deployment to Vercel is **fully automated via GitHub Actions**. You don't run `vercel --prod` manually anymore — publishing a GitHub release triggers a deploy. This guide covers both the one-time Vercel project setup and the day-to-day release flow.

> For the release/deploy workflow files themselves, see `.github/workflows/release.yml` and `.github/workflows/deploy.yml`. For the required GitHub secrets, see [`.github/SECRETS.md`](../.github/SECRETS.md).

### Prerequisites

- GitHub account with push access to this repo
- Vercel account
- All content added (photos, obituary, GoFundMe link)

---

## Part 1: One-Time Vercel Project Setup

### Step 1: Prepare Your Code

**Verify everything is ready:**

- ✅ Landing page photo at `public/images/landing/photo.jpg`
- ✅ Obituary text updated in `public/index.html`
- ✅ Photos uploaded via admin panel (or in `public/images/gallery/`)
- ✅ GoFundMe link added to `public/flowers.html`
- ✅ `.env.local` file created with your credentials (NOT committed to Git)

---

### Step 2: Push to GitHub

```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

**If you haven't set up Git yet:**

1. Create a new repository on [github.com](https://github.com)
2. Follow GitHub's instructions to push your code

---

### Step 3: Deploy to Vercel (First-Time)

#### Initial Setup

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up with GitHub** (recommended for easy integration)
3. **Click "Add New..." → "Project"**
4. **Import your GitHub repository:**
   - Select the memorial website repository
   - Click "Import"

#### Project Configuration

5. **Configure Build Settings:**
   - **Project Name**: memorial-website (or your choice)
   - **Framework Preset**: Other (Vercel auto-detects Node.js)
   - **Root Directory**: ./ (leave as default)
   - **Build Command**: `npm install` (auto-detected)
   - **Output Directory**: (leave empty)
   - **Install Command**: `npm install` (auto-detected)
   - **Development Command**: (leave empty)

6. **Add Environment Variables** (CRITICAL - Don't skip!):
   - Expand the "Environment Variables" section
   - Add each variable for **Production, Preview, and Development**:

   | Variable         | Value                  | Description                          |
   | ---------------- | ---------------------- | ------------------------------------ |
   | `ADMIN_USERNAME` | your-username          | Your admin panel username            |
   | `ADMIN_PASSWORD` | YourSecurePassword123! | Password (plaintext - app hashes it) |
   | `SESSION_SECRET` | long-random-string     | Generate at randomkeygen.com         |
   | `NODE_ENV`       | production             | Sets production mode                 |

   **How to add each variable:**
   - Type variable name in "Key" field
   - Enter value in "Value" field
   - Check all three boxes: Production, Preview, Development
   - Click "Add"

7. **Click "Deploy"**

Vercel will:

- Install dependencies
- Build your project
- Deploy to a global CDN
- Provide a live URL

**Your site will be live at:** `https://your-project-name.vercel.app`

---

### Step 4: Configure GitHub Actions Secrets

After the initial Vercel deploy, the CI/CD pipeline takes over. You need to add three repository secrets on GitHub so `deploy.yml` can talk to Vercel:

| Secret              | Where to find it                                               |
| ------------------- | -------------------------------------------------------------- |
| `VERCEL_ORG_ID`     | `.vercel/project.json` after `vercel link` — the `orgId` field |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` — the `projectId` field                 |
| `VERCEL_TOKEN`      | Vercel dashboard → Account Settings → Tokens → Create Token    |

Add them under **Settings → Secrets and variables → Actions → New repository secret** on the GitHub repo.

Full checklist with the actual values lives in [`.github/SECRETS.md`](../.github/SECRETS.md).

### Step 5: Verify Deployment

**After deployment completes (2-3 minutes):**

1. Visit your live URL
2. Test all 4 pages (Home, Through the Years, Memories, In Lieu of Flowers)
3. Navigate to `/admin` and log in with your credentials
4. Test uploading a photo
5. Submit a test memory on the Memories page
6. Edit/delete test content via admin panel

---

## Part 2: Ongoing Release Flow (CI/CD)

Once the project is set up, deploys are driven by GitHub releases. The pipeline is:

```
1. Update CHANGELOG.md  →  2. Commit + push  →  3. Tag v*.*.*  →
4. release.yml drafts release  →  5. You review + publish on GitHub  →
6. deploy.yml auto-deploys to Vercel
```

### Cutting a release

1. **Add a new version section to `CHANGELOG.md`** under `## [x.y.z] - YYYY-MM-DD`. Use Added / Changed / Fixed / Removed categories per [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
2. **Commit and push to `main`**:
   ```bash
   git add CHANGELOG.md
   git commit -m "chore(release): prepare vX.Y.Z"
   git push origin main
   ```
3. **Tag the commit and push the tag**:
   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```
4. **`release.yml` fires** — it extracts the `## [X.Y.Z]` section from `CHANGELOG.md` and creates a draft GitHub release.
5. **Review the draft** in the GitHub UI (Releases page). Edit the notes if needed.
6. **Click Publish**. This triggers `deploy.yml`, which deploys to Vercel.

### Manual / hotfix deploys

If you need to deploy outside the release flow (e.g., a hotfix), trigger `deploy.yml` manually:

1. Go to **Actions → Deploy to Vercel** on GitHub.
2. Click **Run workflow** and select the branch.
3. The workflow runs `vercel pull` → `vercel build` → `vercel deploy --prebuilt --prod`.

### Custom Domain (Optional)

**Add your own domain:**

1. Buy a domain (Namecheap, Google Domains, etc.)
2. In Vercel dashboard → Your Project → Settings → Domains
3. Click "Add Domain"
4. Enter your domain name
5. Follow Vercel's instructions to configure DNS

Vercel automatically provides:

- Free SSL certificate
- Automatic HTTPS
- Global CDN

---

## Environment Variables Reference

### Required Variables

```env
ADMIN_USERNAME=your-username
ADMIN_PASSWORD=your-secure-password
SESSION_SECRET=your-random-secret-key-here
NODE_ENV=production
```

### Important Notes

- **ADMIN_PASSWORD**: Use plaintext - the app automatically hashes it with bcrypt
- **SESSION_SECRET**: Generate at https://randomkeygen.com/ (use "Fort Knox Password")
- **Never commit** `.env` or `.env.local` files to Git (already in `.gitignore`)
- Set these in Vercel dashboard, not in code
- The app shows a warning on startup if using default credentials

### Where to Set in Vercel

**Option 1: During Initial Deployment**

- Add in "Environment Variables" section before clicking "Deploy"

**Option 2: After Deployment**

1. Go to your project in Vercel dashboard
2. Click "Settings"
3. Click "Environment Variables" in sidebar
4. Add/edit variables
5. Redeploy for changes to take effect

---

## Updating Your Site

### Via the Release Flow (Preferred)

Follow the steps in **Part 2: Ongoing Release Flow (CI/CD)** above. This is the default path: update `CHANGELOG.md`, tag, publish the draft, done.

### Manual Redeploy

If you need to redeploy the current tip of `main` without cutting a new release, use the `Deploy to Vercel` workflow's **Run workflow** button on GitHub Actions (as described in "Manual / hotfix deploys" above).

As a last-resort fallback, you can still redeploy via the Vercel dashboard:

1. Go to your project
2. Click "Deployments" tab
3. Click "..." on latest deployment → "Redeploy"

---

## Data Persistence

**✅ FULLY PERSISTENT STORAGE**

This application uses **Vercel Postgres** and **Vercel Blob** for complete data persistence:

**Database (Vercel Postgres - Neon):**

- Stores all memories (name, message, photo URLs, timestamps)
- Stores gallery metadata (filename, photo URL, caption, display order)
- Stores admin sessions for authentication across serverless instances
- **Data survives:** Redeployments, serverless scaling, instance restarts

**Photo Storage (Vercel Blob):**

- Stores all gallery photos
- Stores all memory photos
- Photos accessible via secure HTTPS URLs
- **Photos survive:** Redeployments, function scaling, all scenarios

**Session Storage (PostgreSQL):**

- Admin sessions stored in database, not memory
- Ensures login persists across different serverless function instances
- Fixes 401 authentication errors common in serverless environments

**No data loss on:**

- Git push / redeployment
- Vercel function scaling
- Serverless instance changes
- Project updates
- Environment variable changes

**Free Tier Limits:**

- Postgres: 256 MB storage, 60 hours compute/month
- Blob: 500 GB bandwidth/month
- Should be more than sufficient for a memorial website

---

## Troubleshooting

### Build Fails

**Check:**

- All dependencies in `package.json` are correct
- No syntax errors in code
- Build logs in Vercel dashboard for error details

**Solution:**

- Review build logs in Vercel dashboard
- Test `npm install` and `npm start` locally first

### Admin Login Not Working

**Symptoms:**

- "Invalid credentials" error
- Can't access `/admin`

**Solutions:**

1. Verify environment variables are set in Vercel dashboard
2. Check that you're using the correct credentials
3. Ensure `NODE_ENV=production` is set
4. Redeploy after adding environment variables
5. Check function logs for "WARNING: Using default admin credentials"

### Memories/Photos Not Saving

**Cause:** Database or Blob storage connection issue

**Solutions:**

1. Verify Vercel Postgres is connected (Storage tab in Vercel dashboard)
2. Verify Vercel Blob is connected (Storage tab in Vercel dashboard)
3. Check environment variables:
   - `POSTGRES_URL` should be auto-configured
   - `BLOB_READ_WRITE_TOKEN` should be auto-configured
4. Check Vercel function logs for specific errors
5. Test database connection in Storage dashboard
6. Verify free tier limits haven't been exceeded

### Images Not Loading

**Check:**

- Files are committed to Git
- File paths are case-sensitive
- Images exist in `public/images/` directories
- Check browser console for 404 errors

**Solution:**

```bash
git add public/images/
git commit -m "Add images"
git push
```

### Admin 401 Errors / Can't Stay Logged In

**Symptoms:**

- Log in successfully but get 401 errors on admin operations
- Session expires immediately
- Works on one tab but fails on another

**Cause:** Session persistence issue (now fixed with PostgreSQL session store)

**Solutions:**

1. Verify `POSTGRES_URL` environment variable exists
2. Check that database connection is working
3. Verify session table exists (automatically created)
4. Clear all browser cookies for the site
5. Log in again
6. Check Vercel function logs for session/database errors

**Technical Fix Applied:**

- Sessions now stored in PostgreSQL instead of memory
- Uses `connect-pg-simple` package
- Ensures sessions persist across serverless function instances
- This fix resolves the "works for gallery but not memories" issue

### Function Timeout Errors

**Cause:** Vercel has 10-second function timeout on free tier

**Solution:**

- Reduce image sizes before uploading
- Current implementation should work fine
- If issues persist, consider upgrading Vercel plan

---

## Why Vercel?

This application is **specifically designed for Vercel** with:

- Vercel Postgres (Neon) for database
- Vercel Blob for photo storage
- PostgreSQL session store for serverless authentication

**Alternative platforms would require:**

- Setting up your own PostgreSQL database
- Setting up your own object storage (S3, Cloudinary, etc.)
- Modifying code to use different storage providers
- Additional configuration and cost

**Recommendation:** Use Vercel for this project. It's free, fast, and designed to work out-of-the-box with this codebase.

---

## Security Checklist

Before going live:

- [ ] Changed admin credentials from defaults
- [ ] Generated strong SESSION_SECRET
- [ ] Verified `.env.local` is in `.gitignore`
- [ ] Set `NODE_ENV=production` in Vercel
- [ ] Tested admin login works
- [ ] No sensitive data in code/Git
- [ ] HTTPS is enabled (automatic on Vercel)

---

## Performance Optimization

Vercel automatically provides:

- ✅ Global CDN (fast loading worldwide)
- ✅ Automatic caching
- ✅ Gzip/Brotli compression
- ✅ HTTP/2 and HTTP/3
- ✅ Image optimization (via Vercel Image Optimization)

No additional configuration needed!

---

## Support Resources

**Vercel Documentation:**

- [Node.js Deployment Guide](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/projects/domains)

**Need Help?**

- Check Vercel's build logs for detailed errors
- Review function logs in Vercel dashboard
- Consult Vercel's support documentation

---

## Post-Deployment

1. **Share the URL** with family and friends
2. **Test all features** thoroughly
3. **Monitor the Memories page** for submissions
4. **Backup data periodically** if using JSON storage
5. **Consider custom domain** for a more personal touch

Your memorial website is now live and accessible worldwide. 🌟
