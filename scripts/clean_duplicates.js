const fs = require('fs');
const path = require('path');

// Read the JSON file
const jsonPath = path.join(__dirname, 'data', 'greengrip-ggip-catalog.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log('Before cleanup: Total GGIP products:', data.products.length);

// Remove duplicates - keep only unique products based on productCode
const seen = new Set();
const uniqueProducts = [];

data.products.forEach((product, index) => {
    if (!seen.has(product.productCode)) {
        seen.add(product.productCode);
        uniqueProducts.push(product);
        console.log(`Keeping: ${product.productCode} (index ${index})`);
    } else {
        console.log(`Removing duplicate: ${product.productCode} (index ${index})`);
    }
});

data.products = uniqueProducts;

console.log('\nAfter cleanup: Total GGIP products:', data.products.length);

// Write the cleaned JSON back
fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
console.log('\nJSON file cleaned successfully!');
console.log('\nFinal product list:');
data.products.forEach((p, i) => {
    console.log(`${i+1}. ${p.productCode} - Range: ${p.clampingRange?.mm}`);
});
