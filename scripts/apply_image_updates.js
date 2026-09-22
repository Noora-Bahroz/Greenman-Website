const fs = require('fs');

// Image mapping
const imageMapping = {
    'GreenGrip Isophonic Pipe Clamp GGIP': 'assets/CLAMPS/Copy of 69.png',
    'GreenGrip Coloured Isophonic Pipe Clamp GGCP': 'assets/CLAMPS/GGCP.png',
    'GreenGrip High-Temperature Isophonic Pipe Clamp GGHT': 'assets/CLAMPS/GGHT.png',
    'GreenGrip Unlined Isophonic Pipe Clamp GGUC': 'assets/CLAMPS/GGUC.png',
    'GreenGrip Isophonic U-Bracket PIPE CLAMP GGUP': 'assets/CLAMPS/GGUP.png',
    'Greengrip Heavy Duty Rubber Line Clamp - GGTC': 'assets/CLAMPS/GGTC.png',
    'GreenGrip Titan Isophonic Pipe Clamp GGTC': 'assets/CLAMPS/GreenGrip Titan Isophonic Pipe Clamp GGTC.png',
    'GreenGrip Tri-Lock PIPE CLAMPS GGTC': 'assets/CLAMPS/GreenGrip Twin Bolt Pipe Clamp.png',
    'GreenGrip Tri-Lock PIPE CLAMP - without lining GGTS': 'assets/CLAMPS/GreenGrip Twin Bolt Pipe Clamp.png',
    'GreenGrip Hanging Adapter Clamp GGHAC': 'assets/CLAMPS/GreenGrip Hanging Adapter Clamp GGHAC.png',
    'GreenGrip Hanging Adapter Clamp without lining GGHAS': 'assets/CLAMPS/GreenGrip Hanging Adapter Clamp GGHAC.png',
    'GreenGrip RiserRest Clamp GGRR': 'assets/CLAMPS/GreenGrip RiserRest Clamp GGRR.png',
    'GreenGrip StrutMount Saddle Clamp GGSM': 'assets/CLAMPS/GreenGrip StrutMount Saddle Clamp GGSM.png',
    'GreenGrip Strut Mount U-Clamp GGSMU': 'assets/CLAMPS/GreenGrip Strut Mount U-Clamp GGSMU.png',
    'GreenGrip U-Bolt GGUB': 'assets/CLAMPS/GGUP (2).png',
    'GreenGrip Rubber Insert': 'assets/CLAMPS/GreenGrip Rubber Insert.png',
    'GreenGrip PU Insert': 'assets/CLAMPS/GreenGrip PU Insert.png',
    'GreenGrip ChillGuard Clamp (S) - GGCGS': 'assets/CLAMPS/GreenGrip ChillGuard Clamp (S) - GGCGS.png',
    'GreenGrip Chillguard Clamp (L) - GGCGL': 'assets/CLAMPS/GreenGrip ChillGuard Clamp (S) - GGCGS.png',
    'GreenGrip Duct Hanger - GGDL': 'assets/CLAMPS/Copy of 74.png',
    'GreenGrip Duct Hanger Unlined - GGDU': 'assets/CLAMPS/Copy of 75.png',
    'GreenGrip DuctLoop DualMount - GGDM': 'assets/CLAMPS/Copy of 76.png',
    'GreenGrip DuctLoop DualMount Unlined - GGMU': 'assets/CLAMPS/Copy of 77.png',
    'Greengrip WisMount Hanger - GGWM': 'assets/CLAMPS/Copy of 78.png',
    'Greengrip IsoLink Duct Bracket - GGID': 'assets/CLAMPS/Copy of 79.png',
    'GreenGrip SlimMount': 'assets/CLAMPS/Copy of 80.png',
    'GreenGrip Pro-Stop Chain Brake Band': 'assets/CLAMPS/Copy of 81.png',
    'Greengrip Hanger-Flex': 'assets/CLAMPS/Copy of 82.png',
    'GreenGrip Clevis Hanger': 'assets/CLAMPS/GreenGrip Clevis Hanger.png',
    'GreenGrip Sprinkler Pipe Hanger GGSH': 'assets/CLAMPS/GGSH.png',
    'GreenGrip Sprinkler Hanger (Nut-Free)': 'assets/CLAMPS/Nut-Free.png',
    'GreenGrip Swift Clamp GGQC': 'assets/CLAMPS/GreenGrip Swift Clamp GGQC.png',
    'GreenGrip Swift Clamp - without lining GGQC': 'assets/CLAMPS/GreenGrip Swift Clamp - without linning GGQC.png'
};

