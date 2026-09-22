// Table utility functions for responsive tables and dynamic card numbers

// Make tables mobile responsive by adding data-label attributes
function setupResponsiveTables() {
    // Handle technical-table class tables
    const technicalTables = document.querySelectorAll('.technical-table');
    technicalTables.forEach(table => {
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            cells.forEach((cell, index) => {
                if (headers[index]) {
                    cell.setAttribute('data-label', headers[index]);
                }
            });
        });
    });
    
    // Handle accessories-table class tables
    const accessoriesTables = document.querySelectorAll('.accessories-table');
    accessoriesTables.forEach(table => {
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
        const rows = table.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            cells.forEach((cell, index) => {
                if (headers[index]) {
                    cell.setAttribute('data-label', headers[index]);
                }
            });
        });
    });
    
    // Handle any other tables that might be added later
    const allTables = document.querySelectorAll('table');
    allTables.forEach(table => {
        // Skip if already processed
        if (table.classList.contains('technical-table') || table.classList.contains('accessories-table')) {
            return;
        }
        
        const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent.trim());
        if (headers.length > 0) {
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const cells = row.querySelectorAll('td');
                cells.forEach((cell, index) => {
                    if (headers[index]) {
                        cell.setAttribute('data-label', headers[index]);
                    }
                });
            });
        }
    });
    
    console.log(`✅ Responsive data-labels added to ${technicalTables.length + accessoriesTables.length} tables`);
}

// Setup dynamic card number indicator on scroll
function setupDynamicCardNumbers() {
    if (window.innerWidth <= 768) {
        const tableContainers = document.querySelectorAll('.technical-table-container');
        
        tableContainers.forEach(container => {
            const table = container.querySelector('.technical-table');
            if (!table) return;
            
            const rows = Array.from(table.querySelectorAll('tbody tr'));
            if (rows.length === 0) return;
            
            // Create header indicator element
            const headerIndicator = document.createElement('div');
            headerIndicator.className = 'table-header-indicator';
            
            const cardNumber = document.createElement('div');
            cardNumber.className = 'card-number';
            cardNumber.textContent = '1';
            
            const productCode = document.createElement('div');
            productCode.className = 'product-code';
            
            // Get product code from the first row's second cell (Item Code)
            const firstRow = rows[0];
            if (firstRow) {
                const cells = firstRow.querySelectorAll('td');
                // Item code is usually in the second cell (index 1)
                if (cells.length > 1) {
                    const itemCode = cells[1].textContent.trim();
                    // Extract the product prefix (e.g., GMC, GM41, GGIP)
                    const match = itemCode.match(/^([A-Z]+\d*)/);
                    if (match) {
                        productCode.textContent = match[1];
                    }
                }
            }
            
            headerIndicator.appendChild(cardNumber);
            headerIndicator.appendChild(productCode);
            
            // Insert at the beginning of the container
            container.insertBefore(headerIndicator, container.firstChild);
            
            // Add scroll event listener
            container.addEventListener('scroll', function() {
                const containerTop = this.scrollTop;
                const containerHeight = this.clientHeight;
                const scrollCenter = containerTop + (containerHeight / 2);
                
                // Find which card is in the center of the viewport
                let currentCardIndex = 0;
                
                for (let i = 0; i < rows.length; i++) {
                    const row = rows[i];
                    const rowTop = row.offsetTop;
                    const rowBottom = rowTop + row.offsetHeight;
                    
                    if (scrollCenter >= rowTop && scrollCenter < rowBottom) {
                        currentCardIndex = i;
                        break;
                    } else if (scrollCenter >= rowBottom && i === rows.length - 1) {
                        currentCardIndex = i;
                    } else if (scrollCenter < rowTop) {
                        currentCardIndex = Math.max(0, i - 1);
                        break;
                    }
                }
                
                const newCardNumber = currentCardIndex + 1;
                const currentDisplayNumber = cardNumber.textContent;
                
                // Update card number
                if (currentDisplayNumber !== String(newCardNumber)) {
                    cardNumber.textContent = newCardNumber;
                }
                
                // Update product code dynamically from current row
                const currentRow = rows[currentCardIndex];
                if (currentRow) {
                    const cells = currentRow.querySelectorAll('td');
                    if (cells.length > 1) {
                        const itemCode = cells[1].textContent.trim();
                        const match = itemCode.match(/^([A-Z]+\d*)/);
                        if (match && productCode.textContent !== match[1]) {
                            productCode.textContent = match[1];
                        }
                    }
                }
            }, { passive: true });
            
            // Trigger initial update
            container.dispatchEvent(new Event('scroll'));
        });
        
        console.log(`✅ Dynamic card numbers setup for ${tableContainers.length} tables`);
    }
}

// Export for use in HTML pages
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { setupResponsiveTables, setupDynamicCardNumbers };
}
