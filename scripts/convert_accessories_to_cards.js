const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'accessories-collection.html');
let content = fs.readFileSync(filePath, 'utf8');

// Add card styles
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
        display: flex;
        flex-direction: column;
        gap: 15px;
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
        align-self: flex-start;
    }

    .product-card .view-details:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(82, 180, 85, 0.4);
    }

    .code-badge {
        background: #e8f5e9;
        color: #2D9F3C;
        padding: 6px 14px;
        border-radius: 6px;
        font-weight: 700;
        font-family: 'Roboto', monospace;
        font-size: 13px;
        width: fit-content;
    }

    @media (max-width: 768px) {
        .products-grid {
            grid-template-columns: 1fr;
        }
    }
`;

// Replace the style section
content = content.replace(
    /<style>\s*\.header[\s\S]*?<\/style>/,
    `<style>
    .header {
      text-align: center;
    }
    .category-info {
      display: none !important;
    }
    ${cardStyles}
  </style>`
);

// Extract product data from the table and convert to card HTML
const productsData = [
    { num: '01', name: "Angle Connector's (GACO)", code: 'GACO', count: '14 items', link: 'gaco-catalog.html' },
    { num: '02', name: 'Flat Connector (GFCO)', code: 'GFCO', count: '9 items', link: 'gfco-catalog.html' },
    { num: '03', name: 'Bi-Directional Connector (GBDC)', code: 'GBDC', count: '8 items', link: 'gbdc-catalog.html' },
    { num: '04', name: 'Multi-Directional Connector (GMDC)', code: 'GMDC', count: '8 items', link: 'gmdc-catalog.html' },
    { num: '05', name: 'Multi-Directional Reinforced Connector (GMRC)', code: 'GMRC', count: '6 items', link: 'gmrc-catalog.html' },
    { num: '06', name: 'Z-Shape Connector (GZCO)', code: 'GZCO', count: '5 items', link: 'gzco-catalog.html' },
    { num: '07', name: 'U-Shape Winged Bracket (GUWB)', code: 'GUWB', count: '9 items', link: 'guwb-catalog.html' },
    { num: '08', name: 'Reinforced Angle Connector (GRAC)', code: 'GRAC', count: '1 items', link: 'grac-catalog.html' },
    { num: '09', name: 'Channel Washer (GCWA)', code: 'GCWA', count: '7 items', link: 'gcwa-catalog.html' },
    { num: '10', name: 'Double-Sided Connector Bracket (DSCB)', code: 'DSCB', count: '4 items', link: 'dscb-catalog.html' },
    { num: '11', name: 'Base Holder (GBHO)', code: 'GBHO', count: '5 items', link: 'gbho-catalog.html' },
    { num: '12', name: 'Profile Tooth Nut (GPTN)', code: 'GPTN', count: '11 items', link: 'gptn-catalog.html' },
    { num: '13', name: 'Profile Bolt with Tooth Head (GPTB)', code: 'GPTB', count: '13 items', link: 'gptb-catalog.html' },
    { num: '14', name: 'Multi Angle Base Holder (GMAH)', code: 'GMAH', count: '1 items', link: 'gmah-catalog.html' },
    { num: '15', name: 'Adjustible Hinge (GAHI)', code: 'GAHI', count: '6 items', link: 'gahi-catalog.html' },
    { num: '16', name: 'Beam Attachment U-Shaped Holder (GBUHxxxx)', code: 'GBUH', count: '8 items', link: 'gbat-catalog.html' },
    { num: '17', name: 'Rod Bracing Node Bracket (GBNB)', code: 'GBNB', count: '20 items', link: 'gbnb-catalog.html' },
    { num: '18', name: 'Back-to-Back Channel Connector (GBCC)', code: 'GBCC', count: '1 items', link: 'gbcc-catalog.html' },
    { num: '19', name: 'Edge-to-Edge Channel Connector (GECC)', code: 'GECC', count: '8 items', link: 'gecc-catalog.html' },
    { num: '20', name: 'Profile Node Bracket (GPNB)', code: 'GPNB', count: '2 items', link: 'gpnb-catalog.html' },
];

const cardsHTML = productsData.map(product => `
                <div class="product-card" onclick="window.location.href='${product.link}'">
                    <h3>${product.name}</h3>
                    <div class="product-code">Product Code: <span class="code-badge">${product.code}</span></div>
                    <div class="product-count">${product.count}</div>
                    <a href="${product.link}" class="view-details" onclick="event.stopPropagation()">
                        View Products
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <path d="M1 8h14M8 1l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </a>
                </div>`).join('\n');

// Replace the entire table section with cards
const gridHTML = `
            <div class="products-grid">
${cardsHTML}
            </div>`;

// Replace from accessories-grid div to the end of the section
content = content.replace(
    /<div class="accessories-grid"[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/,
    `${gridHTML}
        </div>
    </section>`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Successfully converted accessories-collection.html to card layout!');
