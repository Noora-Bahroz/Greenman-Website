const fs = require('fs');
const path = require('path');

// Read the JSON file
const jsonPath = path.join(__dirname, 'data', 'greengrip-ggip-catalog.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log('Before adding GGIP0160: Total GGIP products:', data.products.length);

// Find the index of GGIP0150
const idx = data.products.findIndex(p => p.productCode === 'GGIP0150');

if (idx >= 0) {
    // Create GGIP0160 product based on the pattern
    const ggip0160 = {
        "productCode": "GGIP0160",
        "clampingRange": {
            "mm": "159-166",
            "inch": "6"
        },
        "connectingThread": "M8/M10",
        "dimensions": {
            "PxS": "20x1.8",
            "W": "204",
            "H": "346",
            "C": "181",
            "T": "13"
        },
        "MStud": "M6x20",
        "packSize": "25",
        "maxRecLoad": "1800"
    };
    
    // Insert after GGIP0150
    data.products.splice(idx + 1, 0, ggip0160);
    
    console.log('Added GGIP0160 at index', idx + 1);
    console.log('After adding GGIP0160: Total GGIP products:', data.products.length);
    
    // Write the updated JSON back
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf8');
    console.log('\nJSON file updated successfully!');
    
    // Show products around GGIP0160
    console.log('\nProducts around GGIP0160:');
    for (let i = idx; i <= idx + 2 && i < data.products.length; i++) {
        console.log(`${i+1}. ${data.products[i].productCode} - Range: ${data.products[i].clampingRange?.mm}`);
    }
} else {
    console.log('GGIP0150 not found!');
}
