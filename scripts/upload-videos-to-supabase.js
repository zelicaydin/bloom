/**
 * Upload videos to Supabase Storage
 * 
 * This script uploads hero.mp4 and forest.mp4 to Supabase Storage
 * so they can be accessed via public URLs instead of being in the Git repo.
 * 
 * Usage: node scripts/upload-videos-to-supabase.js
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadVideo(filePath, fileName, bucketName = 'videos') {
  try {
    console.log(`📤 Uploading ${fileName}...`);
    
    // Read the video file
    const videoData = readFileSync(filePath);
    
    // Check if bucket exists, create if not
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return null;
    }
    
    const bucketExists = buckets.some(b => b.name === bucketName);
    if (!bucketExists) {
      console.log(`📦 Creating bucket "${bucketName}"...`);
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: 200 * 1024 * 1024, // 200MB limit
      });
      
      if (createError) {
        console.error('❌ Error creating bucket:', createError);
        return null;
      }
      console.log('✅ Bucket created');
    }
    
    // Upload the file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, videoData, {
        contentType: 'video/mp4',
        upsert: true, // Overwrite if exists
      });
    
    if (error) {
      console.error(`❌ Error uploading ${fileName}:`, error);
      return null;
    }
    
    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);
    
    console.log(`✅ ${fileName} uploaded successfully!`);
    console.log(`🔗 Public URL: ${urlData.publicUrl}`);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error(`❌ Error with ${fileName}:`, error);
    return null;
  }
}

async function main() {
  console.log('🚀 Starting video upload to Supabase Storage...\n');
  
  const videosDir = join(__dirname, '..', 'public');
  const heroPath = join(videosDir, 'hero.mp4');
  const forestPath = join(videosDir, 'forest.mp4');
  
  // Upload both videos
  const heroUrl = await uploadVideo(heroPath, 'hero.mp4');
  console.log('');
  const forestUrl = await uploadVideo(forestPath, 'forest.mp4');
  
  console.log('\n📋 Summary:');
  if (heroUrl) {
    console.log(`✅ Hero video: ${heroUrl}`);
  } else {
    console.log('❌ Hero video upload failed');
  }
  
  if (forestUrl) {
    console.log(`✅ Forest video: ${forestUrl}`);
  } else {
    console.log('❌ Forest video upload failed');
  }
  
  if (heroUrl && forestUrl) {
    console.log('\n✨ Next steps:');
    console.log('1. Update src/pages/Home/Hero.jsx to use:', heroUrl);
    console.log('2. Update src/pages/Home/Tagline.jsx to use:', forestUrl);
    console.log('3. Commit and push the changes');
    console.log('4. Netlify will automatically rebuild with the new video URLs');
  }
  
  process.exit(heroUrl && forestUrl ? 0 : 1);
}

main().catch(console.error);
