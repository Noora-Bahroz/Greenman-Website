const fs = require('fs');

// Updated image mapping with actual filenames from CLAMPS folder
const imageMapping = {
    'GreenGrip Isophonic Pipe Clamp GGIP': 'assets/CLAMPS/Copy of 3g rubber lined.png',
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
    'GreenGrip Chillguard Clamp (L) - GGCGL': 'assets/CLAMPS/GreenGrip Chillguard Clamp (L) - GGCGL.png',
    'GreenGrip Duct Hanger - GGDL': 'assets/CLAMPS/GreenGrip Duct Hanger - GGDL.png',
    'GreenGrip Duct Hanger Unlined - GGDU': 'assets/CLAMPS/GreenGrip Duct Hanger Unlined- GGDU.png',
    'GreenGrip DuctLoop DualMount - GGDM': 'assets/CLAMPS/GreenGrip DuctLoop DualMount- GGDM.png',
    'GreenGrip DuctLoop DualMount Unlined - GGMU': 'assets/CLAMPS/GreenGrip DuctLoop DualMount Unlined- GGMU.png',
    'Greengrip WisMount Hanger - GGWM': 'assets/CLAMPS/Greengrip WisMount Hanger - GGWM.png',
    'Greengrip IsoLink Duct Bracket - GGID': 'assets/CLAMPS/Greengrip IsoLink Duct Bracket -GGID.png',
    'GreenGrip SlimMount': 'assets/CLAMPS/GreenGrip SlimMount.png',
    'GreenGrip Pro-Stop Chain Brake Band': 'assets/CLAMPS/GreenGrip Pro-Stop Chain Brake Band.png',
    'Greengrip Hanger-Flex': 'assets/CLAMPS/Copy of 3g rubber lined.png',
    'GreenGrip Clevis Hanger': 'assets/CLAMPS/GreenGrip Clevis Hanger.png',
    'GreenGrip Sprinkler Pipe Hanger GGSH': 'assets/CLAMPS/GGSH.png',
    'GreenGrip Sprinkler Hanger (Nut-Free)': 'assets/CLAMPS/Nut-Free.png',
    'GreenGrip Swift Clamp GGQC': 'assets/CLAMPS/GreenGrip Swift Clamp GGQC.png',
    'GreenGrip Swift Clamp - without lining GGQC': 'assets/CLAMPS/GreenGrip Swift Clamp - without linning GGQC.png'
};

console.log('=== Updating GGIP Catalog ===\n');

// Read GGIP catalog
const ggipPath = 'data/greengrip-ggip-catalog.json';
const ggipText = fs.readFileSync(ggipPath, 'utf8');
let updatedText = ggipText;

// Replace all old image paths with new ones
Object.entries(imageMapping).forEach(([productName, newImagePath]) => {
    // Match patterns like: "image": "assets/CLAMPS/Copy of 74.png"
    const oldPatterns = [
        /("image":\s*"assets\/CLAMPS\/Copy of \d+\.png")/g,
        new RegExp(`("image":\\s*"[^"]*"(?=.*"productName":\\s*"${productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"))`,'g')
    ];
    
    // Find and log what we're updating
    const productRegex = new RegExp(`"productName":\\s*"${productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`, 'g');
    if (productRegex.test(updatedText)) {
        console.log(`Found: ${productName}`);
        console.log(`  → ${newImagePath}`);
    }
});

// Do a more direct replacement approach
let lines = updatedText.split('\n');
let currentProductName = null;

for (let i = 0; i < lines.length; i++) {
    // Check if this line contains a productName
    const prodMatch = lines[i].match(/"productName":\s*"([^"]+)"/);
    if (prodMatch) {
        currentProductName = prodMatch[1];
    }
    
    // Check if this line contains an image path and we have a current product
    if (currentProductName && lines[i].includes('"image":')) {
        const newPath = imageMapping[currentProductName];
        if (newPath) {
            // Replace the image path
            lines[i] = lines[i].replace(/"image":\s*"[^"]*"/, `"image": "${newPath}"`);
            console.log(`✓ Updated ${currentProductName}`);
        }
    }
}

fs.writeFileSync(ggipPath, lines.join('\n'), 'utf8');
console.log(`\n✅ Updated ${ggipPath}`);

console.log('\n=== Updating GGSH Catalog ===\n');

// Read and update GGSH catalog
const ggshPath = 'data/greengrip-ggsh-catalog.json';
let ggshData = JSON.parse(fs.readFileSync(ggshPath, 'utf8'));

['GGSH', 'GGSN', 'GGQC', 'GGQC_NO_LINING'].forEach(key => {
    if (ggshData[key] && ggshData[key].productName) {
        const productName = ggshData[key].productName;
        const imagePath = imageMapping[productName];
        
        if (imagePath) {
            if (!ggshData[key].images) {
                ggshData[key].images = {};
            }
            ggshData[key].images.mainImage = imagePath;
            console.log(`✓ Updated ${key}: ${productName}`);
            console.log(`  → ${imagePath}`);
        }
    }
});

fs.writeFileSync(ggshPath, JSON.stringify(ggshData, null, 2), 'utf8');
console.log(`\n✅ Updated ${ggshPath}`);

console.log('\n🎉 All image paths corrected!');
