const fs = require('fs');
const path = require('path');

// Read the catalog file
const catalogPath = path.join(__dirname, 'data', 'strut-channel-catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

console.log('Updating strut channel product images...\n');

let updatedCount = 0;

// Update each product's images
catalog.category.products.forEach(product => {
  const productId = product.properties.identification;
  
  if (productId) {
    // Check if 3D model exists (lowercase extension)
    const model3DPath = `assets/GM-STRUT/3D MODELS/${productId}.png`;
    
    // Check if cross section exists (uppercase extension)
    const crossSectionPath = `assets/GM-STRUT/CROSS SECTION/${productId}.PNG`;
    
    // Design diagram (same for all)
    const designDiagramPath = `assets/GM-STRUT/GM41design diagram same for all.PNG`;
    
    // Update the images array
    product.images = [
      model3DPath,
      crossSectionPath,
      designDiagramPath
    ];
    
    updatedCount++;
    console.log(`✅ ${productId}: Updated image paths`);
  }
});

// Write the updated catalog back to file
fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf8');

console.log(`\n✅ Successfully updated ${updatedCount} products with correct image paths!`);
