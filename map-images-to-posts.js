async function mapImagesToPosts() {
  try {
    // Get all posts with featured media
    const response = await fetch('https://delo.no/wp-json/wp/v2/posts?per_page=100&_embed');
    const posts = await response.json();
    
    console.log('WordPress Post -> Image Mapping:');
    console.log('=====================================');
    
    posts.forEach(post => {
      const slug = post.slug;
      let featuredImageUrl = 'N/A';
      
      // Get featured image from _embedded data
      if (post._embedded && post._embedded['wp:featuredmedia']) {
        featuredImageUrl = post._embedded['wp:featuredmedia'][0]?.source_url || 'N/A';
      }
      
      console.log(`Slug: ${slug}`);
      console.log(`Title: ${post.title.rendered}`);
      console.log(`Image: ${featuredImageUrl}`);
      if (featuredImageUrl !== 'N/A') {
        const filename = featuredImageUrl.split('/').pop();
        console.log(`Filename: ${filename}`);
      }
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  }
}

mapImagesToPosts();