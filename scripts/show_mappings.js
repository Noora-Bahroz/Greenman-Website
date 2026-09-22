const fs = require('fs');
const path = require('path');

// Image files in CLAMPS folder
const imageFiles = [
    'Copy of 3g rubber lined.png',
    'Copy of 69-2.png',
    'Copy of 69.png',
    'Copy of 74.png',
    'Copy of 75.png',
    'Copy of 76.png',
    'Copy of 77.png',
    'Copy of 78.png',
    'Copy of 79.png',
    'Copy of 80.png',
    'Copy of 81.png',
    'Copy of 82.png',
    'GGCP.png',
    'GGHT.png',
    'GGSH.png',
    'GGTC.png',
    'GGUC.png',
    'GGUP (2).png',
    'GGUP.png',
    'GreenGrip ChillGuard Clamp (S) - GGCGS.png',
    'GreenGrip Clevis Hanger.png',
    'GreenGrip Hanging Adapter Clamp GGHAC.png',
    'GreenGrip PU Insert.png',
    'GreenGrip RiserRest Clamp GGRR.png',
    'GreenGrip Rubber Insert.png',
    'GreenGrip Strut Mount U-Clamp GGSMU.png',
    'GreenGrip StrutMount Saddle Clamp GGSM.png',
    'GreenGrip Swift Clamp - without linning GGQC.png',
    'GreenGrip Swift Clamp GGQC.png',
    'GreenGrip Titan Isophonic Pipe Clamp GGTC.png',
    'GreenGrip Twin Bolt Pipe Clamp.png',
    'Greenman Anti-Viberation Rubber Strip ( Type - II ).png',
    'Nut-Free.png'
];

// Manual mapping based on product names
const imageMapping = {
    // GGIP catalog products
    'GreenGrip Isophonic Pipe Clamp GGIP': 'Copy of 69.png',
    'GreenGrip Coloured Isophonic Pipe Clamp GGCP': 'GGCP.png',
    'GreenGrip High-Temperature Isophonic Pipe Clamp GGHT': 'GGHT.png',
    'GreenGrip Unlined Isophonic Pipe Clamp GGUC': 'GGUC.png',
    'GreenGrip Isophonic U-Bracket PIPE CLAMP GGUP': 'GGUP.png',
    'Greengrip Heavy Duty Rubber Line Clamp - GGTC': 'GGTC.png',
    'GreenGrip Titan Isophonic Pipe Clamp GGTC': 'GreenGrip Titan Isophonic Pipe Clamp GGTC.png',
    'GreenGrip Tri-Lock PIPE CLAMPS GGTC': 'GreenGrip Twin Bolt Pipe Clamp.png',
    'GreenGrip Tri-Lock PIPE CLAMP - without lining GGTS': 'GreenGrip Twin Bolt Pipe Clamp.png',
    'GreenGrip Hanging Adapter Clamp GGHAC': 'GreenGrip Hanging Adapter Clamp GGHAC.png',
    'GreenGrip Hanging Adapter Clamp without lining GGHAS': 'GreenGrip Hanging Adapter Clamp GGHAC.png',
    'GreenGrip RiserRest Clamp GGRR': 'GreenGrip RiserRest Clamp GGRR.png',
    'GreenGrip StrutMount Saddle Clamp GGSM': 'GreenGrip StrutMount Saddle Clamp GGSM.png',
    'GreenGrip Strut Mount U-Clamp GGSMU': 'GreenGrip Strut Mount U-Clamp GGSMU.png',
    'GreenGrip U-Bolt GGUB': 'GGUP (2).png',
    'GreenGrip Rubber Insert': 'GreenGrip Rubber Insert.png',
    'GreenGrip PU Insert': 'GreenGrip PU Insert.png',
    'GreenGrip ChillGuard Clamp (S) - GGCGS': 'GreenGrip ChillGuard Clamp (S) - GGCGS.png',
    'GreenGrip Chillguard Clamp (L) - GGCGL': 'GreenGrip ChillGuard Clamp (S) - GGCGS.png',
    'GreenGrip Duct Hanger - GGDL': 'Copy of 74.png',
    'GreenGrip Duct Hanger Unlined - GGDU': 'Copy of 75.png',
    'GreenGrip DuctLoop DualMount - GGDM': 'Copy of 76.png',
    'GreenGrip DuctLoop DualMount Unlined - GGMU': 'Copy of 77.png',
    'Greengrip WisMount Hanger - GGWM': 'Copy of 78.png',
    'Greengrip IsoLink Duct Bracket - GGID': 'Copy of 79.png',
    'GreenGrip SlimMount': 'Copy of 80.png',
    'GreenGrip Pro-Stop Chain Brake Band': 'Copy of 81.png',
    'Greengrip Hanger-Flex': 'Copy of 82.png',
    'GreenGrip Clevis Hanger': 'GreenGrip Clevis Hanger.png',
    
    // GGSH catalog products
    'GreenGrip Sprinkler Pipe Hanger GGSH': 'GGSH.png',
    'GreenGrip Sprinkler Hanger (Nut-Free)': 'Nut-Free.png',
    'GreenGrip Swift Clamp GGQC': 'GreenGrip Swift Clamp GGQC.png',
    'GreenGrip Swift Clamp - without lining GGQC': 'GreenGrip Swift Clamp - without linning GGQC.png'
};

console.log('=== Product Name to Image Mapping ===\n');
Object.entries(imageMapping).forEach(([productName, imageName]) => {
    console.log(`${productName}\n  -> assets/CLAMPS/${imageName}\n`);
});

console.log('\n\nReady to update JSON files? The script will add image paths to each product section.');
