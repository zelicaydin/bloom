/**
 * Upload videos to Cloudinary (Free CDN)
 * 
 * This script helps you upload videos to Cloudinary, which has a free tier
 * that can handle large video files. After uploading, you'll get public URLs
 * that work perfectly on Netlify.
 * 
 * Usage: 
 * 1. Sign up for free at https://cloudinary.com (free tier includes 25GB storage)
 * 2. Get your Cloud Name, API Key, and API Secret from the dashboard
 * 3. Set them in .env file:
 *    CLOUDINARY_CLOUD_NAME=your-cloud-name
 *    CLOUDINARY_API_KEY=your-api-key
 *    CLOUDINARY_API_SECRET=your-api-secret
 * 4. Run: npm run upload-videos-cloudinary
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (!cloudName || !apiKey || !apiSecret) {
  console.error('❌ Missing Cloudinary credentials!');
  console.error('\n📋 Setup instructions:');
  console.error('1. Sign up for free at https://cloudinary.com');
  console.error('2. Go to Dashboard → Settings → Product Environment Credentials');
  console.error('3. Add these to your .env file:');
  console.error('   CLOUDINARY_CLOUD_NAME=your-cloud-name');
  console.error('   CLOUDINARY_API_KEY=your-api-key');
  console.error('   CLOUDINARY_API_SECRET=your-api-secret');
  console.error('\n💡 Cloudinary free tier includes:');
  console.error('   - 25GB storage');
  console.error('   - 25GB monthly bandwidth');
  console.error('   - Video transformation');
  process.exit(1);
}

async function uploadToCloudinary(filePath, fileName, folder = 'bloom-videos') {
  try {
    console.log(`📤 Uploading ${fileName} to Cloudinary...`);
    
    // Read file as base64
    const fileBuffer = readFileSync(filePath);
    const base64File = fileBuffer.toString('base64');
    const dataUri = `data:video/mp4;base64,${base64File}`;
    
    // Create form data
    const formData = new FormData();
    formData.append('file', dataUri);
    formData.append('upload_preset', 'ml_default'); // You may need to create this in Cloudinary
    formData.append('folder', folder);
    formData.append('resource_type', 'video');
    formData.append('public_id', fileName.replace('.mp4', ''));
    
    // Upload using fetch
    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`;
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }
    
    const result = await response.json();
    const videoUrl = result.secure_url;
    
    console.log(`✅ ${fileName} uploaded successfully!`);
    console.log(`🔗 URL: ${videoUrl}\n`);
    
    return videoUrl;
  } catch (error) {
    console.error(`❌ Error uploading ${fileName}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🚀 Uploading videos to Cloudinary...\n');
  console.log('💡 Make sure you have:');
  console.log('   1. Created a Cloudinary account (free)');
  console.log('   2. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env\n');
  
  const videosDir = join(__dirname, '..', 'public');
  const heroPath = join(videosDir, 'hero.mp4');
  const forestPath = join(videosDir, 'forest.mp4');
  
  const heroUrl = await uploadToCloudinary(heroPath, 'hero.mp4');
  const forestUrl = await uploadToCloudinary(forestPath, 'forest.mp4');
  
  if (heroUrl && forestUrl) {
    console.log('✨ Upload complete!\n');
    console.log('📋 Next steps:');
    console.log('1. Update src/pages/Home/Hero.jsx:');
    console.log(`   src="${heroUrl}"`);
    console.log('\n2. Update src/pages/Home/Tagline.jsx:');
    console.log(`   <source src="${forestUrl}" type="video/mp4" />`);
    console.log('\n3. Commit and push - videos will work on Netlify!');
  } else {
    console.log('\n❌ Some uploads failed. Please check the errors above.');
    process.exit(1);
  }
}

main().catch(console.error);
