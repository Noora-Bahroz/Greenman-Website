const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, 'data', 'strut-channel-catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

let swappedCount = 0;

catalog.category.products.forEach(product => {
  if (product.images && product.images.length >= 3) {
    // Swap 2nd and 3rd image
    const temp = product.images[1];
    product.images[1] = product.images[2];
    product.images[2] = temp;
    swappedCount++;
  }
});

fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');
console.log(`✅ Swapped 2nd and 3rd images for ${swappedCount} products.`);
