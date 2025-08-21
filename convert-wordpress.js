import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to fetch all posts from WordPress REST API with pagination
async function fetchWordPressPosts() {
    let allPosts = [];
    let page = 1;
    let hasMorePosts = true;
    
    while (hasMorePosts) {
        const posts = await fetchPostsPage(page);
        if (!posts || posts.length === 0) {
            hasMorePosts = false;
        } else {
            allPosts = allPosts.concat(posts);
            console.log(`Fetched page ${page}: ${posts.length} posts (Total: ${allPosts.length})`);
            page++;
            // Safety check to prevent infinite loops
            if (page > 10) {
                console.log('Reached maximum page limit (10), stopping...');
                hasMorePosts = false;
            }
        }
    }
    
    return allPosts;
}

// Function to fetch a single page of posts
async function fetchPostsPage(page) {
    return new Promise((resolve, reject) => {
        https.get(`https://delo.no/wp-json/wp/v2/posts?per_page=100&page=${page}`, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const posts = JSON.parse(data);
                    resolve(posts);
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

// Function to clean HTML content and convert to markdown-like format
function cleanContent(html) {
    return html
        .replace(/<p>/g, '\n')
        .replace(/<\/p>/g, '\n')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<strong>/g, '**')
        .replace(/<\/strong>/g, '**')
        .replace(/<em>/g, '*')
        .replace(/<\/em>/g, '*')
        .replace(/<h2>/g, '\n## ')
        .replace(/<\/h2>/g, '\n')
        .replace(/<h3>/g, '\n### ')
        .replace(/<\/h3>/g, '\n')
        .replace(/<ul>/g, '\n')
        .replace(/<\/ul>/g, '\n')
        .replace(/<li>/g, '- ')
        .replace(/<\/li>/g, '\n')
        .replace(/<a href="([^"]*)"[^>]*>([^<]*)<\/a>/g, '[$2]($1)')
        .replace(/<[^>]*>/g, '') // Remove any remaining HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#8217;/g, "'")
        .replace(/&#8220;/g, '"')
        .replace(/&#8221;/g, '"')
        .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up multiple newlines
        .trim();
}

// Function to create slug from title
function createSlug(title) {
    return title
        .toLowerCase()
        .replace(/[æ]/g, 'ae')
        .replace(/[ø]/g, 'o')
        .replace(/[å]/g, 'a')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim('-');
}

// Function to convert WordPress post to Astro markdown
function convertToMarkdown(post) {
    const title = post.title.rendered;
    const content = cleanContent(post.content.rendered);
    const excerpt = post.excerpt.rendered ? cleanContent(post.excerpt.rendered) : '';
    const date = new Date(post.date).toISOString().split('T')[0];
    const slug = createSlug(title);
    
    const frontmatter = `---
title: "${title}"
description: "${excerpt}"
pubDate: "${date}"
heroImage: "../../assets/blog-placeholder-1.jpg"
---

${content}`;

    return {
        filename: `${slug}.md`,
        content: frontmatter
    };
}

// Main conversion function
async function convertWordPressToAstro() {
    try {
        console.log('Fetching posts from WordPress REST API...');
        const posts = await fetchWordPressPosts();
        
        console.log(`Found ${posts.length} posts to convert`);
        
        const blogDir = path.join(__dirname, 'src', 'content', 'blog');
        
        // Clear existing blog posts (except placeholder)
        const existingFiles = fs.readdirSync(blogDir);
        existingFiles.forEach(file => {
            if (file.endsWith('.md') || file.endsWith('.mdx')) {
                fs.unlinkSync(path.join(blogDir, file));
            }
        });
        
        // Convert and save each post
        posts.forEach((post, index) => {
            const markdown = convertToMarkdown(post);
            const filepath = path.join(blogDir, markdown.filename);
            
            fs.writeFileSync(filepath, markdown.content, 'utf8');
            console.log(`✓ Converted: ${markdown.filename}`);
        });
        
        console.log(`\n🎉 Successfully converted ${posts.length} WordPress posts to Astro markdown files!`);
        console.log('Files saved to: src/content/blog/');
        
    } catch (error) {
        console.error('Error converting WordPress posts:', error);
    }
}

// Run the conversion
convertWordPressToAstro();