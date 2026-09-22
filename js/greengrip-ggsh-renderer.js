// Load and render GreenGrip GGSH (Sprinkler Pipe Hanger) catalog data

async function loadCatalogData() {
    try {
        const response = await fetch('data/greengrip-ggsh-catalog.json');
        const allData = await response.json();
        
        // Get product type from URL query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const productType = urlParams.get('product') || 'GGSH'; // Default to GGSH
        
        // Select the appropriate product data
        const data = allData[productType] || allData.GGSH;
        
        renderCatalog(data);
    } catch (error) {
        console.error('Error loading catalog data:', error);
    }
}

function renderCatalog(data) {
    // Update product name
    if (data.productName) {
        document.getElementById('productName').textContent = data.productName;
        document.title = data.productName + ' - Product Catalog';
    }

    // Update product images
    if (data.images) {
        // Use mainImage for the first image if available (from CLAMPS folder)
        if (data.images.mainImage) {
            document.getElementById('productImage1').src = data.images.mainImage;
        } else if (data.images.image1) {
            document.getElementById('productImage1').src = data.images.image1;
        }
        if (data.images.image2) {
            document.getElementById('productImage2').src = data.images.image2;
        }
        if (data.images.image3) {
            document.getElementById('productImage3').src = data.images.image3;
        }
    }

    // Update specification
    if (data.specification) {
        const spec = data.specification;
        
        // Check if this is GGQC (different spec structure)
        if (spec.zincPlating || spec.soundAbsorption || spec.noiseReduction) {
            // GGQC structure - update the specification section
            const specSection = document.querySelector('.specification');
            specSection.innerHTML = `
                <h3>Specification</h3>
                <div class="spec-item">
                    <strong>• Material:</strong><br>
                    <span style="margin-left: 15px;">${spec.material || ''}</span>
                </div>
                <div class="spec-item">
                    <strong>• Zinc Plating:</strong><br>
                    <span style="margin-left: 15px;">${spec.zincPlating || ''}</span>
                </div>
                <div class="spec-item">
                    <strong>• Sound Absorption:</strong><br>
                    <span style="margin-left: 15px;">${spec.soundAbsorption || ''}</span>
                </div>
                <div class="spec-item">
                    <strong>• Noise Reduction</strong><br>
                    <strong style="margin-left: 15px;">Temperature-</strong><br>
                    <strong style="margin-left: 15px;">resistance</strong><br>
                    <span style="margin-left: 15px;">${spec.noiseReduction || ''}</span><br>
                    <span style="margin-left: 15px;">${spec.temperatureResistance || ''}</span>
                </div>
                <div class="spec-item">
                    <strong>• EPDM hardness</strong><br>
                    <span style="margin-left: 15px;">${spec.epdmHardness || ''}</span>
                </div>
                <div class="spec-item">
                    <strong>• Fire Behaviour</strong><br>
                    <span style="margin-left: 15px;">${spec.fireBehaviour || ''}</span>
                </div>
            `;
        } else {
            // GGSH/GGSN structure
            // Material
            if (spec.material) {
                const materialList = document.getElementById('materialList');
                if (materialList) {
                    materialList.innerHTML = '';
                    const materials = Array.isArray(spec.material) ? spec.material : [spec.material];
                    materials.forEach(material => {
                        const li = document.createElement('li');
                        li.textContent = material.trim();
                        materialList.appendChild(li);
                    });
                }
            }
            
            // Surface
            if (spec.surface) {
                const surfaceList = document.getElementById('surfaceList');
                if (surfaceList) {
                    surfaceList.innerHTML = '';
                    const surfaces = Array.isArray(spec.surface) ? spec.surface : spec.surface.split(/,\s*/);
                    surfaces.forEach(surface => {
                        const li = document.createElement('li');
                        li.textContent = surface.trim();
                        surfaceList.appendChild(li);
                    });
                }
            }
            
            // Material Connection
            if (spec.materialConnection) {
                const materialConnection = document.getElementById('materialConnection');
                if (materialConnection) {
                    materialConnection.textContent = spec.materialConnection;
                }
            }
        }
    }

    // Update product definition
    if (data.productDefinition) {
        document.getElementById('productDefinition').textContent = data.productDefinition;
    }

    // Update page number
    if (data.pageNumber) {
        document.getElementById('pageNumber').textContent = data.pageNumber;
    }

    // Update website
    if (data.website) {
        document.getElementById('website').textContent = data.website;
    }

    // Render loading data table
    if (data.loadingData && data.loadingData.length > 0) {
        renderLoadingDataTable(data.loadingData);
    }

    // Render product table
    if (data.products && data.products.length > 0) {
        // Check if this is GGQC (has different table structure)
        const isGGQC = data.products[0].dimensions?.PxS !== undefined && data.products[0].maxRecLoad !== undefined;
        // Check if this is GGRR (has S field directly on product)
        const isGGRR = data.products[0].S !== undefined;
        
        if (isGGQC) {
            // Update table headers for GGQC
            updateTableHeadersForGGQC();
        } else if (isGGRR) {
            // Update table headers for GGRR
            updateTableHeadersForGGRR();
        }
        
        renderProductTable(data.products, isGGQC);
    }
}

