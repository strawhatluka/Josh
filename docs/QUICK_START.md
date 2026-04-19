# Quick Start Guide

## 1. Start the Server

```bash
npm run dev
```

The site will be at: http://localhost:3000

## 2. Add Your Content

### Landing Page

1. Add his photo to `public/images/landing/` as `photo.jpg`
2. Edit `public/index.html` to add:
   - His full name
   - Dates (birth and passing)
   - Your obituary text

### Photo Gallery

1. Go to http://localhost:3000/admin
2. Login (username: `admin`, password: `changeme123`)
3. Click "Photo Gallery" tab
4. Select a photo
5. Crop the image to your liking
6. Add a caption
7. Click "Crop & Upload"

### Resources Page

Edit `public/flowers.html`:

- Add context about his passing (if desired)
- Add your GoFundMe link
- Describe what the funds will support

## 3. Test Everything

- Visit all 4 pages to ensure content looks good
- Test on mobile (resize browser window)
- Submit a test memory to verify the form works
- Submit a test memory with a photo - test the crop feature
- Upload a test photo via admin panel (gallery) - test gallery crop feature
- Verify you can view and delete memories with photos in admin panel

## 4. Before Deploying

### Change Admin Credentials

See [ADMIN.md](ADMIN.md) for detailed instructions.

Quick version:

1. Copy the env file:
   ```bash
   cp .env.example .env
   ```
2. Edit `.env` and change:
   ```env
   ADMIN_USERNAME=your-username
   ADMIN_PASSWORD=your-secure-password
   SESSION_SECRET=random-secret-key
   ```
3. Restart the server

### Deploy

See [DEPLOYMENT.md](DEPLOYMENT.md) for step-by-step deployment to free hosting.

Recommended: Vercel (free tier, excellent performance with global CDN)

## Need Help?

- **Admin Panel**: See [ADMIN.md](ADMIN.md)
- **Deployment**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Full Documentation**: See [README.md](README.md)

## Common Tasks

**Change colors:**
Edit `public/css/global.css` - look for `:root` variables at the top

**Add more pages:**

1. Create new HTML file in `public/`
2. Add link to navigation in all pages
3. Add route in `src/server.js`

**Moderate memories:**
Use admin panel at http://localhost:3000/admin - "Memories" tab

- Edit memory names and messages
- View photos attached to memories
- Delete inappropriate memories (including photos)

**Manage gallery:**
Use admin panel - "Photo Gallery" tab

- Crop and upload new photos
- Edit captions
- Delete photos

**Backup your data:**

- Data is automatically backed up in Vercel Postgres (Neon)
- Photos are stored in Vercel Blob with high redundancy
- Export data from Vercel Storage dashboard if needed:
  - Navigate to Storage → Postgres database → Data tab
  - Navigate to Storage → Blob store → Browse files
