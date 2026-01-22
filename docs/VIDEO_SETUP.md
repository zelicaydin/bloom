# Video Setup for Netlify Deployment

## Problem
The homepage videos (`hero.mp4` and `forest.mp4`) are too large for GitHub (112MB and 29MB), so they can't be pushed directly to the repository. This means they won't be included in Netlify builds.

## Solution Options

### Option 1: Git LFS (Recommended)

1. **Install Git LFS:**
   ```bash
   # Mac (with Homebrew)
   brew install git-lfs
   
   # Or download from: https://git-lfs.github.com/
   ```

2. **Set up Git LFS in your repository:**
   ```bash
   git lfs install
   git lfs track "*.mp4"
   git add .gitattributes
   git add public/hero.mp4 public/forest.mp4
   git commit -m "Add videos using Git LFS"
   git push origin feature/netlify-deployment
   ```

3. **Verify it worked:**
   - Check GitHub - the files should show as "Stored with Git LFS"
   - Netlify will automatically download them during build

### Option 2: Host Videos on Supabase Storage

1. **Create a storage bucket in Supabase:**
   - Go to Supabase Dashboard → Storage
   - Create a new bucket called "videos" (make it public)

2. **Upload videos:**
   - Upload `hero.mp4` and `forest.mp4` to the bucket
   - Get the public URLs

3. **Update code to use Supabase URLs:**
   - Update `src/pages/Home/Hero.jsx` to use Supabase URL
   - Update `src/pages/Home/Tagline.jsx` to use Supabase URL

### Option 3: Use a CDN (Cloudinary, etc.)

1. Upload videos to a CDN service
2. Update the video `src` attributes to use CDN URLs
3. No need to commit videos to Git

### Option 4: Compress Videos

Reduce video file sizes to under 100MB:
```bash
# Using ffmpeg (if installed)
ffmpeg -i public/forest.mp4 -vcodec libx264 -crf 28 -preset slow public/forest-compressed.mp4
ffmpeg -i public/hero.mp4 -vcodec libx264 -crf 28 -preset slow public/hero-compressed.mp4
```

Then rename and commit the compressed versions.

## Quick Fix for Now

If you need videos working immediately on Netlify:

1. **After Netlify deploys**, you can manually upload videos:
   - Go to Netlify Dashboard → Your Site → Deploys
   - Click on the latest deploy
   - Use Netlify's file browser to upload videos to the `public/` folder
   - Redeploy

2. **Or use Netlify Drop:**
   - Build your site locally: `npm run build`
   - Drag the `dist` folder to Netlify Drop
   - This includes all files including videos

## Recommended Approach

**Use Git LFS** - It's the cleanest solution and works seamlessly with Netlify. The free tier of Git LFS on GitHub provides 1GB of storage and 1GB/month bandwidth, which is plenty for your videos.
