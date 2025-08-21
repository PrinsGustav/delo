import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to get random image from our downloaded images
function getRandomHeroImage() {
    const imagesDir = path.join(__dirname, 'src', 'assets', 'blog');
    
    if (!fs.existsSync(imagesDir)) {
        return '../../assets/blog-placeholder-1.jpg';
    }
    
    const imageFiles = fs.readdirSync(imagesDir)
        .filter(file => file.endsWith('.jpg') || file.endsWith('.png'))
        .filter(file => !file.includes('placeholder'));
    
    if (imageFiles.length === 0) {
        return '../../assets/blog-placeholder-1.jpg';
    }
    
    const randomIndex = Math.floor(Math.random() * imageFiles.length);
    const selectedImage = imageFiles[randomIndex];
    
    return `../../assets/blog/${selectedImage}`;
}

// Function to get appropriate image based on post content
function getAppropriateImage(title, content) {
    const titleLower = title.toLowerCase();
    const contentLower = content.toLowerCase();
    
    // Map keywords to specific images
    const imageKeywords = {
        'tidlig pensjon': 'textearlyretirementonofficedesktablewithkeyboardno.jpg',
        'pensjon': 'pagewithinscriptionfinancialindependenceretireearl.jpg',
        'mobile': 'smilingmaturebusinessmanholdingsmartphonesittingin.jpg',
        'mobilabonnement': 'happysmilingbusinessmanwearingcasualclothesandusin.jpg',
        'transport': 'businessmenandwalkingonstairsoutdoorforcommuteto.jpg',
        'scooter': 'amanonascooterisdrivingfastonthe.jpg',
        'budsjett': 'spreadsheetdocumentinformationfinancialstartupconc.jpg',
        'finansiell': 'showingbusinessandfinancialreportaccounting.jpg',
        'investering': 'mutualfundsbusinessstockprofitgrowthinvestmentmone.jpg',
        'aksjer': 'candlestickgraphchartofstockmarketinvestmenttradin.jpg',
        'fond': 'interestratesanddividendsinvestmentreturnsincomere.jpg',
        'kredittkort': 'happycaucasianmanbuyingthingsonlineusingsmartphone.jpg',
        'kreditt': 'personholdingasmartphonewithgoodcreditscoremeteron.jpg',
        'bolig': 'businesssuccessrealestateagentsandcustomersshakeha.jpg',
        'eiendom': 'hardworkingseniormanrealstateagentsigningoffsucces.jpg',
        'forsikring': 'businessplanningandhandsforaccountingpaperworkandp.jpg',
        'svindel': 'scamalertonsmartphoneconceptvirushackerinternetsec.jpg',
        'sikkerhet': 'warningsignontablewhilebusinesswomanworknetworksec.jpg',
        'sparing': 'piggybankandopennotepadwithinscriptionfinancialgoa.jpg',
        'student': 'onemanyoungadultmalestandatpublictransportbus.jpg',
        'kostnad': 'concernedafricanamericanbusinesswomanceoanalystsit.jpg'
    };
    
    // Check for keyword matches
    for (const [keyword, imageName] of Object.entries(imageKeywords)) {
        if (titleLower.includes(keyword) || contentLower.includes(keyword)) {
            return `../../assets/blog/${imageName}`;
        }
    }
    
    // If no specific match, return a random appropriate image
    return getRandomHeroImage();
}

// Function to update markdown files with hero images
function updateHeroImages() {
    const blogDir = path.join(__dirname, 'src', 'content', 'blog');
    const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'));
    
    console.log(`Updating hero images for ${files.length} blog posts...`);
    
    let updatedCount = 0;
    
    files.forEach(file => {
        const filePath = path.join(blogDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Extract title and content for image selection
        const titleMatch = content.match(/title: "([^"]*)"/);
        const title = titleMatch ? titleMatch[1] : '';
        
        // Get appropriate image
        const heroImage = getAppropriateImage(title, content);
        
        // Update hero image in frontmatter
        if (content.includes('heroImage: "../../assets/blog-placeholder-1.jpg"')) {
            content = content.replace(
                'heroImage: "../../assets/blog-placeholder-1.jpg"',
                `heroImage: "${heroImage}"`
            );
            
            fs.writeFileSync(filePath, content, 'utf8');
            updatedCount++;
            console.log(`✓ Updated ${file} with ${path.basename(heroImage)}`);
        }
    });
    
    console.log(`\n🎉 Updated ${updatedCount} blog posts with hero images!`);
}

// Function to also create placeholder images for missing ones
function createImageSymlinks() {
    const blogDir = path.join(__dirname, 'src', 'content', 'blog');
    const assetsDir = path.join(__dirname, 'src', 'assets');
    
    // Copy placeholder images to blog folder as backup
    const placeholders = [
        'blog-placeholder-1.jpg',
        'blog-placeholder-2.jpg', 
        'blog-placeholder-3.jpg',
        'blog-placeholder-4.jpg',
        'blog-placeholder-5.jpg'
    ];
    
    placeholders.forEach(placeholder => {
        const sourcePath = path.join(assetsDir, placeholder);
        const destPath = path.join(assetsDir, 'blog', placeholder);
        
        if (fs.existsSync(sourcePath) && !fs.existsSync(destPath)) {
            try {
                fs.copyFileSync(sourcePath, destPath);
                console.log(`✓ Copied ${placeholder} to blog folder`);
            } catch (error) {
                console.log(`⚠️  Could not copy ${placeholder}: ${error.message}`);
            }
        }
    });
}

// Run the updates
console.log('Starting hero image updates...');
createImageSymlinks();
updateHeroImages();