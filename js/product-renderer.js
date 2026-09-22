// Product Component System
class ProductRenderer {
    constructor(dataUrl) {
        this.dataUrl = dataUrl;
        this.data = null;
    }

    async loadData() {
        try {
            const response = await fetch(this.dataUrl);
            this.data = await response.json();
            return this.data;
        } catch (error) {
            console.error('Error loading product data:', error);
            return null;
        }
    }

    // Render a single product detail item (Catalog Style)
    renderProduct(product, categoryBadge, categoryId = null, flip = false, isPreview = false, categoryPdf = null) {
        const flipClass = flip ? 'flip' : '';
        const detailsLink = isPreview && categoryId 
            ? `product-detail.html?id=gmc-c-profile` 
            : `product-detail.html?id=${product.id}`;
        const detailsText = isPreview ? 'View All Products' : 'View Details';
        
        // Determine PDF download link
        const pdfLink = categoryPdf || product.catalogPdf || '#';
        const pdfDownloadAttr = pdfLink !== '#' ? `download="${pdfLink.split('/').pop()}"` : '';
        
        // Render technical specifications table if available
        const renderTechnicalTable = () => {
            if (!product.technicalTable || product.technicalTable.length === 0) {
                return '';
            }
            
            const headers = Object.keys(product.technicalTable[0]);
            
            const viewAllLink = isPreview && categoryId 
                ? `product-detail.html?id=gmc-c-profile` 
                : `product-detail.html?id=${product.id}`;
            const viewAllText = isPreview ? 'View All Products' : 'View Details';
            
            return `
                <div class="technical-table-container">
                    <table class="technical-table">
                        <thead>
                            <tr>
                                ${headers.map(header => `<th>${header}</th>`).join('')}
                            </tr>
                        </thead>
                        <tbody>
                            ${product.technicalTable.map(row => `
                                <tr>
                                    ${headers.map(header => `<td>${row[header] || '-'}</td>`).join('')}
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="product-actions" style="margin-top: 20px; padding: 0 15px 15px;">
                        <a href="${viewAllLink}" class="product-btn primary">
                            <span>${viewAllText}</span>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M1 8h14M8 1l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </a>
                        <a href="${pdfLink}" class="product-btn secondary" ${pdfDownloadAttr} ${pdfLink !== '#' ? 'target="_blank"' : ''}>
                            Download PDF
                        </a>
                    </div>
                </div>
            `;
        };
        
        return `
            <div class="product-detail-item ${flipClass}">
                <div class="product-info">
                    ${product.subtitle ? `<h3 class="product-subtitle">${product.subtitle}</h3>` : ''}
                    <div class="product-content-row">
                        <div class="product-inline-image">
                            <img src="${product.images[0]}" alt="${product.title}">
                        </div>
                        <p class="product-description">${product.description}</p>
                    </div>
                    
                    ${renderTechnicalTable()}
                </div>
            </div>
        `;
    }

    // Render category preview (one product per category for home page)
    renderCategoryPreviews(containerId) {
        if (!this.data) return;

        const container = document.getElementById(containerId);
        if (!container) return;

        let html = '';
        this.data.categories.forEach((category, index) => {
            if (category.products.length > 0) {
                const firstProduct = category.products[0];
                const flip = index % 2 !== 0; // Alternate flip
                html += this.renderProduct(firstProduct, category.badge, category.id, flip, true, category.catalogPdf);
            }
        });

        container.innerHTML = html;
        this.initScrollAnimations();
    }

    // Render all products from a specific category
    renderCategoryPage(categoryId, containerId) {
        if (!this.data) return;

        const category = this.data.categories.find(cat => cat.id === categoryId);
        if (!category) {
            console.error('Category not found:', categoryId);
            return;
        }

        const container = document.getElementById(containerId);
        if (!container) return;

        let html = '';
        category.products.forEach((product, index) => {
            const flip = index % 2 !== 0; // Alternate flip
            html += this.renderProduct(product, category.badge, categoryId, flip, false, category.catalogPdf);
        });

        container.innerHTML = html;
        this.initScrollAnimations();
    }

    // Render category cards for home page
    renderCategoryCards(containerId) {
        if (!this.data) return;

        const container = document.getElementById(containerId);
        if (!container) return;

        const html = this.data.categories.map(category => `
            <div class="category-card">
                <div class="category-card-image">
                    <img src="${category.products[0]?.images[0] || ''}" alt="${category.name}">
                </div>
                <div class="category-card-content">
                    <h3 class="category-card-title">${category.name}</h3>
                    <p class="category-card-desc">${category.description}</p>
                    <span class="category-count">${category.products.length} Products</span>
                </div>
                <a href="product-detail.html?id=gmc-c-profile" class="category-card-link">
                    <span>View All Products</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M1 8h14M8 1l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </a>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    // Initialize scroll animations
    initScrollAnimations() {
        const items = document.querySelectorAll('.product-detail-item');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        });

        items.forEach(item => {
            observer.observe(item);
        });
    }

    // Get category by ID
    getCategoryById(categoryId) {
        if (!this.data) return null;
        return this.data.categories.find(cat => cat.id === categoryId);
    }

    // Get product by ID
    getProductById(productId) {
        if (!this.data) return null;
        
        for (const category of this.data.categories) {
            const product = category.products.find(p => p.id === productId);
            if (product) {
                return { product, category };
            }
        }
        return null;
    }
}

// Utility function to get URL parameters
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Export for use in HTML pages
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductRenderer;
}
