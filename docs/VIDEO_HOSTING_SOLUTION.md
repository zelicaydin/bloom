# Video Hosting Solution for Netlify

## The Problem
Your videos (`hero.mp4` - 29MB and `forest.mp4` - 112MB) are too large for GitHub's 100MB limit, so they can't be pushed to the repository and won't appear on Netlify.

## ✅ Best Solution: Use Environment Variables with External URLs

I've created a solution that uses environment variables so you can host videos anywhere and they'll work on Netlify.

### Option 1: Cloudinary (Recommended - Free Tier)

1. **Sign up for free Cloudinary account:**
   - Go to https://cloudinary.com
   - Sign up (free tier includes 25GB storage + 25GB bandwidth/month)

2. **Get your credentials:**
   - Dashboard → Settings → Product Environment Credentials
   - Copy: Cloud Name, API Key, API Secret

3. **Add to your `.env` file:**
   ```
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   ```

4. **Upload videos:**
   ```bash
   npm run upload-videos-cloudinary
   ```

5. **The script will give you URLs - update the code:**
   - Update `src/pages/Home/Hero.jsx` with the hero video URL
   - Update `src/pages/Home/Tagline.jsx` with the forest video URL

### Option 2: Manual Cloudinary Upload (Easier)

1. **Go to Cloudinary Media Library:**
   - https://cloudinary.com/console/media_library

2. **Upload both videos:**
   - Click "Upload" → Select `hero.mp4` and `forest.mp4`
   - Wait for upload to complete

3. **Get the URLs:**
   - Click on each video → Copy the "Secure URL"
   - It will look like: `https://res.cloudinary.com/your-cloud/video/upload/v1234567890/hero.mp4`

4. **Update the code:**
   - I'll update the components to use environment variables
   - You just need to set the URLs in Netlify's environment variables

### Option 3: Use Any CDN/Storage Service

You can host videos on:
- **Cloudinary** (recommended - free tier)
- **AWS S3** (free tier available)
- **Google Cloud Storage** (free tier available)
- **Bunny CDN** (very cheap)
- **Any other CDN**

Just get the public URLs and update the code.

## Implementation

I'll update the code to use environment variables so you can easily change video URLs without code changes.
