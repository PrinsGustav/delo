import fs from 'fs';
import path from 'path';
import TurndownService from 'turndown';

const turndownService = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});

// Custom rule to handle WordPress images
turndownService.addRule('wordpressImage', {
  filter: 'img',
  replacement: function(content, node) {
    const src = node.getAttribute('src');
    if (src && src.includes('delo.no/wp-content/uploads')) {
      // Extract filename from WordPress URL
      const filename = src.split('/').pop();
      // Convert to relative path pointing to wp-originals folder
      return `\n\n![](../../assets/blog/wp-originals/${filename})\n\n`;
    }
    return '';
  }
});

// Custom rule to handle WordPress figures
turndownService.addRule('wordpressFigure', {
  filter: 'figure',
  replacement: function(content, node) {
    const img = node.querySelector('img');
    if (img) {
      const src = img.getAttribute('src');
      if (src && src.includes('delo.no/wp-content/uploads')) {
        const filename = src.split('/').pop();
        return `\n\n![](../../assets/blog/wp-originals/${filename})\n\n`;
      }
    }
    return content;
  }
});

async function updatePostWithImages(slug) {
  try {
    console.log(`Processing ${slug}...`);
    
    // Fetch WordPress post
    const response = await fetch(`https://delo.no/wp-json/wp/v2/posts?slug=${slug}&_embed`);
    const posts = await response.json();
    
    if (posts.length === 0) {
      console.log(`❌ No post found for slug: ${slug}`);
      return;
    }
    
    const post = posts[0];
    const filePath = path.join('./src/content/blog/', slug + '.md');
    
    if (!fs.existsSync(filePath)) {
      console.log(`❌ Markdown file not found: ${filePath}`);
      return;
    }
    
    // Read existing markdown
    const existingContent = fs.readFileSync(filePath, 'utf8');
    
    // Extract frontmatter
    const frontmatterMatch = existingContent.match(/^---([\s\S]*?)---/);
    if (!frontmatterMatch) {
      console.log(`❌ No frontmatter found in ${slug}.md`);
      return;
    }
    
    const frontmatter = frontmatterMatch[0];
    
    // Convert WordPress content to markdown with images
    const markdownContent = turndownService.turndown(post.content.rendered);
    
    // Combine frontmatter with new content
    const newContent = frontmatter + '\n\n' + markdownContent;
    
    // Write updated file
    fs.writeFileSync(filePath, newContent);
    console.log(`✅ Updated: ${slug}.md`);
    
  } catch (error) {
    console.error(`❌ Error processing ${slug}:`, error.message);
  }
}

async function main() {
  console.log('Re-converting posts with images...');
  
  // List of posts to update (start with a few test ones)
  const posts = [
    'drommer-du-om-tid',
    'slik-finner-du-det-beste-og-rimeligste-mobilabonnementet',
    'slik-handterer-du-okonomien-ved-et-samlivsbrudd',
    'hvorfor-fondsinvestering-kan-vaere-et-smart-valg-for-deg',
    'vaer-forberedt-slik-lager-du-en-plan-for-okonomiske-kriser'
  ];
  
  for (const slug of posts) {
    await updatePostWithImages(slug);
    await new Promise(resolve => setTimeout(resolve, 200)); // Be nice to the server
  }
  
  console.log('Done!');
}

main();