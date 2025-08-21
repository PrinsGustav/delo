async function fetchWordPressImages() {
  try {
    const response = await fetch('https://delo.no/wp-json/wp/v2/media?per_page=100');
    const images = await response.json();
    
    console.log('WordPress Images:');
    images.forEach(image => {
      console.log(`${image.id}: ${image.source_url}`);
      console.log(`Alt: ${image.alt_text || 'N/A'}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error fetching images:', error);
  }
}

fetchWordPressImages();