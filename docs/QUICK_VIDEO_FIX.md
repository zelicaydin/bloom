# Quick Fix: Get Videos Working on Netlify

## The Easiest Way (5 minutes)

### Step 1: Upload Videos to Cloudinary (Free)

1. Go to https://cloudinary.com and sign up (free)
2. Go to Media Library → Upload
3. Upload `public/hero.mp4` and `public/forest.mp4`
4. After upload, click on each video and copy the "Secure URL"
   - Hero URL will look like: `https://res.cloudinary.com/xxx/video/upload/v123/hero.mp4`
   - Forest URL will look like: `https://res.cloudinary.com/xxx/video/upload/v123/forest.mp4`

### Step 2: Add URLs to Netlify

1. Go to your Netlify site dashboard
2. Go to Site settings → Environment variables
3. Add these two variables:
   - `VITE_HERO_VIDEO_URL` = (paste hero video URL from Cloudinary)
   - `VITE_FOREST_VIDEO_URL` = (paste forest video URL from Cloudinary)

### Step 3: Redeploy

1. Go to Deploys → Trigger deploy → Clear cache and deploy site
2. Wait for deployment to complete
3. Your videos will now work! 🎉

## That's It!

The code is already updated to use these environment variables. Once you:
1. Upload videos to Cloudinary (or any CDN)
2. Add the URLs to Netlify environment variables
3. Redeploy

Your videos will appear on the live site!

## Alternative: Use Local Videos (If you can get them in the build)

If you want to use local videos instead:
1. Build locally: `npm run build`
2. The `dist` folder will have the videos
3. Use Netlify Drop to drag and drop the entire `dist` folder
4. This includes all files including videos

But the Cloudinary approach is better for production! 🚀
