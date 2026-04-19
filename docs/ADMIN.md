# Admin Panel Guide

## Accessing the Admin Panel

Navigate to: **http://localhost:3000/admin**

The admin link is not visible on any public pages - you must navigate to it directly.

## Default Login Credentials

**IMPORTANT: Change these before deploying!**

- **Username**: `admin`
- **Password**: `changeme123`

## Changing Admin Credentials (Recommended Method)

**Using Environment Variables:**

1. Copy the example file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` file and change the values:

   ```env
   ADMIN_USERNAME=your-username
   ADMIN_PASSWORD=your-secure-password
   SESSION_SECRET=your-random-secret-key-here
   ```

3. Install dependencies (if not already done):

   ```bash
   npm install
   ```

4. Restart the server:
   ```bash
   npm run dev
   ```

**Notes:**

- Password is stored as plaintext in `.env` but automatically hashed with bcrypt by the app
- bcrypt cost is env-gated: 12 rounds in production, 4 rounds under `NODE_ENV=test` (keeps the test suite fast without losing real bcrypt integration in prod)
- `.env` file is in `.gitignore` so it won't be committed to Git
- Generate a random session secret at: https://randomkeygen.com/
- The app supports both `.env` and `.env.local` (tries `.env.local` first)
- Default credentials will show a warning message on server startup

## Admin Panel Features

### Photo Gallery Management

**Upload Photos with Image Cropping:**

1. Click "Photo Gallery" tab
2. Select a photo file (JPEG, PNG, GIF)
3. A crop modal will appear with Cropper.js
4. Crop the image to your desired size and aspect ratio (free aspect ratio supported)
5. Add a caption in the form field
6. Click "Crop & Upload"
7. The cropped image will be uploaded and automatically appear in the gallery

**Edit Caption:**

1. Find the photo in the gallery list
2. Click "Edit Caption"
3. Update the caption
4. Click "Save Changes"

**Reorder Photos:**

1. Each photo has a drag handle icon (☰) in the top-left corner
2. Click and hold the drag handle to start dragging
3. Drag the photo to its new position in the gallery
4. Visual feedback shows where you can drop the photo (dashed border)
5. Release to drop - the new order is automatically saved
6. The public gallery immediately reflects the new order

**Delete Photo:**

1. Find the photo in the gallery list
2. Click "Delete"
3. Confirm deletion
4. Photo file and database entry will be removed

### Memories Management

**View All Memories:**

- Click "Memories" tab
- All submitted memories are listed with name, message, timestamp, and photo (if attached)

**Edit Memory:**

1. Find the memory you want to edit
2. Click "Edit"
3. Modify the name or message
4. Click "Save Changes"

**View Memory Photos:**

- Memories with photos will display the photo in the admin list
- Photos are cropped by visitors when they submit their memory
- You cannot edit or replace photos - visitors handle cropping before submission
- To remove a photo, you must delete the entire memory

**Note:** Memory photos are separate from the "Through the Years" gallery. Visitors crop these photos when submitting memories, ensuring the best presentation.

**Delete Memory:**

1. Find the memory you want to delete
2. Click "Delete"
3. Confirm deletion
4. Both the memory text and any attached photo will be removed

## Security Notes

### Session Security

- Sessions expire after 24 hours
- httpOnly cookies prevent XSS attacks
- In production, cookies use HTTPS only

### File Upload Security

- Only image files allowed (JPEG, PNG, GIF, WebP)
- 10MB file size limit for all uploads
- Files are validated before upload
- **Gallery photos:** Cropped by admin before upload using Cropper.js in admin panel
- **Memory photos:** Cropped by visitors before submission using Cropper.js on public form
- Uploaded files stored in **Vercel Blob** with unique identifiers
- Automatic cleanup on upload errors or deletions
- All photos accessible via secure Blob URLs
- Photos persist across deployments and serverless scaling

### Rate Limiting

**Public Endpoints:**

- Memory submission: 5 submissions per minute per IP
- Protects against spam and abuse

**Admin Endpoints:**

- Admin login: 5 attempts per 15 minutes per IP
- Prevents brute force attacks
- After 5 failed attempts, must wait 15 minutes before trying again

**Security Headers:**

- Content Security Policy (CSP) via Helmet.js
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security (HSTS)
- Prevents XSS, clickjacking, and other attacks

## Important Security Steps Before Deployment

1. **Create .env file** from `.env.example`
2. **Change admin credentials** in `.env`:
   - Set ADMIN_USERNAME to your desired username
   - Set ADMIN_PASSWORD to a strong password (stored as plaintext in .env, hashed by app)
   - Generate SESSION_SECRET at https://randomkeygen.com/
3. **Set NODE_ENV=production** for production deployment
4. **Never commit .env files** - already in `.gitignore`

### Environment Variables (Already Configured)

The application already has environment variable support configured with `dotenv`. The app:

- Tries to load `.env.local` first, then `.env`
- Automatically hashes passwords with bcrypt
- Shows a warning if default credentials are used
- `.env` files are already in `.gitignore`

Required environment variables:

```
ADMIN_USERNAME=your-username
ADMIN_PASSWORD=your-plaintext-password
SESSION_SECRET=your-random-secret-key-here
NODE_ENV=development (or production)
```

## Troubleshooting

**Can't log in:**

- Check that environment variables are set in Vercel dashboard
- Clear browser cookies and try again
- Check Vercel function logs for errors
- Verify `SESSION_SECRET` is configured

**Session expires immediately / 401 errors:**

- Session data is stored in PostgreSQL for serverless persistence
- Check that `POSTGRES_URL` environment variable is set
- Verify database connection is working
- Clear browser cookies and try logging in again

**Photos not uploading:**

- Check file size (must be under 10MB)
- Verify file is an image (JPEG, PNG, GIF, WebP)
- Ensure `BLOB_READ_WRITE_TOKEN` environment variable is set
- Check Vercel Blob storage quota (free tier: 500 GB/month bandwidth)
- Check Vercel function logs for specific errors

**Photos not displaying on public page:**

- Verify photos were successfully uploaded to Vercel Blob
- Check that database contains photo URLs
- Check browser console for errors
- Try clearing browser cache
- Verify Blob URLs are accessible

**Cropper not working:**

- **Admin panel:** Ensure Cropper.js is loaded (check browser console)
  - CDN link in admin.html: https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.js
- **Memories page:** Ensure Cropper.js is loaded on public page
  - CDN link in memories.html: https://cdnjs.cloudflare.com/ajax/libs/cropperjs/1.6.1/cropper.min.js
- Check that image file is a valid image format

**Memories not updating:**

- Check Vercel function logs for database errors
- Verify `POSTGRES_URL` environment variable is set
- Check PostgreSQL connection in Vercel Storage dashboard
- Test database connectivity

## Backup Recommendations

**Database Backup:**

- Vercel Postgres (Neon) automatically backs up your database
- You can export data from Vercel Storage dashboard
- Navigate to Storage → Your Postgres database → Data tab
- Use SQL queries to export specific tables if needed

**Blob Storage:**

- Photos are stored in Vercel Blob with high redundancy
- You can browse and download photos from Vercel Storage dashboard
- Navigate to Storage → Your Blob store → Browse files

**Manual Backup (Optional):**

- Export database tables as SQL or CSV
- Download photos from Blob storage dashboard
- Store backups locally or in cloud storage (Google Drive, Dropbox, etc.)

## Support

If you encounter issues with the admin panel, check the server logs in your terminal for detailed error messages.
