import fs from 'fs';

const missingImages = [
  '2-1.png', '1-8.jpg', '1-7.jpg', '2-7.jpg', '2-5.jpg', '3-4.jpg', 
  '1-3.jpg', '2-2.jpg', '4-1.jpg', '4.jpg', '4-17.jpg', '1-18.jpg', 
  '1-16.jpg', '4-13.jpg', '2-12.jpg', '3-12.jpg', '1-11.jpg', '2-9.jpg'
];

const targetDir = './src/assets/blog/wp-originals/';

async function downloadImage(filename) {
  const url = `https://delo.no/wp-content/uploads/2025/01/${filename}`;
  const targetPath = targetDir + filename;
  
  // Skip if already exists
  if (fs.existsSync(targetPath)) {
    console.log(`⏭️ Already exists: ${filename}`);
    return;
  }
  
  try {
    console.log(`Downloading ${filename}...`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(targetPath, Buffer.from(buffer));
    console.log(`✅ Downloaded: ${filename}`);
  } catch (error) {
    console.error(`❌ Error downloading ${filename}:`, error.message);
  }
}

async function main() {
  console.log('Downloading missing images...');
  
  for (const image of missingImages) {
    await downloadImage(image);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('Done!');
}

main();