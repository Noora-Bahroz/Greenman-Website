const fs = require('fs');
const path = require('path');

// Styles for card layout with image
const cardStyles = `
    /* Product Grid */
    .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
        gap: 25px;
        margin-bottom: 30px;
        max-width: 1400px;
        margin: 0 auto;
        padding: 0 30px;
    }

    .product-card {
        background: white;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(27, 94, 32, 0.15);
        cursor: pointer;
        transition: all 0.3s ease;
        border-left: 4px solid #0d3d12;
        display: grid;
        grid-template-columns: 1fr 120px;
        gap: 15px;
        align-items: center;
    }

    .product-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 4px 15px rgba(27, 94, 32, 0.25);
    }

    .product-card h3 {
        color: #0d3d12;
        font-size: 18px;
        margin-bottom: 10px;
    }

    .product-card .product-code {
        color: #666;
        font-size: 14px;
        margin-bottom: 10px;
    }

    .product-card .product-count {
        background: #fff3e0;
        color: #f57c00;
        padding: 6px 12px;
        border-radius: 20px;
        font-weight: 600;
        font-size: 13px;
        width: fit-content;
        margin-bottom: 10px;
    }

    .product-card .view-details {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        background: linear-gradient(135deg, #52B455 0%, #2D9F3C 100%);
        color: white;
        padding: 10px 20px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        font-size: 13px;
        transition: all 0.3s;
        box-shadow: 0 2px 8px rgba(82, 180, 85, 0.3);
        width: fit-content;
    }

    .product-card .view-details:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(82, 180, 85, 0.4);
    }

    .product-card-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }

    .product-card-image {
        width: 120px;
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f8f9fa;
        border-radius: 6px;
        overflow: hidden;
        border: 2px solid #e8f5e9;
        transition: all 0.3s ease;
    }

    .product-card:hover .product-card-image {
        border-color: #52B455;
        box-shadow: 0 2px 8px rgba(82, 180, 85, 0.2);
    }

    .product-card-image img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        padding: 10px;
    }

    .code-badge {
        background: #e8f5e9;
        color: #2D9F3C;
        padding: 6px 14px;
        border-radius: 6px;
        font-weight: 700;
        font-family: 'Roboto', monospace;
        font-size: 13px;
        display: inline-block;
    }

    @media (max-width: 768px) {
        .products-grid {
            grid-template-columns: 1fr;
        }
        
        .product-card {
            grid-template-columns: 1fr 100px;
        }
        
        .product-card-image {
            width: 100px;
            height: 100px;
        }
    }
`;

// ============= Convert GreenGrip Collection =============
console.log('Converting greengrip-collection.html...');
const greenGripPath = path.join(__dirname, 'greengrip-collection.html');
let greenGripContent = fs.readFileSync(greenGripPath, 'utf8');

// Add styles to head
if (!greenGripContent.includes('.products-grid')) {
    greenGripContent = greenGripContent.replace(
        '</head>',
        `    <style>${cardStyles}</style>\n</head>`
    );
}

// GreenGrip products data
const greenGripProducts = [
    { num: '01', name: 'GreenGrip Isophonic Pipe Clamp GGIP', code: 'GGIP', count: '26 items', link: 'greengrip-ggip-catalog.html', image: 'assets/img/placeholder.png' },
    { num: '02', name: 'GreenGrip Coloured Isophonic Pipe Clamp GGCP', code: 'GGCP', count: '19 items', link: 'greengrip-ggip-catalog.html?product=ggcp', image: 'assets/img/placeholder.png' },
    { num: '03', name: 'GreenGrip Heavy Duty Pipe Clamp GGHT', code: 'GGHT', count: '18 items', link: 'greengrip-ggip-catalog.html?product=gght', image: 'assets/img/placeholder.png' },
    { num: '04', name: 'GreenGrip Special Applications GGSP', code: 'GGSP', count: '15 items', link: 'greengrip-ggip-catalog.html?product=ggsp', image: 'assets/img/placeholder.png' },
    { num: '05', name: 'GreenGrip Installation Hardware GGIH', code: 'GGIH', count: '12 items', link: 'greengrip-ggip-catalog.html?product=ggih', image: 'assets/img/placeholder.png' },
];

