# Deployment Guide - Netlify

This guide will help you deploy the Bloom e-commerce application to Netlify.

## Prerequisites

- A Netlify account (free tier works fine)
- Your Supabase project URL and anon key
- Your code pushed to GitHub

## Deployment Steps

### Option 1: Deploy via Netlify Dashboard (Recommended)

1. **Go to Netlify**
   - Visit [netlify.com](https://www.netlify.com) and sign in
   - Click "Add new site" → "Import an existing project"

2. **Connect to GitHub**
   - Choose "GitHub" as your Git provider
   - Authorize Netlify to access your repositories
   - Select your `bloom` repository
   - Choose the branch you want to deploy (usually `main` or `master`)

3. **Configure Build Settings**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - Netlify should auto-detect these from `netlify.toml`

4. **Set Environment Variables**
   - Click "Show advanced" → "New variable"
   - Add the following variables:
     - `VITE_SUPABASE_URL` = Your Supabase project URL
     - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon/public key
   - You can find these in your Supabase dashboard under Settings → API

5. **Deploy**
   - Click "Deploy site"
   - Wait for the build to complete (usually 2-3 minutes)
   - Your site will be live at `https://your-site-name.netlify.app`

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Netlify**
   ```bash
   netlify init
   ```
   - Follow the prompts to link your site

4. **Set Environment Variables**
   ```bash
   netlify env:set VITE_SUPABASE_URL "your-supabase-url"
   netlify env:set VITE_SUPABASE_ANON_KEY "your-supabase-anon-key"
   ```

5. **Deploy**
   ```bash
   netlify deploy --prod
   ```

## Important Notes

### Backend Server
- The Express.js backend server (`server/server.js`) **does not need to be deployed** for production
- Since you're using Supabase, all database operations happen directly from the frontend
- The backend was only needed for migration/development

### Environment Variables
Make sure to set these in Netlify:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon/public key

**Never commit these to GitHub!** They should only be set in Netlify's dashboard.

### Custom Domain (Optional)
1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow the DNS configuration instructions

### Continuous Deployment
- Netlify automatically deploys when you push to your main branch
- You can also set up branch previews for pull requests

## Troubleshooting

### Build Fails
- Check the build logs in Netlify dashboard
- Make sure all dependencies are in `package.json`
- Verify Node.js version (Netlify uses Node 18 by default)

### Environment Variables Not Working
- Make sure variable names start with `VITE_` (required for Vite)
- Redeploy after adding/changing environment variables
- Check the build logs to see if variables are being read

### Routes Not Working (404 errors)
- The `netlify.toml` file includes redirect rules for SPA routing
- If you still get 404s, check that the redirect rule is correct

### Supabase Connection Issues
- Verify your Supabase URL and key are correct
- Check Supabase dashboard for any service issues
- Make sure RLS policies allow public reads (if needed)

## Post-Deployment Checklist

- [ ] Test user registration
- [ ] Test user login
- [ ] Test product browsing
- [ ] Test adding products to cart
- [ ] Test checkout process
- [ ] Test admin panel (if applicable)
- [ ] Verify all images load correctly
- [ ] Test on mobile devices

## Performance Tips

1. **Enable Netlify's CDN** - Already enabled by default
2. **Image Optimization** - Consider using Netlify Image Optimization
3. **Build Optimization** - The build process already optimizes assets
4. **Caching** - Headers are configured in `netlify.toml`

## Support

If you encounter issues:
1. Check Netlify build logs
2. Check browser console for errors
3. Verify Supabase connection
4. Review this deployment guide
