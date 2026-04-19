# Initial Setup Guide

## Step 1: Configure Admin Credentials

**IMPORTANT: Do this before deploying!**

1. Copy the environment template:

   ```bash
   cp .env.example .env
   ```

2. Open `.env` in your text editor and change these values:

   ```env
   ADMIN_USERNAME=your_chosen_username
   ADMIN_PASSWORD=YourSecurePassword123!
   SESSION_SECRET=paste-a-random-string-from-randomkeygen-com
   ```

3. Generate a session secret at: https://randomkeygen.com/
   - Use a "Fort Knox Password" or similar long random string

**Security Notes:**

- Don't use simple passwords
- Never commit the `.env` file to Git (it's already in `.gitignore`)
- The password is automatically hashed by the application

## Step 2: Start the Development Server

```bash
npm run dev
```

The site will run at: http://localhost:3000

You should see a warning if using default credentials:

```
⚠️  WARNING: Using default admin credentials!
   Create a .env file from .env.example and set secure credentials.
```

If you created the `.env` file correctly, you won't see this warning.

## Step 3: Test Admin Access

1. Visit: http://localhost:3000/admin
2. Log in with your credentials from `.env`
3. You should see the admin dashboard

## Step 4: Add Your Content

### Landing Page

1. Add his photo to `public/images/landing/photo.jpg`
2. Edit `public/index.html`:
   - Replace `[Full Name]`
   - Add dates and obituary text

### Photo Gallery (via Admin Panel)

1. Log into admin panel
2. Go to "Photo Gallery" tab
3. Select a photo file
4. Crop the image using the built-in cropper
5. Add a caption
6. Upload - photos automatically stored in Vercel Blob and appear on "Through the Years" page
7. Gallery loads dynamically from PostgreSQL database

### Resources Page

Edit `public/flowers.html`:

- Add GoFundMe link (replace `[YOUR_GOFUNDME_LINK]`)
- Add any context about his passing
- Customize resource descriptions if needed

## Step 5: Test Everything

- [ ] Visit all 4 public pages
- [ ] Test responsive design (resize browser)
- [ ] Submit a test memory
- [ ] Upload a test photo via admin
- [ ] Edit/delete test content via admin
- [ ] Check that photos appear on gallery page

## Ready to Deploy?

See [DEPLOYMENT.md](DEPLOYMENT.md) for instructions on deploying to free hosting.

**Before deploying, make sure:**

- [ ] `.env` file has secure credentials
- [ ] Landing page has real content
- [ ] You've tested all functionality locally
- [ ] Photos are optimized (not too large)

## Environment Variables for Deployment

When deploying to hosting platforms (Render, Railway, etc.), you'll need to set these environment variables in their dashboard:

```
ADMIN_USERNAME=your_username
ADMIN_PASSWORD=your_password
SESSION_SECRET=your_random_secret
NODE_ENV=production
```

**Don't upload your `.env` file** - set these directly in the hosting platform's environment variable settings.

## Troubleshooting

**Can't log into admin:**

- Check your `.env` file exists and has correct values
- Restart the server after changing `.env`
- Try the default credentials (admin/changeme123) if `.env` isn't loading

**Warning about default credentials:**

- This means `.env` file wasn't found or didn't load
- Make sure you copied `.env.example` to `.env`
- Check that `.env` is in the root directory

**Photos not appearing:**

- Check admin panel uploaded them successfully (look for success message)
- Verify photos were uploaded to Vercel Blob (check Vercel Storage dashboard)
- Check database contains photo entries (check Vercel Storage → Postgres → Data)
- Clear browser cache and reload (gallery uses lazy loading)
- Check browser console for any JavaScript errors
- Verify `BLOB_READ_WRITE_TOKEN` environment variable is set

## Need More Help?

- Quick start: [QUICK_START.md](QUICK_START.md)
- Admin guide: [ADMIN.md](ADMIN.md)
- Full docs: [README.md](README.md)
