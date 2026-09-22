const fs = require('fs');
const path = require('path');

// Get all HTML files except navbar.html and navbarold.html
const htmlFiles = fs.readdirSync(__dirname)
    .filter(file => file.endsWith('.html') && file !== 'navbar.html' && file !== 'navbarold.html');

console.log(`Found ${htmlFiles.length} HTML files to fix\n`);

let fixedCount = 0;
let skippedCount = 0;

htmlFiles.forEach(file => {
    const filePath = path.join(__dirname, file);
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check if navbar.css is already in head
    if (!content.includes('<link rel="stylesheet" href="navbar.css">') && 
        content.includes('navbar-placeholder')) {
        
        // Find the position to insert navbar.css (before closing </head> or before styles.css)
        if (content.includes('<link rel="stylesheet" href="styles.css">')) {
            content = content.replace(
                '<link rel="stylesheet" href="styles.css">',
                '<link rel="stylesheet" href="navbar.css">\n    <link rel="stylesheet" href="styles.css">'
            );
            modified = true;
        } else if (content.includes('</head>')) {
            content = content.replace(
                '</head>',
                '    <link rel="stylesheet" href="navbar.css">\n</head>'
            );
            modified = true;
        }
    }

    // Add body loading styles if not present
    if (content.includes('<style>') && !content.includes('body:not(.loaded)')) {
        // Find the style block and add loading styles
        const styleRegex = /(<style>[\s\S]*?)(body\s*{[^}]*})/;
        const match = content.match(styleRegex);
        
        if (match) {
            const loadingStyles = `
        /* Hide content until fully loaded */
        body:not(.loaded) {
            overflow: hidden;
        }
        body:not(.loaded) > *:not(.page-loader) {
            visibility: hidden;
            opacity: 0;
        }
        `;
            
            content = content.replace(
                match[2],
                loadingStyles + '\n        ' + match[2]
            );
            modified = true;
        }
    }

    // Add loader transition styles if loader exists but transitions don't
    if (content.includes('.page-loader') && 
        !content.includes('body.loaded > *:not(.page-loader)')) {
        
        const loaderStylesRegex = /(body\.loaded\s+\.page-loader\s*{[^}]*})/;
        const match = content.match(loaderStylesRegex);
        
        if (match) {
            content = content.replace(
                match[1],
                match[1] + '\n        body.loaded > *:not(.page-loader){visibility:visible;opacity:1;transition:opacity .3s ease-in}'
            );
            modified = true;
        }
    }

    // Fix the loaded class addition in scripts
    if (content.includes('navbar-placeholder') && content.includes('navScript.onload')) {
        // Add loaded class after navbar is ready
        const onloadRegex = /(navScript\.onload\s*=\s*function\(\)\s*{[\s\S]*?)(}\s*;)/;
        const match = content.match(onloadRegex);
        
        if (match && !match[1].includes('document.body.classList.add')) {
            content = content.replace(
                match[0],
                match[1] + '\n                document.body.classList.add(\'loaded\');\n            ' + match[2]
            );
            modified = true;
        }

        // Add loaded class on error too
        const onerrorRegex = /(navScript\.onerror\s*=\s*function\(\)\s*{[\s\S]*?)(}\s*;)/;
        const errorMatch = content.match(onerrorRegex);
        
        if (errorMatch && !errorMatch[1].includes('document.body.classList.add')) {
            content = content.replace(
                errorMatch[0],
                errorMatch[1] + '\n                document.body.classList.add(\'loaded\');\n            ' + errorMatch[2]
            );
            modified = true;
        }

        // Add loaded class to catch block
        if (!content.includes('catch(error =>') || 
            (content.includes('catch(error =>') && !content.match(/catch\s*\([^)]*\)\s*{[^}]*classList\.add\('loaded'\)/))) {
            content = content.replace(
                /(\}\)\.catch\(error\s*=>\s*{[^}]*)(}\s*\);)/,
                '$1\n            document.body.classList.add(\'loaded\');\n        $2'
            );
            modified = true;
        }
    }

    // Alternative pattern for pages that use different loading approach
    if (content.includes('navbar-placeholder') && 
        content.includes('placeholder.innerHTML') && 
        !content.includes('body.classList.add')) {
        
        // Find where navbar is loaded and add classList
        const patterns = [
            /(\bplaceholder\.innerHTML\s*=\s*[^;]+;)(\s*)/g,
            /(\bdocument\.getElementById\('navbar-placeholder'\)\.innerHTML\s*=\s*[^;]+;)(\s*)/g
        ];

        patterns.forEach(pattern => {
            if (content.match(pattern)) {
                content = content.replace(
                    pattern,
                    '$1$2\n                document.body.classList.add(\'loaded\');$2'
                );
                modified = true;
            }
        });
    }

    if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`✓ Fixed: ${file}`);
        fixedCount++;
    } else {
        console.log(`- Skipped: ${file} (no changes needed or already fixed)`);
        skippedCount++;
    }
});

console.log(`\n=== Summary ===`);
console.log(`Fixed: ${fixedCount} files`);
console.log(`Skipped: ${skippedCount} files`);
console.log(`Total: ${htmlFiles.length} files`);
