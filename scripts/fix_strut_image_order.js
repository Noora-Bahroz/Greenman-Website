// Fix the image order in strut-channel-catalog.json
// Current: [3D Model, Design Diagram, Cross Section]
// Should be: [3D Model, Cross Section, Design Diagram]

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'strut-channel-catalog.json');

// Read the JSON file
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

let fixedCount = 0;

// Fix each product's images array
data.category.products.forEach(product => {
  if (product.images && product.images.length === 3) {
    const [img1, img2, img3] = product.images;
    
    // Check if img2 is the design diagram (same for all)
    if (img2.includes('GM41design diagram same for all')) {
      // Swap img2 and img3
      product.images = [img1, img3, img2];
      fixedCount++;
      console.log(`Fixed ${product.id}: Swapped design diagram to position 3`);
    }
  }
});

// Write back to file
fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

console.log(`\n✓ Fixed ${fixedCount} products`);
console.log('Image order is now: [3D Model, Cross Section, Design Diagram]');
