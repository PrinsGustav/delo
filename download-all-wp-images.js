import fs from 'fs';
import path from 'path';

const targetDir = './src/assets/blog/wp-originals/';

// Create directory if it doesn't exist
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

async function downloadImage(url, filename) {
  try {
    console.log(`Downloading ${filename}...`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    const targetPath = path.join(targetDir, filename);
    
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    console.log(`✅ Downloaded: ${filename}`);
  } catch (error) {
    console.error(`❌ Error downloading ${filename}:`, error.message);
  }
}

async function fetchAndDownloadImages() {
  try {
    console.log('Fetching WordPress media...');
    const response = await fetch('https://delo.no/wp-json/wp/v2/media?per_page=100');
    const images = await response.json();
    
    console.log(`Found ${images.length} images. Starting download...`);
    
    for (const image of images) {
      const filename = path.basename(image.source_url);
      await downloadImage(image.source_url, filename);
      
      // Small delay to be nice to the server
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('All images downloaded!');
  } catch (error) {
    console.error('Error:', error);
  }
}

fetchAndDownloadImages();