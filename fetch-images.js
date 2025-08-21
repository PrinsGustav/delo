import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to fetch media from WordPress REST API
async function fetchWordPressMedia() {
    let allMedia = [];
    let page = 1;
    let hasMoreMedia = true;
    
    while (hasMoreMedia && page <= 5) { // Limit to first 5 pages to avoid too many requests
        const media = await fetchMediaPage(page);
        if (!media || media.length === 0) {
            hasMoreMedia = false;
        } else {
            allMedia = allMedia.concat(media);
            console.log(`Fetched page ${page}: ${media.length} media files (Total: ${allMedia.length})`);
            page++;
        }
    }
    
    return allMedia;
}

// Function to fetch a single page of media
async function fetchMediaPage(page) {
    return new Promise((resolve, reject) => {
        https.get(`https://delo.no/wp-json/wp/v2/media?per_page=100&page=${page}`, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const media = JSON.parse(data);
                    resolve(media);
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Function to download image from URL
async function downloadImage(url, filename) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filename);
        
        https.get(url, (response) => {
            if (response.statusCode !== 200) {
                reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
                return;
            }
            
            response.pipe(file);
            
            file.on('finish', () => {
                file.close();
                resolve(filename);
            });
            
            file.on('error', (err) => {
                fs.unlink(filename, () => {}); // Clean up partial download
                reject(err);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Function to get safe filename
function getSafeFilename(url, title) {
    const urlParts = new URL(url);
    const originalName = path.basename(urlParts.pathname);
    const extension = path.extname(originalName);
    
    // Create safe filename from title if available
    if (title && title !== originalName) {
        const safeTitle = title
            .toLowerCase()
            .replace(/[æ]/g, 'ae')
            .replace(/[ø]/g, 'o')
            .replace(/[å]/g, 'a')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-');
        
        return safeTitle.substring(0, 50) + extension;
    }
    
    return originalName;
}

// Main function to fetch and download WordPress images
async function fetchWordPressImages() {
    try {
        console.log('Fetching media from WordPress REST API...');
        const mediaFiles = await fetchWordPressMedia();
        
        console.log(`Found ${mediaFiles.length} media files`);
        
        // Create assets directory if it doesn't exist
        const assetsDir = path.join(__dirname, 'src', 'assets', 'blog');
        if (!fs.existsSync(assetsDir)) {
            fs.mkdirSync(assetsDir, { recursive: true });
        }
        
        let downloaded = 0;
        let failed = 0;
        
        // Download each image
        for (const media of mediaFiles.slice(0, 50)) { // Limit to first 50 images for now
            try {
                const imageUrl = media.source_url;
                const title = media.title.rendered || media.slug;
                const filename = getSafeFilename(imageUrl, title);
                const filepath = path.join(assetsDir, filename);
                
                // Skip if file already exists
                if (fs.existsSync(filepath)) {
                    console.log(`⏭️  Skipped: ${filename} (already exists)`);
                    continue;
                }
                
                await downloadImage(imageUrl, filepath);
                console.log(`✅ Downloaded: ${filename}`);
                downloaded++;
                
                // Add small delay to be respectful to the server
                await new Promise(resolve => setTimeout(resolve, 100));
                
            } catch (error) {
                console.log(`❌ Failed to download ${media.source_url}: ${error.message}`);
                failed++;
            }
        }
        
        console.log(`\n🎉 Download complete!`);
        console.log(`✅ Successfully downloaded: ${downloaded} images`);
        console.log(`❌ Failed downloads: ${failed}`);
        console.log(`📁 Images saved to: src/assets/blog/`);
        
    } catch (error) {
        console.error('Error fetching WordPress images:', error);
    }
}

// Run the image fetching
fetchWordPressImages();