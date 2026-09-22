// Load and render GreenGrip GGIP catalog data

async function loadCatalogData() {
    try {
        const response = await fetch('data/greengrip-ggip-catalog.json');
        const allData = await response.json();
        
        // Get product type from URL query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const productType = urlParams.get('product');
        
        // Select the appropriate product data based on query parameter
        let data;
        if (productType && allData[productType]) {
            data = allData[productType];
        } else {
            // Default to root level data (GGIP)
            data = allData;
        }
        
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

    // Update product image if available, hide empty placeholders
    const productImageContainers = document.querySelectorAll('.product-image');
    if (data.image) {
        const productImages = document.querySelectorAll('.product-image img');
        if (productImages.length > 0) {
            productImages[0].src = data.image;
            productImages[0].alt = data.productName || 'Product Image';
            productImageContainers[0].style.display = 'block';
        }
        // Hide other empty image placeholders
        for (let i = 1; i < productImageContainers.length; i++) {
            productImageContainers[i].style.display = 'none';
        }
    } else {
        // Hide all image placeholders if no image
        productImageContainers.forEach(container => {
            container.style.display = 'none';
        });
    }

    // Update table header based on product type
    // Check if products have connectingSlotØ or connectingThread
    if (data.products && data.products.length > 0) {
        const hasConnectingSlot = data.products[0].hasOwnProperty('connectingSlotØ');
        const headerElement = document.getElementById('connectingHeader');
        if (headerElement) {
            headerElement.innerHTML = hasConnectingSlot ? 'Connecting<br>Slot Ø' : 'Connecting<br>Thread';
        }

        // Update clamping range headers dynamically
        updateClampingRangeHeaders(data.products[0]);
    }

    // Update specification
    if (data.specification) {
        const spec = data.specification;
        
        // First, hide all optional specification containers
        const optionalContainers = [
            'materialSurfaceContainer', 'materialInsertContainer', 'effectiveDensityContainer',
            'thermalConductivityContainer', 'fireResistanceContainer', 'faceSideContainer',
            'soundContainer', 'soundAbsorptionContainer', 'noiseReductionContainer',
            'temperatureContainer', 'waterVapourPermeabilityContainer', 'epdmHardnessContainer',
            'fireBehaviourContainer', 'centerRibContainer', 'zincPlatingContainer', 'comStrengthContainer'
        ];
        
        optionalContainers.forEach(containerId => {
            const container = document.getElementById(containerId);
            if (container) container.style.display = 'none';
        });
        
        // Material Surface (for products with nested material object)
        if (spec.material?.surface) {
            const surfaceList = document.getElementById('materialSurface');
            const container = document.getElementById('materialSurfaceContainer');
            if (surfaceList && container) {
                surfaceList.innerHTML = '';
                const surfaces = spec.material.surface.split(/,\s*/);
                surfaces.forEach(surface => {
                    const li = document.createElement('li');
                    li.textContent = surface.trim();
                    surfaceList.appendChild(li);
                });
                container.style.display = 'block';
            }
        }
        // Material (for products with simple material string)
        else if (typeof spec.material === 'string') {
            const materialElement = document.getElementById('materialSurface');
            const container = document.getElementById('materialSurfaceContainer');
            if (materialElement && container) {
                materialElement.innerHTML = '';
                const li = document.createElement('li');
                li.textContent = spec.material;
                materialElement.appendChild(li);
                container.style.display = 'block';
            }
        }
        
        // Material Insert
        if (spec.material?.insert) {
            const insertElement = document.getElementById('materialInsert');
            const container = document.getElementById('materialInsertContainer');
            if (insertElement && container) {
                insertElement.textContent = spec.material.insert;
                container.style.display = 'block';
            }
        }
        
        // Zinc Plating
        if (spec.zincPlating) {
            const zincElement = document.getElementById('zincPlating');
            const container = document.getElementById('zincPlatingContainer');
            if (zincElement && container) {
                zincElement.textContent = spec.zincPlating;
                container.style.display = 'block';
            }
        }
        
        // Effective Density (for GGPUI, GGRI)
        if (spec.effectiveDensity) {
            const densityElement = document.getElementById('effectiveDensity');
            const container = document.getElementById('effectiveDensityContainer');
            if (densityElement && container) {
                densityElement.textContent = spec.effectiveDensity;
                container.style.display = 'block';
            }
        }
        
        // Thermal Conductivity (for GGPUI, GGRI)
        if (spec.thermalConductivity) {
            const conductivityElement = document.getElementById('thermalConductivity');
            const container = document.getElementById('thermalConductivityContainer');
            if (conductivityElement && container) {
                conductivityElement.textContent = spec.thermalConductivity;
                container.style.display = 'block';
            }
        }
        
        // Fire Resistance (for GGPUI, GGRI)
        if (spec.fireResistance) {
            const fireResElement = document.getElementById('fireResistance');
            const container = document.getElementById('fireResistanceContainer');
            if (fireResElement && container) {
                fireResElement.textContent = spec.fireResistance;
                container.style.display = 'block';
            }
        }
        
        // Face Side (for GGPUI)
        if (spec.faceSide) {
            const faceSideElement = document.getElementById('faceSide');
            const container = document.getElementById('faceSideContainer');
            if (faceSideElement && container) {
                faceSideElement.textContent = spec.faceSide;
                container.style.display = 'block';
            }
        }
        
        // Water Vapour Permeability (for GGPUI, GGRI)
        if (spec.waterVapourPermeability) {
            const vapourElement = document.getElementById('waterVapourPermeability');
            const container = document.getElementById('waterVapourPermeabilityContainer');
            if (vapourElement && container) {
                vapourElement.textContent = spec.waterVapourPermeability;
                container.style.display = 'block';
            }
        }
        
        // Sound (old format)
        if (spec.sound) {
            const soundElement = document.getElementById('sound');
            const container = document.getElementById('soundContainer');
            if (soundElement && container) {
                soundElement.textContent = spec.sound;
                container.style.display = 'block';
            }
        }
        
        if (spec.soundDetails) {
            const soundDetailsElement = document.getElementById('soundDetails');
            if (soundDetailsElement) {
                soundDetailsElement.textContent = spec.soundDetails;
            }
        }
        
        // Sound Absorption Lining (new format)
        if (spec.soundAbsorptionLining) {
            const absorptionElement = document.getElementById('soundAbsorptionLining');
            const container = document.getElementById('soundAbsorptionContainer');
            if (absorptionElement && container) {
                absorptionElement.textContent = spec.soundAbsorptionLining;
                container.style.display = 'block';
                // Hide old format if new format exists
                const soundContainer = document.getElementById('soundContainer');
                if (!spec.sound && soundContainer) {
                    soundContainer.style.display = 'none';
                }
            }
        }
        
        // Noise Reduction
        if (spec.noiseReduction) {
            const noiseElement = document.getElementById('noiseReduction');
            const container = document.getElementById('noiseReductionContainer');
            if (noiseElement && container) {
                noiseElement.textContent = spec.noiseReduction;
                container.style.display = 'block';
            }
        }
        
        // Temperature Resistance
        if (spec.temperatureResistance) {
            const tempElement = document.getElementById('temperatureResistance');
            const container = document.getElementById('temperatureContainer');
            if (tempElement && container) {
                tempElement.textContent = spec.temperatureResistance;
                container.style.display = 'block';
            }
        }
        
        // Compression Strength (for GGCGL)
        if (spec.comStrength) {
            const comStrengthElement = document.getElementById('comStrength');
            const container = document.getElementById('comStrengthContainer');
            if (comStrengthElement && container) {
                comStrengthElement.textContent = spec.comStrength;
                container.style.display = 'block';
            }
        }
        
        // EPDM Hardness
        if (spec.epdmHardness) {
            const epdmElement = document.getElementById('epdmHardness');
            const container = document.getElementById('epdmHardnessContainer');
            if (epdmElement && container) {
                epdmElement.textContent = spec.epdmHardness;
                container.style.display = 'block';
            }
        }
        
        // Fire Behaviour
        if (spec.fireBehaviour) {
            const fireElement = document.getElementById('fireBehaviour');
            const container = document.getElementById('fireBehaviourContainer');
            if (fireElement && container) {
                fireElement.textContent = spec.fireBehaviour;
                container.style.display = 'block';
            }
        }
        
        // Center Rib (for GGCP)
        if (spec.centerRib) {
            const centerRibDiv = document.getElementById('centerRibDetails');
            centerRibDiv.innerHTML = '';
            if (spec.centerRib.hardness) {
                const hardnessSpan = document.createElement('span');
                hardnessSpan.textContent = 'Hardness: ' + spec.centerRib.hardness;
                hardnessSpan.style.display = 'block';
                centerRibDiv.appendChild(hardnessSpan);
            }
            if (spec.centerRib.fireBehaviour) {
                const fireSpan = document.createElement('span');
                fireSpan.textContent = 'Fire Behaviour: ' + spec.centerRib.fireBehaviour;
                fireSpan.style.display = 'block';
                centerRibDiv.appendChild(fireSpan);
            }
            document.getElementById('centerRibContainer').style.display = 'block';
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

    // Render product table
    if (data.products && data.products.length > 0) {
        renderProductTable(data.products);
    }
}

function updateClampingRangeHeaders(firstProduct) {
    if (!firstProduct) return;

    const mainHeaderRow = document.querySelector('thead tr:first-child');
    const subHeaderRow = document.querySelector('tr.sub-header');
    
    if (!mainHeaderRow || !subHeaderRow) return;

    // Get header elements by ID
    const clampingRangeHeader = document.getElementById('clampingRangeHeader');
    const connectingHeader = document.getElementById('connectingHeader');
    const threadD2Header = document.getElementById('threadD2Header');
    const dimensionsHeader = document.getElementById('dimensionsHeader');
    const maxRecLoadHeader = document.getElementById('maxRecLoadHeader');
    const sHeader = document.getElementById('sHeader');
    const lockingHeader = document.getElementById('lockingHeader');
    const packSizeHeader = document.getElementById('packSizeHeader');
    
    // Get sub-header elements by ID
    const clampCol1 = document.getElementById('clampCol1');
    const clampCol2 = document.getElementById('clampCol2');
    const clampCol3 = document.getElementById('clampCol3');
    const connectSubHeader = document.getElementById('connectSubHeader');
    const dimPxS = document.getElementById('dimPxS');
    const dimW = document.getElementById('dimW');
    const dimH = document.getElementById('dimH');
    const dimC = document.getElementById('dimC');
    const dimT = document.getElementById('dimT');
    
    // Check if this is a "forTube" type product (like GGRR)
    const hasForTube = firstProduct.hasOwnProperty('forTube');
    const hasClampingRange = firstProduct.hasOwnProperty('clampingRange');
    const hasSize = firstProduct.hasOwnProperty('size');
    const hasGeneralized = firstProduct.hasOwnProperty('generalized');
    const hasThread = firstProduct.hasOwnProperty('thread');
    const hasHeight = firstProduct.hasOwnProperty('height');
    const hasPipeOuterDia = firstProduct.hasOwnProperty('pipeOuterDia');
    const hasLocking = firstProduct.hasOwnProperty('locking');
    const hasConnecting = firstProduct.hasOwnProperty('connecting');
    const hasType = firstProduct.hasOwnProperty('type');
    const hasMaterial = firstProduct.hasOwnProperty('material');
    const hasLength = firstProduct.hasOwnProperty('length');
    
    // Handle GGID type products (has type + material object + length, no size/clampingRange/forTube)
    if (hasType && hasMaterial && hasLength && typeof firstProduct.material === 'object' && !hasSize && !hasClampingRange && !hasForTube) {
        // Update main header to "Type" with 1 column
        if (clampingRangeHeader) {
            clampingRangeHeader.textContent = 'Type';
            clampingRangeHeader.setAttribute('colspan', '1');
        }
        
        // Show only first column for Type
        if (clampCol1) {
            clampCol1.textContent = 'Type L';
            clampCol1.style.display = '';
        }
        if (clampCol2) clampCol2.style.display = 'none';
        if (clampCol3) clampCol3.style.display = 'none';
        
        // Use Connecting Thread column for "Material"
        if (connectingHeader) {
            connectingHeader.innerHTML = 'Material';
            connectingHeader.setAttribute('rowspan', '1');
            connectingHeader.style.display = '';
        }
        if (connectSubHeader) {
            connectSubHeader.textContent = 'P x S';
            connectSubHeader.style.display = '';
        }
        
        // Use thread D2 column for "Length"
        if (threadD2Header) {
            threadD2Header.innerHTML = 'Length';
            threadD2Header.setAttribute('rowspan', '1');
            threadD2Header.style.display = '';
        }
        
        // Hide dimensions header and all dimension columns
        if (dimensionsHeader) {
            dimensionsHeader.style.display = 'none';
        }
        
        // Use dimPxS for Length sub-header L[mm]
        if (dimPxS) {
            dimPxS.textContent = 'L[mm]';
            dimPxS.style.display = '';
        }
        if (dimW) dimW.style.display = 'none';
        if (dimH) dimH.style.display = 'none';
        if (dimC) dimC.style.display = 'none';
        if (dimT) dimT.style.display = 'none';
        
        // Hide S column header
        if (sHeader) {
            sHeader.style.display = 'none';
        }
        
        // Show Pack Size header
        if (packSizeHeader) {
            packSizeHeader.style.display = '';
        }
        
        // Show Max.Rec.Load header
        if (maxRecLoadHeader) {
            maxRecLoadHeader.innerHTML = 'Max. Rec.<br>Load [N]';
            maxRecLoadHeader.style.display = '';
        }
        
        // Hide Locking header
        if (lockingHeader) {
            lockingHeader.style.display = 'none';
        }
        
        return;
    }
    
    // Handle GGWM type products (has type + material object, no size/clampingRange/forTube)
    if (hasType && hasMaterial && typeof firstProduct.material === 'object' && !hasSize && !hasClampingRange && !hasForTube) {
        // Update main header to "Type" with 1 column
        if (clampingRangeHeader) {
            clampingRangeHeader.textContent = 'Type';
            clampingRangeHeader.setAttribute('colspan', '1');
        }
        
        // Show only first column for Type
        if (clampCol1) {
            clampCol1.textContent = 'Type A';
            clampCol1.style.display = '';
        }
        if (clampCol2) clampCol2.style.display = 'none';
        if (clampCol3) clampCol3.style.display = 'none';
        
        // Use Connecting Thread column for "Material"
        if (connectingHeader) {
            connectingHeader.innerHTML = 'Material';
            connectingHeader.setAttribute('rowspan', '1');
            connectingHeader.style.display = '';
        }
        if (connectSubHeader) {
            connectSubHeader.textContent = 'P x S';
            connectSubHeader.style.display = '';
        }
        
        // Hide thread D2 column
        if (threadD2Header) {
            threadD2Header.style.display = 'none';
        }
        
        // Hide dimensions header and all dimension columns
        if (dimensionsHeader) {
            dimensionsHeader.style.display = 'none';
        }
        if (dimPxS) dimPxS.style.display = 'none';
        if (dimW) dimW.style.display = 'none';
        if (dimH) dimH.style.display = 'none';
        if (dimC) dimC.style.display = 'none';
        if (dimT) dimT.style.display = 'none';
        
        // Hide S column header
        if (sHeader) {
            sHeader.style.display = 'none';
        }
        
        // Show Pack Size header
        if (packSizeHeader) {
            packSizeHeader.style.display = '';
        }
        
        // Show Max.Rec.Load header
        if (maxRecLoadHeader) {
            maxRecLoadHeader.innerHTML = 'Max. Rec.<br>Load [N]';
            maxRecLoadHeader.style.display = '';
        }
        
        // Hide Locking header
        if (lockingHeader) {
            lockingHeader.style.display = 'none';
        }
        
        return;
    }
    
    // Handle GGDL type products (has size + connecting object + dimensions with L field)
    if (hasSize && hasConnecting && !hasClampingRange && !hasForTube && !hasGeneralized && !hasHeight) {
        // Check if dimensions contain L field (GGDL specific)
        const dimFields = Object.keys(firstProduct.dimensions || {});
        if (dimFields.includes('L')) {
            // Update main header to "Size" with 1 column
            if (clampingRangeHeader) {
                clampingRangeHeader.textContent = 'Size';
                clampingRangeHeader.setAttribute('colspan', '1');
            }
            
            // Show only first column for Size [mm]
            if (clampCol1) {
                clampCol1.textContent = '[mm]';
                clampCol1.style.display = '';
            }
            if (clampCol2) clampCol2.style.display = 'none';
            if (clampCol3) clampCol3.style.display = 'none';
            
            // Show Connecting Thread column
            if (connectingHeader) {
                connectingHeader.innerHTML = 'Connecting<br>Thread';
                connectingHeader.setAttribute('rowspan', '2');
                connectingHeader.style.display = '';
            }
            if (connectSubHeader) {
                connectSubHeader.style.display = 'none';
            }
            
            // Update dimensions header to "Dimensions [mm]" with 5 columns
            if (dimensionsHeader) {
                dimensionsHeader.textContent = 'Dimensions [mm]';
                dimensionsHeader.setAttribute('colspan', '5');
            }
            
            // Show P x S, W, H', C, T columns (rename H to H' and L to T)
            if (dimPxS) {
                dimPxS.textContent = 'P x S';
                dimPxS.style.display = '';
            }
            if (dimW) {
                dimW.textContent = 'W';
                dimW.style.display = '';
            }
            if (dimH) {
                dimH.textContent = 'H\'';
                dimH.style.display = '';
            }
            if (dimC) {
                dimC.textContent = 'C';
                dimC.style.display = '';
            }
            if (dimT) {
                dimT.textContent = 'T';
                dimT.style.display = '';
            }
            
            // Show S column header
            if (sHeader) {
                sHeader.style.display = '';
            }
            
            // Show Pack Size header
            if (packSizeHeader) {
                packSizeHeader.style.display = '';
            }
            
            // Show Max.Rec.Load header
            if (maxRecLoadHeader) {
                maxRecLoadHeader.innerHTML = 'Max. Rec.<br>Load [N]';
                maxRecLoadHeader.style.display = '';
            }
            
            // Hide Locking header
            if (lockingHeader) {
                lockingHeader.style.display = 'none';
            }
            
            return;
        }
    }
    
    // Handle GGDM type products (has size + dimensions with Ø, no connecting object)
    if (hasSize && !hasConnecting && !hasClampingRange && !hasForTube && !hasGeneralized && !hasHeight) {
        const dimFields = Object.keys(firstProduct.dimensions || {});
        if (dimFields.includes('Ø') && dimFields.includes('PxS')) {
            // Update main header to "Size" with 1 column
            if (clampingRangeHeader) {
                clampingRangeHeader.textContent = 'Size';
                clampingRangeHeader.setAttribute('colspan', '1');
            }
            
            // Show only first column for Size [mm]
            if (clampCol1) {
                clampCol1.textContent = '[mm]';
                clampCol1.style.display = '';
            }
            if (clampCol2) clampCol2.style.display = 'none';
            if (clampCol3) clampCol3.style.display = 'none';
            
            // Hide Connecting Thread column
            if (connectingHeader) {
                connectingHeader.style.display = 'none';
            }
            if (connectSubHeader) {
                connectSubHeader.style.display = 'none';
            }
            
            // Update dimensions header to "Dimensions [mm]" with 5 columns
            if (dimensionsHeader) {
                dimensionsHeader.textContent = 'Dimensions [mm]';
                dimensionsHeader.setAttribute('colspan', '5');
            }
            
            // Show P x S, W, H', C, Ø columns
            if (dimPxS) {
                dimPxS.textContent = 'P x S';
                dimPxS.style.display = '';
            }
            if (dimW) {
                dimW.textContent = 'W';
                dimW.style.display = '';
            }
            if (dimH) {
                dimH.textContent = 'H\'';
                dimH.style.display = '';
            }
            if (dimC) {
                dimC.textContent = 'C';
                dimC.style.display = '';
            }
            if (dimT) {
                dimT.textContent = 'Ø';
                dimT.style.display = '';
            }
            
            // Hide S column header
            if (sHeader) {
                sHeader.style.display = 'none';
            }
            
            // Show Pack Size header
            if (packSizeHeader) {
                packSizeHeader.style.display = '';
            }
            
            // Show Max.Rec.Load header
            if (maxRecLoadHeader) {
                maxRecLoadHeader.innerHTML = 'Max. Rec.<br>Load [N]';
                maxRecLoadHeader.style.display = '';
            }
            
            // Hide Locking header
            if (lockingHeader) {
                lockingHeader.style.display = 'none';
            }
            
            return;
        }
    }
    
    // Handle GGCGL type products (has pipeOuterDia + thread object + locking)
    if (hasPipeOuterDia && hasThread && hasLocking && typeof firstProduct.thread === 'object') {
        // Update main header to "Pipe Outer Dia. D" with 3 columns
        if (clampingRangeHeader) {
            clampingRangeHeader.textContent = 'Pipe Outer Dia. D';
            clampingRangeHeader.setAttribute('colspan', '3');
        }
        
        // Show all 3 columns for Pipe Outer Dia
        if (clampCol1) {
            clampCol1.textContent = 'DN';
            clampCol1.style.display = '';
        }
        if (clampCol2) {
            clampCol2.textContent = 'D[mm]';
            clampCol2.style.display = '';
        }
        if (clampCol3) {
            clampCol3.textContent = '["]';
            clampCol3.style.display = '';
        }
        
        // Update Connecting Thread column to "Thread" with sub-column
        if (connectingHeader) {
            connectingHeader.textContent = 'Thread';
            connectingHeader.setAttribute('rowspan', '1');
            connectingHeader.style.display = '';
        }
        
        // Determine thread field names (D1/D2 for GGCGL, P1/P2 for GGCGS)
        const threadKeys = Object.keys(firstProduct.thread || {});
        const hasP1P2 = threadKeys.includes('P1') && threadKeys.includes('P2');
        const hasD1D2 = threadKeys.includes('D1') && threadKeys.includes('D2');
        
        // Show thread sub-header (P1 or D1)
        if (connectSubHeader) {
            connectSubHeader.textContent = hasP1P2 ? 'P1' : 'D1';
            connectSubHeader.style.display = '';
        }
        
        // Show thread second column header (P2 or D2)
        if (threadD2Header) {
            threadD2Header.textContent = hasP1P2 ? 'P2' : 'D2';
            threadD2Header.style.display = '';
        }
        
        // Update dimensions header to "Dimensions [mm]" with 4 columns
        if (dimensionsHeader) {
            dimensionsHeader.textContent = 'Dimensions [mm]';
            dimensionsHeader.setAttribute('colspan', '4');
        }
        
        // Show W, H', P, S columns
        if (dimPxS) {
            dimPxS.textContent = 'W';
            dimPxS.style.display = '';
        }
        if (dimW) {
            dimW.textContent = 'H\'';
            dimW.style.display = '';
        }
        if (dimH) {
            dimH.textContent = 'P';
            dimH.style.display = '';
        }
        if (dimC) {
            dimC.textContent = 'S';
            dimC.style.display = '';
        }
        if (dimT) dimT.style.display = 'none';
        
        // Hide S column header (using S in dimensions instead)
        if (sHeader) {
            sHeader.style.display = 'none';
        }
        
        // Show Locking header
        if (lockingHeader) {
            lockingHeader.style.display = '';
        }
        
        // Keep Max.Rec.Load header
        if (maxRecLoadHeader) {
            maxRecLoadHeader.style.display = '';
        }
        
        return;
    }
    
    // Handle GGRI/GGPUI type products (has pipeOuterDia but no thread object)
    if (hasPipeOuterDia) {
        // Update main header to "Pipe Outer Dia. D" with 3 columns
        if (clampingRangeHeader) {
            clampingRangeHeader.textContent = 'Pipe Outer Dia. D';
            clampingRangeHeader.setAttribute('colspan', '3');
        }
        
        // Show all 3 columns for Pipe Outer Dia
        if (clampCol1) {
            clampCol1.textContent = 'DN';
            clampCol1.style.display = '';
        }
        if (clampCol2) {
            clampCol2.textContent = 'D[mm]';
            clampCol2.style.display = '';
        }
        if (clampCol3) {
            clampCol3.textContent = '["]';
            clampCol3.style.display = '';
        }
        
        // Hide Connecting Thread column
        if (connectingHeader) {
            connectingHeader.style.display = 'none';
        }
        if (connectSubHeader) {
            connectSubHeader.style.display = 'none';
        }
        
        // Hide S column
        if (sHeader) {
            sHeader.style.display = 'none';
        }
        
        // Update dimensions header to "Dimensions [mm]" with 2 columns
        if (dimensionsHeader) {
            dimensionsHeader.textContent = 'Dimensions [mm]';
            dimensionsHeader.setAttribute('colspan', '2');
        }
        
        // Check if product has P or T/L dimensions
        const dimFields = Object.keys(firstProduct.dimensions || {});
        
        // Show appropriate dimension columns based on available fields
        if (dimFields.includes('P')) {
            // GGRI type: P and T
            if (dimPxS) {
                dimPxS.textContent = 'P';
                dimPxS.style.display = '';
            }
            if (dimW) {
                dimW.textContent = 'T';
                dimW.style.display = '';
            }
        } else if (dimFields.includes('T') && dimFields.includes('L')) {
            // GGPUI type: T and L
            if (dimPxS) {
                dimPxS.textContent = 'T';
                dimPxS.style.display = '';
            }
            if (dimW) {
                dimW.textContent = 'L';
                dimW.style.display = '';
            }
        }
        
        if (dimH) dimH.style.display = 'none';
        if (dimC) dimC.style.display = 'none';
        if (dimT) dimT.style.display = 'none';
        
        // Update Max.Rec.Load header
        if (maxRecLoadHeader) {
            maxRecLoadHeader.innerHTML = 'Max. Rec.<br>Load [N]';
            maxRecLoadHeader.style.display = '';
        }
        
        return;
    }
    
    // Handle GGUB type products (has size with 3 fields + thread + height)
    if (hasSize && hasThread && hasHeight && !hasClampingRange && !hasForTube) {
        // Update main header to "Size" with 3 columns
        if (clampingRangeHeader) {
            clampingRangeHeader.textContent = 'Size';
            clampingRangeHeader.setAttribute('colspan', '3');
        }
        
        // Show all 3 size columns
        if (clampCol1) {
            clampCol1.textContent = 'mm';
            clampCol1.style.display = '';
        }
        if (clampCol2) {
            clampCol2.textContent = '[inch]';
            clampCol2.style.display = '';
        }
        if (clampCol3) {
            clampCol3.textContent = 'DN';
            clampCol3.style.display = '';
        }
        
        // Use Connecting Thread column for "Thread"
        if (connectingHeader) {
            connectingHeader.innerHTML = 'Thread';
            connectingHeader.style.display = '';
        }
        if (connectSubHeader) {
            connectSubHeader.style.display = 'none';
        }
        
        // Hide S column
        if (sHeader) {
            sHeader.style.display = 'none';
        }
        
        // Update dimensions header to "Height"
        if (dimensionsHeader) {
            dimensionsHeader.textContent = 'Height';
            dimensionsHeader.setAttribute('colspan', '1');
            dimensionsHeader.setAttribute('rowspan', '2');
        }
        
        // Hide all dimension sub-headers since we merged them into main header
        if (dimPxS) dimPxS.style.display = 'none';
        if (dimW) dimW.style.display = 'none';
        if (dimH) dimH.style.display = 'none';
        if (dimC) dimC.style.display = 'none';
        if (dimT) dimT.style.display = 'none';
        
        // Hide Max.Rec.Load column
        if (maxRecLoadHeader) {
            maxRecLoadHeader.style.display = 'none';
        }
        
        return;
    }
    
    // Handle GGSMU type products (has generalized + size, no clampingRange/forTube)
    if (hasGeneralized && hasSize && !hasClampingRange && !hasForTube) {
        // Update main header to "Size" with 2 columns
        if (clampingRangeHeader) {
            clampingRangeHeader.textContent = 'Size';
            clampingRangeHeader.setAttribute('colspan', '2');
        }
        
        // Show two columns for Size (Generalized and Size)
        if (clampCol1) {
            clampCol1.textContent = 'Generalized';
            clampCol1.style.display = '';
        }
        if (clampCol2) {
            clampCol2.textContent = 'D[mm]';
            clampCol2.style.display = '';
        }
        if (clampCol3) clampCol3.style.display = 'none';
        
        // Hide Connecting Thread column
        if (connectingHeader) {
            connectingHeader.style.display = 'none';
        }
        if (connectSubHeader) {
            connectSubHeader.style.display = 'none';
        }
        
        // Hide S column
        if (sHeader) {
            sHeader.style.display = 'none';
        }
        
        // Update dimensions header to "Material"
        if (dimensionsHeader) {
            dimensionsHeader.textContent = 'Material';
            dimensionsHeader.setAttribute('colspan', '1');
        }
        
        // Show only first dimension column for material
        if (dimPxS) {
            dimPxS.textContent = 'wλt[mm]';
            dimPxS.style.display = '';
        }
        if (dimW) dimW.style.display = 'none';
        if (dimH) dimH.style.display = 'none';
        if (dimC) dimC.style.display = 'none';
        if (dimT) dimT.style.display = 'none';
        
        // Show Max.Rec.Load column (but it's called maxRec in data)
        if (maxRecLoadHeader) {
            maxRecLoadHeader.style.display = '';
        }
        
        return;
    }
    
    // Handle "Size" type products (like GGSM - has size but no generalized)
    if (hasSize && !hasGeneralized && !hasClampingRange && !hasForTube) {
        // Update main header to "Size" with 1 column
        if (clampingRangeHeader) {
            clampingRangeHeader.textContent = 'Size';
            clampingRangeHeader.setAttribute('colspan', '1');
        }
        
        // Show only first column for Size
        if (clampCol1) {
            clampCol1.textContent = '[mm]';
            clampCol1.style.display = '';
        }
        if (clampCol2) clampCol2.style.display = 'none';
        if (clampCol3) clampCol3.style.display = 'none';
        
        // Hide Connecting Thread column
        if (connectingHeader) {
            connectingHeader.style.display = 'none';
        }
        if (connectSubHeader) {
            connectSubHeader.style.display = 'none';
        }
        
        // Hide S column
        if (sHeader) {
            sHeader.style.display = 'none';
        }
        
        // Update dimensions based on available fields
        const dimFields = Object.keys(firstProduct.dimensions || {});
        let dimCount = 0;
        
        // Map GGSM dimensions: PxS, B, B1, Ø (maps to G), H
        if (dimFields.includes('PxS')) {
            if (dimPxS) {
                dimPxS.textContent = 'P x S';
                dimPxS.style.display = '';
                dimCount++;
            }
        } else if (dimPxS) dimPxS.style.display = 'none';
        
        // Reuse W column for B
        if (dimFields.includes('B')) {
            if (dimW) {
                dimW.textContent = 'B';
                dimW.style.display = '';
                dimCount++;
            }
        } else if (dimW) dimW.style.display = 'none';
        
        // Reuse H column for B1
        if (dimFields.includes('B1')) {
            if (dimH) {
                dimH.textContent = 'B1';
                dimH.style.display = '';
                dimCount++;
            }
        } else if (dimH) dimH.style.display = 'none';
        
        // Reuse C column for Ø/G
        if (dimFields.includes('Ø') || dimFields.includes('G')) {
            if (dimC) {
                dimC.textContent = 'G';
                dimC.style.display = '';
                dimCount++;
            }
        } else if (dimC) dimC.style.display = 'none';
        
        // Reuse T column for H
        if (dimFields.includes('H')) {
            if (dimT) {
                dimT.textContent = 'H';
                dimT.style.display = '';
                dimCount++;
            }
        } else if (dimT) dimT.style.display = 'none';
        
        // Update dimensions header colspan
        if (dimensionsHeader) {
            dimensionsHeader.setAttribute('colspan', dimCount.toString());
        }
        
        // Hide Max.Rec.Load column
        if (maxRecLoadHeader) {
            maxRecLoadHeader.style.display = 'none';
        }
        
        return;
    }
    
    // Handle "For Tube" type products
    if (hasForTube) {
        // Update main header to "For Tube" with 3 columns
        if (clampingRangeHeader) {
            clampingRangeHeader.textContent = 'For Tube';
            clampingRangeHeader.setAttribute('colspan', '3');
        }
        
        // Show all 3 clamping columns for For Tube
        if (clampCol1) {
            clampCol1.textContent = 'DN';
            clampCol1.style.display = '';
        }
        if (clampCol2) {
            clampCol2.textContent = 'D[mm]';
            clampCol2.style.display = '';
        }
        if (clampCol3) {
            clampCol3.textContent = '[inch]';
            clampCol3.style.display = '';
        }
        
        // Hide Connecting Thread column
        if (connectingHeader) {
            connectingHeader.style.display = 'none';
        }
        if (connectSubHeader) {
            connectSubHeader.style.display = 'none';
        }
        
        // Show S header for forTube
        if (sHeader) {
            sHeader.style.display = '';
        }
        
        // Update dimensions based on available fields
        const dimFields = Object.keys(firstProduct.dimensions || {});
        let dimCount = 0;
        
        if (dimFields.includes('PxS')) {
            if (dimPxS) dimPxS.style.display = '';
            dimCount++;
        } else if (dimPxS) dimPxS.style.display = 'none';
        
        if (dimFields.includes('W')) {
            if (dimW) dimW.style.display = '';
            dimCount++;
        } else if (dimW) dimW.style.display = 'none';
        
        if (dimFields.includes('H')) {
            if (dimH) dimH.style.display = '';
            dimCount++;
        } else if (dimH) dimH.style.display = 'none';
        
        if (dimFields.includes('C') || dimFields.includes('D')) {
            if (dimC) {
                dimC.textContent = dimFields.includes('D') ? 'D' : 'C';
                dimC.style.display = '';
                dimCount++;
            }
        } else if (dimC) dimC.style.display = 'none';
        
        if (dimFields.includes('T')) {
            if (dimT) dimT.style.display = '';
            dimCount++;
        } else if (dimT) dimT.style.display = 'none';
        
        // Update dimensions header colspan
        if (dimensionsHeader) {
            dimensionsHeader.setAttribute('colspan', dimCount.toString());
        }
        
        // Hide Max.Rec.Load column if product doesn't have it
        if (!firstProduct.maxRecLoad && maxRecLoadHeader) {
            maxRecLoadHeader.style.display = 'none';
        }
        
        return;
    }
    
    // Handle regular clamping range products
    if (!hasClampingRange) return;
    
    const clampingRange = firstProduct.clampingRange;
    const fields = Object.keys(clampingRange);
    
    // Reset to 2 columns for clamping range
    if (clampingRangeHeader) {
        clampingRangeHeader.textContent = 'Clamping Range';
        clampingRangeHeader.setAttribute('colspan', '2');
    }
    
    // Hide the third clamping column
    if (clampCol3) clampCol3.style.display = 'none';
    
    // Show Connecting Thread column
    if (connectingHeader) {
        connectingHeader.style.display = '';
    }
    
    // Show Max.Rec.Load column
    if (maxRecLoadHeader) {
        maxRecLoadHeader.style.display = '';
    }
    
    // Show S header for regular products
    if (sHeader) {
        sHeader.style.display = '';
    }
    
    if (fields.length >= 2) {
        // Update first clamping range header
        if (clampCol1) {
            if (fields.includes('DN')) {
                clampCol1.textContent = 'DN';
            } else if (fields.includes('D(mm)')) {
                clampCol1.textContent = 'Ø[mm]';
            } else if (fields.includes('mm')) {
                clampCol1.textContent = 'D[mm]';
            }
            clampCol1.style.display = '';
        }
        
        // Update second clamping range header
        if (clampCol2) {
            if (fields.includes('Ømm') || fields.includes('Ø[mm]')) {
                clampCol2.textContent = 'Ø[mm]';
            } else if (fields.includes('inch')) {
                clampCol2.textContent = '[inch]';
            }
            clampCol2.style.display = '';
        }
    }
    
    // Check if product has flangeHead/flageHead field
    const hasFlangeHead = firstProduct.flageHead || firstProduct.flangeHead;
    
    if (hasFlangeHead && connectingHeader) {
        // Replace "Connecting Thread" with "Flange Head"
        connectingHeader.innerHTML = 'Flange Head';
        
        // Update sub-header for flange head
        if (connectSubHeader) {
            connectSubHeader.textContent = 'G [inch]';
            connectSubHeader.style.display = '';
        }
    } else {
        // Reset to "Connecting Thread"
        if (connectingHeader) {
            connectingHeader.innerHTML = 'Connecting<br>Thread';
        }
        if (connectSubHeader) {
            connectSubHeader.style.display = 'none';
        }
    }
    
    // Reset all dimension columns to visible
    if (dimPxS) dimPxS.style.display = '';
    if (dimW) dimW.style.display = '';
    if (dimH) dimH.style.display = '';
    if (dimC) dimC.style.display = '';
    if (dimT) dimT.style.display = '';
    
    // Check dimension fields to update headers dynamically
    if (firstProduct.dimensions) {
        const dimFields = Object.keys(firstProduct.dimensions);
        let dimCount = dimFields.length;
        
        if (dimC && (dimFields.includes('C') || dimFields.includes('D'))) {
            dimC.textContent = dimFields.includes('D') ? 'D' : 'C';
        }
        
        // Update colspan for dimensions
        if (dimensionsHeader) {
            dimensionsHeader.setAttribute('colspan', '5'); // Reset to default
        }
    }
}

function renderProductTable(products) {
    const tbody = document.getElementById('productTableBody');
    tbody.innerHTML = '';

    if (!products || products.length === 0) return;
    
    // Check product type
    const hasForTube = products[0].hasOwnProperty('forTube');
    const hasSize = products[0].hasOwnProperty('size');
    const hasClampingRange = products[0].hasOwnProperty('clampingRange');
    const hasMaxRecLoad = products[0].hasOwnProperty('maxRecLoad');
    const hasMaxRec = products[0].hasOwnProperty('maxRec');
    const hasS = products[0].hasOwnProperty('S') || products[0].hasOwnProperty('MStud');
    const hasGeneralized = products[0].hasOwnProperty('generalized');
    const hasThread = products[0].hasOwnProperty('thread');
    const hasHeight = products[0].hasOwnProperty('height');
    const hasPipeOuterDia = products[0].hasOwnProperty('pipeOuterDia');
    const hasLocking = products[0].hasOwnProperty('locking');
    const hasConnecting = products[0].hasOwnProperty('connecting');
    const hasType = products[0].hasOwnProperty('type');
    const hasMaterial = products[0].hasOwnProperty('material');
    const hasLength = products[0].hasOwnProperty('length');

    products.forEach(product => {
        const row = document.createElement('tr');
        
        // Handle GGID type products (has type + material object + length, no size/clampingRange/forTube)
        if (hasType && hasMaterial && hasLength && typeof product.material === 'object' && !hasSize && !hasClampingRange && !hasForTube) {
            let html = `
                <td>${product.productCode || ''}</td>
                <td>${product.type || ''}</td>
                <td>${product.material?.PxS || ''}</td>
                <td>${product.length?.Lmm || ''}</td>
                <td>${product.packSize || ''}</td>
                <td>${product.maxRec?.loadN || ''}</td>
            `;
            
            row.innerHTML = html;
            tbody.appendChild(row);
            return;
        }
        
        // Handle GGWM type products (has type + material object, no size/clampingRange/forTube)
        if (hasType && hasMaterial && typeof product.material === 'object' && !hasSize && !hasClampingRange && !hasForTube) {
            let html = `
                <td>${product.productCode || ''}</td>
                <td>${product.type || ''}</td>
                <td>${product.material?.PxS || ''}</td>
                <td>${product.packSize || ''}</td>
                <td>${product.maxRec?.loadN || ''}</td>
            `;
            
            row.innerHTML = html;
            tbody.appendChild(row);
            return;
        }
        
        // Handle GGDL type products (has size + connecting object + dimensions with L field)
        if (hasSize && hasConnecting && !hasClampingRange && !hasForTube && !hasGeneralized && !hasHeight) {
            const dims = product.dimensions || {};
            const dimFields = Object.keys(dims);
            
            if (dimFields.includes('L')) {
                let html = `
                    <td>${product.productCode || ''}</td>
                    <td>${product.size?.mm || ''}</td>
                    <td>${product.connecting?.thread || ''}</td>
                    <td>${dims.PxS || ''}</td>
                    <td>${dims.W || ''}</td>
                    <td>${dims.H || ''}</td>
                    <td>${dims.C || ''}</td>
                    <td>${dims.L || ''}</td>
                    <td>${dims.S || ''}</td>
                    <td>${product.packSize || ''}</td>
                    <td>${product.maxRec?.loadN || ''}</td>
                `;
                
                row.innerHTML = html;
                tbody.appendChild(row);
                return;
            }
        }
        
        // Handle GGDM type products (has size + dimensions with Ø, no connecting object)
        if (hasSize && !hasConnecting && !hasClampingRange && !hasForTube && !hasGeneralized && !hasHeight) {
            const dims = product.dimensions || {};
            const dimFields = Object.keys(dims);
            
            if (dimFields.includes('Ø') && dimFields.includes('PxS')) {
                let html = `
                    <td>${product.productCode || ''}</td>
                    <td>${product.size?.mm || ''}</td>
                    <td>${dims.PxS || ''}</td>
                    <td>${dims.W || ''}</td>
                    <td>${dims.H || ''}</td>
                    <td>${dims.C || ''}</td>
                    <td>${dims.Ø || ''}</td>
                    <td>${product.packSize || ''}</td>
                    <td>${product.maxRec?.loadN || ''}</td>
                `;
                
                row.innerHTML = html;
                tbody.appendChild(row);
                return;
            }
        }
        
        // Handle GGCGL/GGCGS type products (has pipeOuterDia + thread object + locking)
        if (hasPipeOuterDia && hasThread && hasLocking && typeof product.thread === 'object') {
            const dims = product.dimensions || {};
            
            // Support both D1/D2 (GGCGL) and P1/P2 (GGCGS) naming
            const thread1 = product.thread?.P1 || product.thread?.D1 || '';
            const thread2 = product.thread?.P2 || product.thread?.D2 || '';
            
            let html = `
                <td>${product.productCode || ''}</td>
                <td>${product.pipeOuterDia?.DN || ''}</td>
                <td>${product.pipeOuterDia?.Dmm || ''}</td>
                <td>${product.pipeOuterDia?.inch || ''}</td>
                <td>${thread1}</td>
                <td>${thread2}</td>
                <td>${dims.W || ''}</td>
                <td>${dims.H || ''}</td>
                <td>${dims.P || ''}</td>
                <td>${dims.S || ''}</td>
                <td>${product.locking?.screw || ''}</td>
                <td>${product.maxRec?.loadN || ''}</td>
                <td>${product.packSize || ''}</td>
            `;
            
            row.innerHTML = html;
        }
        // Handle GGRI/GGPUI type products (has pipeOuterDia but no thread object)
        else if (hasPipeOuterDia) {
            // Determine dimension fields (P/T for GGRI, T/L for GGPUI)
            const dim1 = product.dimensions?.P || product.dimensions?.T || '';
            const dim2 = product.dimensions?.T && product.dimensions?.P ? product.dimensions.T : product.dimensions?.L || '';
            
            let html = `
                <td>${product.productCode || ''}</td>
                <td>${product.pipeOuterDia?.DN || ''}</td>
                <td>${product.pipeOuterDia?.Dmm || ''}</td>
                <td>${product.pipeOuterDia?.inch || ''}</td>
                <td>${dim1}</td>
                <td>${dim2}</td>
                <td>${product.packSize || ''}</td>
                <td>${product.maxRec?.loadN || ''}</td>
            `;
            
            row.innerHTML = html;
        }
        // Handle GGUB type products (has size with 3 fields + thread + height)
        else if (hasSize && hasThread && hasHeight && !hasClampingRange && !hasForTube) {
            let html = `
                <td>${product.productCode || ''}</td>
                <td>${product.size?.mm || ''}</td>
                <td>${product.size?.inch || ''}</td>
                <td>${product.size?.DN || ''}</td>
                <td>${product.thread?.G || ''}</td>
                <td>${product.height?.H || ''}</td>
                <td>${product.packSize || ''}</td>
            `;
            
            row.innerHTML = html;
        }
        // Handle GGSMU type products (has generalized field)
        else if (hasGeneralized && hasSize && !hasClampingRange && !hasForTube) {
            let html = `
                <td>${product.productCode || ''}</td>
                <td>${product.generalized || ''}</td>
                <td>${product.size || ''}</td>
                <td>${product.material || ''}</td>
                <td>${product.packSize || ''}</td>
                <td>${product.maxRec || ''}</td>
            `;
            
            row.innerHTML = html;
        }
        // Handle "Size" type products (like GGSM)
        else if (hasSize && !hasClampingRange && !hasForTube && !hasGeneralized) {
            const dims = product.dimensions || {};
            
            let html = `
                <td>${product.productCode || ''}</td>
                <td>${product.size?.mm || ''}</td>
                <td>${dims.PxS || ''}</td>
                <td>${dims.B || ''}</td>
                <td>${dims.B1 || ''}</td>
                <td>${dims.Ø || dims.G || ''}</td>
                <td>${dims.H || ''}</td>
                <td>${product.packSize || ''}</td>
            `;
            
            row.innerHTML = html;
        }
        // Handle "For Tube" type products (like GGRR)
        else if (hasForTube) {
            // Get dimension values
            const dims = product.dimensions || {};
            
            let html = `
                <td>${product.productCode || ''}</td>
                <td>${product.DN || ''}</td>
                <td>${product.forTube?.mm || ''}</td>
                <td>${product.forTube?.inch || ''}</td>
                <td>${dims.PxS || ''}</td>
                <td>${dims.W || ''}</td>
                <td>${dims.H || ''}</td>
            `;
            
            // Add C and T columns only if they exist
            if (dims.hasOwnProperty('C') || dims.hasOwnProperty('D')) {
                html += `<td>${dims.C || dims.D || ''}</td>`;
            }
            if (dims.hasOwnProperty('T')) {
                html += `<td>${dims.T || ''}</td>`;
            }
            
            html += `
                <td>${product.S || product.MStud || ''}</td>
                <td>${product.packSize || ''}</td>
            `;
            
            // Only add Max.Rec.Load if it exists
            if (hasMaxRecLoad) {
                html += `<td>${product.maxRecLoad || ''}</td>`;
            }
            
            row.innerHTML = html;
        } 
        // Handle regular clamping range products
        else {
            // Get clamping range values dynamically
            let clampingCol1 = '';
            let clampingCol2 = '';
            
            if (product.clampingRange) {
                const fields = Object.keys(product.clampingRange);
                
                // First column: DN, D(mm), or mm
                if (product.clampingRange.DN) {
                    clampingCol1 = product.clampingRange.DN;
                } else if (product.clampingRange['D(mm)']) {
                    clampingCol1 = product.clampingRange['D(mm)'];
                } else if (product.clampingRange.mm) {
                    clampingCol1 = product.clampingRange.mm;
                }
                
                // Second column: Ømm/Ø[mm] or inch
                if (product.clampingRange['Ømm'] || product.clampingRange['Ø[mm]']) {
                    clampingCol2 = product.clampingRange['Ømm'] || product.clampingRange['Ø[mm]'];
                } else if (product.clampingRange.inch) {
                    clampingCol2 = product.clampingRange.inch;
                }
            }
            
            // Get connecting thread or flange head
            let connectingValue = '';
            if (product.flageHead || product.flangeHead) {
                // Extract just the value after "G (inch): "
                const flangeText = product.flageHead || product.flangeHead;
                connectingValue = flangeText.replace(/^G\s*\(inch\):\s*/i, '');
            } else {
                connectingValue = product.connectingSlotØ || product.connectingThread || '';
            }
            
            // Get dimension values dynamically
            const dims = product.dimensions || {};
            const dimValues = [
                dims.PxS || '',
                dims.W || '',
                dims.H || '',
                dims.C || dims.D || '',  // Use D if C doesn't exist
                dims.T || ''
            ];
            
            row.innerHTML = `
                <td>${product.productCode || ''}</td>
                <td>${clampingCol1}</td>
                <td>${clampingCol2}</td>
                <td>${connectingValue}</td>
                <td>${dimValues[0]}</td>
                <td>${dimValues[1]}</td>
                <td>${dimValues[2]}</td>
                <td>${dimValues[3]}</td>
                <td>${dimValues[4]}</td>
                <td>${product.S || product.MStud || ''}</td>
                <td>${product.packSize || ''}</td>
                <td>${product.maxRecLoad || ''}</td>
            `;
        }
        
        tbody.appendChild(row);
    });
}

// Load data when page loads
document.addEventListener('DOMContentLoaded', loadCatalogData);
