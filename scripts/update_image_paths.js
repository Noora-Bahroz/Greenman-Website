const fs = require('fs');
const path = require('path');

// Read the CLAMPS folder images
const clampsFolder = 'C:/Users/ghani/Desktop/temp/New folder/en_EN/assets/CLAMPS';
const imageFiles = fs.readdirSync(clampsFolder);

console.log('Images in CLAMPS folder:');
imageFiles.forEach(img => console.log('  -', img));

// Read GGIP catalog
const ggipPath = 'C:/Users/ghani/Desktop/temp/New folder/en_EN/data/greengrip-ggip-catalog.json';
const ggipData = JSON.parse(fs.readFileSync(ggipPath, 'utf8'));

// Read GGSH catalog
const ggshPath = 'C:/Users/ghani/Desktop/temp/New folder/en_EN/data/greengrip-ggsh-catalog.json';
const ggshData = JSON.parse(fs.readFileSync(ggshPath, 'utf8'));

console.log('\n=== GGIP Products ===');
if (Array.isArray(ggipData)) {
    ggipData.forEach(product => {
        if (product.productName) {
            console.log(product.productName);
        }
    });
} else if (ggipData.productName) {
    console.log(ggipData.productName);
}

console.log('\n=== GGSH Products ===');
if (ggshData.GGSH) {
    console.log(ggshData.GGSH.productName);
}
if (ggshData.GGSN) {
    console.log(ggshData.GGSN.productName);
}
if (ggshData.GGQC) {
    console.log(ggshData.GGQC.productName);
}
if (ggshData.GGQC_NO_LINING) {
    console.log(ggshData.GGQC_NO_LINING.productName);
}

// Helper function to find matching image
function findMatchingImage(productName, imageFiles) {
    // Direct name match
    for (let img of imageFiles) {
        const imgName = img.replace(/\.(png|jpg|jpeg)$/i, '').toLowerCase();
        const prodName = productName.toLowerCase();
        
        if (imgName === prodName || prodName.includes(imgName) || imgName.includes(prodName)) {
            return img;
        }
    }
    
    // Extract product code (like GGIP, GGCP, GGHT, etc.)
    const codeMatch = productName.match(/\b(GG[A-Z]+)\b/);
    if (codeMatch) {
        const code = codeMatch[1];
        for (let img of imageFiles) {
            if (img.toLowerCase().includes(code.toLowerCase())) {
                return img;
            }
        }
    }
    
    return null;
}

console.log('\n=== Matching Images ===');
// Match GGIP products
if (Array.isArray(ggipData)) {
    ggipData.forEach(product => {
        if (product.productName) {
            const match = findMatchingImage(product.productName, imageFiles);
            console.log(`${product.productName} -> ${match || 'NO MATCH'}`);
        }
    });
} else if (ggipData.productName) {
    const match = findMatchingImage(ggipData.productName, imageFiles);
    console.log(`${ggipData.productName} -> ${match || 'NO MATCH'}`);
}

// Match GGSH products
console.log('\n=== GGSH Matches ===');
['GGSH', 'GGSN', 'GGQC', 'GGQC_NO_LINING'].forEach(key => {
    if (ggshData[key] && ggshData[key].productName) {
        const match = findMatchingImage(ggshData[key].productName, imageFiles);
        console.log(`${ggshData[key].productName} -> ${match || 'NO MATCH'}`);
    }
});