const greenGripCardsHTML = greenGripProducts.map(product => `
                <div class="product-card" onclick="window.location.href='${product.link}'">
                    <div class="product-card-content">
                        <h3>${product.name}</h3>
                        <div class="product-code">Code: <span class="code-badge">${product.code}</span></div>
                        <div class="product-count">${product.count}</div>
                        <a href="${product.link}" class="view-details" onclick="event.stopPropagation()">
                            View Products
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M1 8h14M8 1l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </a>
                    </div>
                    <div class="product-card-image">
                        <img src="${product.image}" alt="${product.code}" onerror="this.src='assets/img/placeholder.png'">
                    </div>
                </div>`).join('\n');

// Replace table with cards
greenGripContent = greenGripContent.replace(
    /<div class="accessories-grid"[\s\S]*?<\/section>/,
    `<div class="products-grid">
${greenGripCardsHTML}
            </div>
        </div>
    </section>`
);

// Ensure footer placeholder exists
if (!greenGripContent.includes('footer-placeholder')) {
    greenGripContent = greenGripContent.replace(
        /<script>/,
        `    <!-- Footer -->\n    <div id="footer-placeholder"></div>\n\n    <script>`
    );
}

// Fix the script to add loaded class
greenGripContent = greenGripContent.replace(
    /document\.body\.appendChild\(navScript\);/,
    `document.body.appendChild(navScript);
            
            // Mark page as loaded
            document.body.classList.add('loaded');`
);

fs.writeFileSync(greenGripPath, greenGripContent, 'utf8');
console.log('✅ greengrip-collection.html converted successfully!');

// ============= Convert Clamps Collection =============
console.log('\nConverting clamps-collection.html...');
const clampsPath = path.join(__dirname, 'clamps-collection.html');
let clampsContent = fs.readFileSync(clampsPath, 'utf8');

// Add styles to head
if (!clampsContent.includes('.products-grid')) {
    clampsContent = clampsContent.replace(
        '</head>',
        `    <style>${cardStyles}</style>\n</head>`
    );
}

// Clamps products data
const clampsProducts = [
    { num: '01', name: 'GreenGrip Sprinkler Pipe Hanger', code: 'GGSH', link: 'greengrip-ggsh-catalog.html?product=GGSH', image: 'assets/CLAMPS/GGSH.png' },
    { num: '02', name: 'GreenGrip Sprinkler Hanger (Nut-Free)', code: 'GGSN', link: 'greengrip-ggsh-catalog.html?product=GGSN', image: 'assets/CLAMPS/Nut-Free.png' },
];

const clampsCardsHTML = clampsProducts.map(product => `
                <div class="product-card" onclick="window.location.href='${product.link}'">
                    <div class="product-card-content">
                        <h3>${product.name}</h3>
                        <div class="product-code">Code: <span class="code-badge">${product.code}</span></div>
                        <a href="${product.link}" class="view-details" onclick="event.stopPropagation()">
                            View Details
                            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                                <path d="M1 8h14M8 1l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </a>
                    </div>
                    <div class="product-card-image">
                        <img src="${product.image}" alt="${product.code}" onerror="this.src='assets/img/placeholder.png'">
                    </div>
                </div>`).join('\n');

// Replace table with cards
clampsContent = clampsContent.replace(
    /<div class="accessories-grid"[\s\S]*?<\/section>/,
    `<div class="products-grid">
${clampsCardsHTML}
            </div>
        </div>
    </section>`
);

// Fix the script to add loaded class
clampsContent = clampsContent.replace(
    /document\.body\.appendChild\(navScript\);/,
    `document.body.appendChild(navScript);
            
            // Mark page as loaded
            document.body.classList.add('loaded');`
);

fs.writeFileSync(clampsPath, clampsContent, 'utf8');
console.log('✅ clamps-collection.html converted successfully!');

console.log('\n=== Summary ===');
console.log('✅ Both files converted to card layout');
console.log('✅ Image placeholders added to cards');
console.log('✅ Footer loading fixed');
console.log('✅ Page loader integration fixed');