// Read GGIP catalog
const ggipPath = 'data/greengrip-ggip-catalog.json';
let ggipData = JSON.parse(fs.readFileSync(ggipPath, 'utf8'));

// Process GGIP catalog - it's a single object with productName at root
if (ggipData.productName && imageMapping[ggipData.productName]) {
    ggipData.image = imageMapping[ggipData.productName];
    console.log(`✓ Updated: ${ggipData.productName}`);
}

// Check if there are nested products (seems to be array-like structure based on the grep)
// Let me read the file structure
const ggipText = fs.readFileSync(ggipPath, 'utf8');
const ggipLines = ggipText.split('\n');

// Find all sections with productName
let currentIndent = 0;
let inSection = null;
let updates = [];

for (let i = 0; i < ggipLines.length; i++) {
    const line = ggipLines[i];
    const prodNameMatch = line.match(/"productName":\s*"([^"]+)"/);
    
    if (prodNameMatch) {
        const productName = prodNameMatch[1];
        const imagePath = imageMapping[productName];
        
        if (imagePath) {
            console.log(`Found: ${productName} -> ${imagePath}`);
            
            // Find where to insert the image property
            // Look for the line after productName
            let insertLine = i + 1;
            
            // Check if image property already exists in next few lines
            let hasImage = false;
            for (let j = i + 1; j < Math.min(i + 10, ggipLines.length); j++) {
                if (ggipLines[j].includes('"image":')) {
                    hasImage = true;
                    // Update existing
                    ggipLines[j] = ggipLines[j].replace(/"image":\s*"[^"]*"/, `"image": "${imagePath}"`);
                    console.log(`  ✓ Updated existing image property`);
                    break;
                }
                // Stop if we hit another productName or closing brace at same/lower indent
                if (ggipLines[j].includes('"productName":') || ggipLines[j].trim() === '},') {
                    break;
                }
            }
            
            if (!hasImage) {
                // Insert new image property after productName line
                const indent = line.match(/^\s*/)[0];
                ggipLines.splice(insertLine, 0, `${indent}"image": "${imagePath}",`);
                console.log(`  ✓ Added new image property`);
                i++; // Adjust index since we inserted a line
            }
        }
    }
}

// Write back the updated GGIP file
fs.writeFileSync(ggipPath, ggipLines.join('\n'), 'utf8');
console.log(`\n✅ Updated ${ggipPath}`);

// Read and update GGSH catalog
const ggshPath = 'data/greengrip-ggsh-catalog.json';
let ggshData = JSON.parse(fs.readFileSync(ggshPath, 'utf8'));

// Update GGSH products
['GGSH', 'GGSN', 'GGQC', 'GGQC_NO_LINING'].forEach(key => {
    if (ggshData[key] && ggshData[key].productName) {
        const productName = ggshData[key].productName;
        const imagePath = imageMapping[productName];
        
        if (imagePath) {
            // Check if images object exists
            if (!ggshData[key].images) {
                ggshData[key].images = {};
            }
            ggshData[key].images.mainImage = imagePath;
            console.log(`✓ Updated ${key}: ${productName}`);
        }
    }
});

// Write back the updated GGSH file
fs.writeFileSync(ggshPath, JSON.stringify(ggshData, null, 2), 'utf8');
console.log(`\n✅ Updated ${ggshPath}`);

console.log('\n🎉 All image paths have been updated!');
