async function fetchPostWithImages() {
  try {
    // Get a specific post to see content structure
    const response = await fetch('https://delo.no/wp-json/wp/v2/posts?slug=drommer-du-om-tid&_embed');
    const posts = await response.json();
    
    if (posts.length > 0) {
      const post = posts[0];
      console.log('Title:', post.title.rendered);
      console.log('Content:', post.content.rendered);
      console.log('---');
      
      // Extract image URLs from content
      const imageRegex = /<img[^>]+src="([^"]+)"[^>]*>/g;
      const matches = [...post.content.rendered.matchAll(imageRegex)];
      
      console.log('Images found in content:');
      matches.forEach((match, index) => {
        console.log(`${index + 1}: ${match[1]}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

fetchPostWithImages();