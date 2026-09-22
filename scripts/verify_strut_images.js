// Verify and normalize image paths for strut products
const fs = require('fs');
const path = require('path');

const catalogPath = path.join(__dirname, 'data', 'strut-channel-catalog.json');
const data = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

console.log('Checking image file existence...\n');

let missingCount = 0;
let totalChecked = 0;

data.category.products.forEach(product => {
  if (product.images) {
    product.images.forEach((imagePath, index) => {
      totalChecked++;
      const fullPath = path.join(__dirname, imagePath);
      
      if (!fs.existsSync(fullPath)) {
        console.log(`❌ Missing: ${product.id} - Image ${index + 1}: ${imagePath}`);
        
        // Try alternate case
        const alternatePath = imagePath.replace(/\.png$/i, match => 
          match === '.png' ? '.PNG' : '.png'
        );
        const alternateFullPath = path.join(__dirname, alternatePath);
        
        if (fs.existsSync(alternateFullPath)) {
          console.log(`  ✓ Found with alternate case: ${alternatePath}`);
          product.images[index] = alternatePath;
        } else {
          missingCount++;
        }
      }
    });
  }
});

// Write back if any changes were made
fs.writeFileSync(catalogPath, JSON.stringify(data, null, 2), 'utf8');

console.log(`\n📊 Summary:`);
console.log(`Total images checked: ${totalChecked}`);
console.log(`Missing images: ${missingCount}`);
console.log(`Images fixed: ${totalChecked - missingCount - (totalChecked - missingCount)}`);