function updateTableHeadersForGGQC() {
    const thead = document.getElementById('productTableHead');
    const subHead = document.getElementById('productTableSubHead');
    
    if (thead && subHead) {
        thead.innerHTML = `
            <tr>
                <th rowspan="2">Product Code</th>
                <th colspan="3">Clamping Range</th>
                <th colspan="6">Dimensions [mm]</th>
                <th rowspan="2">Pack Size<br>[pcs]</th>
                <th rowspan="2">Max.Rec.<br>Load [N]</th>
            </tr>
        `;
        
        subHead.innerHTML = `
            <th>DN</th>
            <th>D[mm]</th>
            <th>[inch]</th>
            <th>P x s</th>
            <th>W</th>
            <th>H'</th>
            <th>C</th>
            <th>T</th>
            <th>S</th>
        `;
    }
}

function updateTableHeadersForGGRR() {
    const thead = document.getElementById('productTableHead');
    const subHead = document.getElementById('productTableSubHead');
    
    if (thead && subHead) {
        thead.innerHTML = `
            <tr>
                <th rowspan="2">Product Code</th>
                <th colspan="3">For Tube</th>
                <th colspan="3">Dimensions [mm]</th>
                <th rowspan="2">S</th>
                <th rowspan="2">Pack Size<br>[pcs]</th>
            </tr>
        `;
        
        subHead.innerHTML = `
            <th>DN</th>
            <th>[mm]</th>
            <th>[inch]</th>
            <th>P x S</th>
            <th>W</th>
            <th>H</th>
        `;
    }
}

function renderLoadingDataTable(loadingData) {
    const tbody = document.getElementById('loadingDataTableBody');
    tbody.innerHTML = '';

    loadingData.forEach(item => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${item.size || ''}</td>
            <td>${item.maxRecommendedLoad || ''}</td>
        `;
        
        tbody.appendChild(row);
    });
}

function renderProductTable(products, isGGQC = false) {
    const tbody = document.getElementById('productTableBody');
    tbody.innerHTML = '';

    // Check if this is GGRR (different structure)
    const isGGRR = products[0]?.dimensions?.PxS && products[0]?.S;

    products.forEach(product => {
        const row = document.createElement('tr');
        
        if (isGGQC) {
            // GGQC table structure
            row.innerHTML = `
                <td>${product.productCode || ''}</td>
                <td>${product.clampingRange?.DN || ''}</td>
                <td>${product.clampingRange?.mm || ''}</td>
                <td>${product.clampingRange?.inch || ''}</td>
                <td>${product.dimensions?.PxS || ''}</td>
                <td>${product.dimensions?.W || ''}</td>
                <td>${product.dimensions?.H || ''}</td>
                <td>${product.dimensions?.C || ''}</td>
                <td>${product.dimensions?.T || ''}</td>
                <td>${product.dimensions?.S || ''}</td>
                <td>${product.packSize || ''}</td>
                <td>${product.maxRecLoad || ''}</td>
            `;
        } else if (isGGRR) {
            // GGRR table structure
            row.innerHTML = `
                <td>${product.productCode || ''}</td>
                <td>${product.clampingRange?.DN || ''}</td>
                <td>${product.clampingRange?.mm || ''}</td>
                <td>${product.clampingRange?.inch || ''}</td>
                <td>${product.dimensions?.PxS || ''}</td>
                <td>${product.dimensions?.W || ''}</td>
                <td>${product.dimensions?.H || ''}</td>
                <td>${product.S || ''}</td>
                <td>${product.packSize || ''}</td>
            `;
        } else {
            // GGSH/GGSN/GGCH table structure
            row.innerHTML = `
                <td>${product.productCode || ''}</td>
                <td>${product.clampingRange?.DN || ''}</td>
                <td>${product.clampingRange?.mm || ''}</td>
                <td>${product.clampingRange?.inch || ''}</td>
                <td>${product.dimensions?.WxT || ''}</td>
                <td>${product.dimensions?.G || product.dimensions?.ØL || ''}</td>
                <td>${product.dimensions?.H1 || ''}</td>
                <td>${product.dimensions?.H2 || ''}</td>
                <td>${product.dimensions?.M || ''}</td>
                <td>${product.packSize || ''}</td>
            `;
        }
        
        tbody.appendChild(row);
    });
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', loadCatalogData);
