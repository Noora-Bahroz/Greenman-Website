// Script to fix GGTC Tri-Lock clamping range from DN/inch to DN/Ømm
const fs = require('fs');

// Read the JSON file
const data = JSON.parse(fs.readFileSync('data/greengrip-ggip-catalog.json', 'utf8'));

// Update GGTC Tri-Lock products
// Simply rename "inch" field to "Ømm" since the values appear to be correct
if (data.ggtcTriLock && data.ggtcTriLock.products) {
    data.ggtcTriLock.products.forEach(product => {
        if (product.clampingRange && product.clampingRange.inch) {
            // Rename inch to Ømm (keeping the same value)
            product.clampingRange['Ømm'] = product.clampingRange.inch;
            delete product.clampingRange.inch;
        }
    });
    console.log(`Updated ${data.ggtcTriLock.products.length} products`);
}

// Write back to file
fs.writeFileSync('data/greengrip-ggip-catalog.json', JSON.stringify(data, null, 2), 'utf8');
console.log('GGTC Tri-Lock clamping range field renamed from "inch" to "Ømm" successfully!');

