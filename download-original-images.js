import fs from 'fs';
import path from 'path';

// WordPress image URLs found from the original site
const imageUrls = [
  'https://delo.no/wp-content/uploads/2025/01/4-41.jpg',
  'https://delo.no/wp-content/uploads/2025/01/4-40.jpg',
  'https://delo.no/wp-content/uploads/2025/01/3-37.jpg',
  'https://delo.no/wp-content/uploads/2025/01/4-39.jpg',
  'https://delo.no/wp-content/uploads/2025/01/4-38.jpg',
  // Add more as we discover them
];

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

async function main() {
  console.log('Starting download of original WordPress images...');
  
  for (const url of imageUrls) {
    const filename = path.basename(url);
    await downloadImage(url, filename);
  }
  
  console.log('Download complete!');
}

main();