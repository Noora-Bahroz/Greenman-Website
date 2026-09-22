// Fix C-channel image paths to use actual cross-section images
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'c-channel-catalog.json');

// Read the JSON file
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

let fixedCount = 0;

// Fix each product's images array
data.category.products.forEach(product => {
  if (product.properties && product.properties.identification) {
    const identification = product.properties.identification;
    
    // Set the correct image paths
    product.images = [
      `assets/GMC-Channels/c-channels/3d-models/${identification}.png`,
      `assets/GMC-Channels/c-channels/CROSS-SECTION/${identification}.PNG`,
      `assets/GMC-Channels/centroid xy axis.png`
    ];
    
    fixedCount++;
    console.log(`Fixed ${product.id}: Set images for ${identification}`);
  }
});

// Write back to file
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

console.log(`\n✓ Fixed ${fixedCount} C-channel products`);
console.log('Image order is now: [3D Model, Cross Section, Centroid Diagram]');
